// Zero-dependency static server for dist/ that applies dist/_headers exactly like Cloudflare does
// (path patterns, rules merged), plus ETag/304 so the WebKit revalidation path is exercised (headers on 304 too).
// `COEP=1` adds Cross-Origin-Embedder-Policy: require-corp (to compare). Usage: node scripts/serve.mjs [--port 4321]
import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };
const root = resolve('dist');
const rules = readFileSync(join(root, '_headers'), 'utf8').split(/\n(?=\/)/).map((b) => {
  const [pat, ...lines] = b.trim().split('\n');
  return { re: new RegExp('^' + pat.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'), h: lines.map((l) => l.trim().split(/:\s(.*)/s).slice(0, 2)) };
});
const port = Number(process.argv[process.argv.indexOf('--port') + 1]) || 4321;

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  for (const r of rules) if (r.re.test(path)) for (const [k, v] of r.h) res.setHeader(k, v);
  if (process.env.COEP) res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  if (path.endsWith('/')) path += 'index.html';
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  let st;
  try { st = statSync(file); if (st.isDirectory()) { file = join(file, 'index.html'); st = statSync(file); } } catch { return res.writeHead(404).end('not found'); }
  const etag = `"${st.size.toString(16)}-${st.mtimeMs.toString(16)}"`;
  res.setHeader('ETag', etag);
  if (!res.hasHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate'); // Cloudflare default
  if (req.headers['if-none-match'] === etag) return res.writeHead(304).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Content-Length': st.size });
  req.method === 'HEAD' ? res.end() : createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`dist/ on http://127.0.0.1:${port}/ with dist/_headers${process.env.COEP ? ' + COEP' : ''}`));
