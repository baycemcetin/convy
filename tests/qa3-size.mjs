// THE island JS budget (single definition): 38 KB = 38 000 bytes brotli (q11), first load = the island's scripts/modulepreloads/astro-island urls
// + everything they statically import (transitive). Lazy chunks (engines, workers, classify, sniff) are not counted. Usage: npm run size (exit 1 over budget)
const BUDGET = 38000; let over = false;
import { readFileSync, existsSync } from 'node:fs';
import { brotliCompressSync, constants } from 'node:zlib';
import { join, dirname, resolve } from 'node:path';
const root = resolve('dist'); const seen = new Map();
const br = (b) => brotliCompressSync(b, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
function walk(file) {
  if (seen.has(file) || !existsSync(file)) return; const src = readFileSync(file); seen.set(file, { raw: src.length, br: br(src) });
  const s = src.toString(); for (const m of s.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[^'"()]*?from\s*)?["']([^"']+\.js)["']/g)) if (m[1].startsWith('.') || m[1].startsWith('/')) walk(m[1].startsWith('/') ? join(root, m[1]) : resolve(dirname(file), m[1]));
}
for (const page of ['index.html', 'tr/index.html']) {
  seen.clear(); const html = readFileSync(join(root, page), 'utf8');
  const urls = new Set([...html.matchAll(/(?:src|href)="(\/[^"]+\.js)"/g)].map((m) => m[1]));
  // astro-island: component-url / renderer-url
  for (const m of html.matchAll(/(?:component-url|renderer-url)="([^"]+\.js)"/g)) urls.add(m[1]);
  for (const u of urls) walk(join(root, u));
  const tot = [...seen.values()].reduce((a, v) => ({ raw: a.raw + v.raw, br: a.br + v.br }), { raw: 0, br: 0 });
  console.log(page, JSON.stringify({ files: [...seen.keys()].map((k) => k.replace(root, '') + ' ' + seen.get(k).br), bytes: tot.br, rawKB: +(tot.raw / 1000).toFixed(2), brKB: +(tot.br / 1000).toFixed(2), brKiB: +(tot.br / 1024).toFixed(2) }, null, 1)); if (tot.br > BUDGET) over = true;
}
process.exit(over ? 1 : 0);
