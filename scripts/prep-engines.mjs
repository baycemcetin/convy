// Copies engine binaries into public/engines/<engine>@<version>/ and writes manifest.json (MIMARI Ek A).
// Wasm over the Cloudflare 25 MiB per-file limit is split into 20 MiB parts named `<stem>.<n>.wasm`
// (the .wasm extension keeps Cloudflare on application/wasm, which is in its default compression list).
// manifest: size = raw bytes on device, transfer = sum of gzip -6 sizes (download upper bound), sha256 per part.
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const PART = 20 * 1024 * 1024;
const nm = 'node_modules';
const pkgVer = (p) => JSON.parse(readFileSync(`${nm}/${p}/package.json`, 'utf8')).version;

function engine(id, pkg, files) {
  const version = pkgVer(pkg);
  const dir = `public/engines/${id}@${version}`;
  if (existsSync(`${dir}/manifest.json`)) return console.log(`${dir} up to date`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const parts = [], side = [];
  let size = 0, transfer = 0;
  for (const [src, name] of files) {
    const buf = readFileSync(`${nm}/${pkg}/${src}`);
    const write = (b, n) => {
      writeFileSync(`${dir}/${n}`, b);
      size += b.length; transfer += gzipSync(b, { level: 6 }).length;
      return { name: n, size: b.length, sha256: createHash('sha256').update(b).digest('hex') };
    };
    if (!name.endsWith('.wasm')) { side.push(write(buf, name)); continue; }
    const stem = name.slice(0, -5);
    for (let i = 0, n = 0; i < buf.length; i += PART, n++) parts.push(write(buf.subarray(i, i + PART), `${stem}.${n}.wasm`));
  }
  writeFileSync(`${dir}/manifest.json`, JSON.stringify({ engine: id, version, size, transfer, parts, side }, null, 1));
  console.log(`${dir}: ${parts.length} part(s), raw ${(size / 1e6).toFixed(1)} MB, transfer ${(transfer / 1e6).toFixed(1)} MB`);
}

engine('ffmpeg-st', '@ffmpeg/core', [['dist/esm/ffmpeg-core.js', 'ffmpeg-core.js'], ['dist/esm/ffmpeg-core.wasm', 'ffmpeg-core.wasm']]);
engine('magick', '@imagemagick/magick-wasm', [['dist/x86/magick.wasm', 'magick.wasm']]);
