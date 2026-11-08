// Regenerates tests/fixtures/fmt/ (Format Dilim 1): one small sample per new input format. Synthetic content only (testsrc, sine,
// sample.png/sample.md of this repo), no third-party media. Images: magick-wasm; documents: pandoc-wasm; AV: system ffmpeg (needs
// libx264), Theora OGV through ffmpeg.wasm (Homebrew ffmpeg has no libtheora); AMR is written by hand (no encoder anywhere: random
// 12.2 kbit/s frames, any payload is a valid frame). APE and MPC have no encoder here either and are not in the format list.
// Usage: node tests/make-fmt-fixtures.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
const NM = new URL('../node_modules/', import.meta.url).pathname, FX = new URL('./fixtures/', import.meta.url).pathname, OUT = FX + 'fmt/';
mkdirSync(OUT, { recursive: true });
const put = (n, b) => writeFileSync(OUT + n, b);

// images
const mw = await import(NM + '@imagemagick/magick-wasm/dist/index.js');
await mw.initializeImageMagick(readFileSync(NM + '@imagemagick/magick-wasm/dist/x86/magick.wasm'));
const { ImageMagick, MagickFormat: M } = mw;
const png = readFileSync(FX + 'sample.png');
const IMG = { 'sample.qoi': M.Qoi, 'sample.jp2': M.Jp2, 'sample.j2k': M.J2k, 'sample.tga': M.Tga, 'sample.exr': M.Exr, 'sample.hdr': M.Hdr,
  'sample.dds': M.Dds, 'sample.pcx': M.Pcx, 'sample.pbm': M.Pbm, 'sample.pgm': M.Pgm, 'sample.ppm': M.Ppm, 'sample.pnm': M.Pnm, 'sample.pam': M.Pam,
  'sample.cur': M.Cur, 'sample.xpm': M.Xpm, 'sample.xbm': M.Xbm };
for (const [n, f] of Object.entries(IMG)) put(n, ImageMagick.read(png, M.Png, (img) => { img.resize(n.endsWith('.cur') ? 32 : 160, n.endsWith('.cur') ? 32 : 90); return img.write(f, (d) => d.slice()); }));
// magick's CUR writer emits an ICO header (type 1, planes/bit count): make it a real cursor, type 2 with hotspot 0,0
const cur = readFileSync(OUT + 'sample.cur'); cur[2] = 2; cur.fill(0, 10, 14); put('sample.cur', cur);
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f60"/><stop offset="1" stop-color="#06f"/></linearGradient></defs>
  <rect width="240" height="160" fill="url(#g)"/><path d="M20 140 L120 20 L220 140 Z" fill="none" stroke="#fff" stroke-width="6"/>
  <text x="12" y="32" font-family="sans-serif" font-size="22" fill="#fff">Convy ğüş</text>
</svg>\n`;
put('sample.svg', svg);
put('sample.svgz', gzipSync(svg));
put('nosize.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100"><rect width="400" height="100" fill="#2a6"/></svg>\n');

// documents (pandoc writes them from sample.md; CSV/TSV by hand)
const { convert } = await import(NM + 'pandoc-wasm/src/index.node.js');
const md = readFileSync(FX + 'sample.md');
const DOC = { 'sample.rst': 'rst', 'sample.dbk': 'docbook5', 'sample.ipynb': 'ipynb', 'sample.typ': 'typst', 'sample.opml': 'opml', 'sample.org': 'org',
  'sample.fb2': 'fb2', 'sample.xml': 'jats', 'sample.1': 'man', 'sample.adoc': 'asciidoc' };
for (const [n, to] of Object.entries(DOC)) {
  const r = await convert({ from: 'markdown', to, standalone: true, 'input-files': ['in.md'], 'output-file': 'out', metadata: { title: 'Convy test' } }, null, { 'in.md': new Blob([md]) });
  put(n, new Uint8Array(await r.files.out.arrayBuffer()));
}
put('sample.csv', 'name,city,count\nAyşe,İstanbul,3\nBob,"Leeds, UK",5\n');
put('sample.tsv', 'name\tcity\tcount\nAyşe\tİstanbul\t3\nBob\tLeeds\t5\n');

// audio / video (system ffmpeg)
const Q = ['-hide_banner', '-loglevel', 'error', '-y'];
const A = ['-f', 'lavfi', '-i', 'sine=frequency=440:duration=1:sample_rate=44100'];
const V = ['-f', 'lavfi', '-i', 'testsrc=duration=1:size=320x240:rate=24'];
const ff = (...a) => { const r = spawnSync('ffmpeg', [...Q, ...a]); if (r.status) throw new Error(a.at(-1) + ': ' + r.stderr); };
const AUD = {
  'sample.aac': ['-c:a', 'aac', '-b:a', '96k'], 'alac.m4a': ['-c:a', 'alac'], 'sample.aiff': ['-c:a', 'pcm_s16be'],
  'sample.aifc': ['-c:a', 'pcm_alaw', '-f', 'aiff'], 'sample.wma': ['-c:a', 'wmav2', '-b:a', '96k'], 'sample.ac3': ['-c:a', 'ac3', '-b:a', '96k'],
  'sample.caf': ['-c:a', 'alac'], 'sample.mp2': ['-c:a', 'mp2', '-b:a', '128k'], 'sample.au': ['-c:a', 'pcm_s16be'],
  'sample.m4b': ['-c:a', 'aac', '-b:a', '64k', '-f', 'ipod', '-brand', 'M4B '], 'sample.tta': ['-c:a', 'tta'], 'sample.voc': ['-c:a', 'pcm_u8', '-ar', '22050'],
};
for (const [n, a] of Object.entries(AUD)) ff(...A, ...a, OUT + n);
const H264 = ['-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p'];
const VID = {
  'sample.mpg': ['-c:v', 'mpeg1video', '-b:v', '800k', '-c:a', 'mp2', '-f', 'mpeg'], 'sample.ts': [...H264, '-c:a', 'aac', '-f', 'mpegts'],
  'sample.m2ts': [...H264, '-c:a', 'aac', '-f', 'mpegts', '-mpegts_m2ts_mode', '1'], 'sample.flv': ['-c:v', 'flv1', '-c:a', 'mp3', '-ar', '44100'],
  'sample.f4v': [...H264, '-c:a', 'aac', '-f', 'f4v'], 'sample.wmv': ['-c:v', 'wmv2', '-b:v', '800k', '-c:a', 'wmav2'],
  'sample.3gp': ['-c:v', 'h263', '-s', '176x144', '-c:a', 'aac', '-ar', '22050', '-ac', '1', '-f', '3gp'],
  'sample.3g2': [...H264, '-c:a', 'aac', '-f', '3g2'], 'sample.vob': ['-c:v', 'mpeg2video', '-b:v', '1M', '-c:a', 'ac3', '-ar', '48000', '-f', 'vob'],
  'sample.mxf': ['-c:v', 'mpeg2video', '-b:v', '2M', '-s', '720x576', '-r', '25', '-c:a', 'pcm_s16le', '-ar', '48000', '-f', 'mxf'],
};
for (const [n, a] of Object.entries(VID)) ff(...V, ...A, '-shortest', ...a, OUT + n);

// Theora OGV through ffmpeg.wasm (the same core the site ships), from an MPEG-1 intermediate
globalThis.self = { location: { href: 'file:///' } };
const core = await (await import(NM + '@ffmpeg/core/dist/esm/ffmpeg-core.js')).default({ wasmBinary: readFileSync(NM + '@ffmpeg/core/dist/esm/ffmpeg-core.wasm') });
core.FS.writeFile('in.mpg', readFileSync(OUT + 'sample.mpg'));
core.exec('-i', 'in.mpg', '-c:v', 'libtheora', '-q:v', '5', '-c:a', 'libvorbis', '-q:a', '3', 'out.ogv');
put('sample.ogv', core.FS.readFile('out.ogv'));

// AMR-NB: "#!AMR\n" + 50 frames of mode 7 (12.2 kbit/s: header 0x3C + 31 payload bytes), 1 s; fixed seed
let x = 7; const rnd = () => (x = (x * 1103515245 + 12345) & 0x7fffffff) & 0xff;
put('sample.amr', Buffer.concat([Buffer.from('#!AMR\n'), ...Array.from({ length: 50 }, () => Buffer.from([0x3c, ...Array.from({ length: 31 }, rnd)]))]));

rmSync(OUT + 'out', { force: true });
console.log('fixtures/fmt written');
