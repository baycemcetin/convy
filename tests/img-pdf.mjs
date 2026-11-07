// Image → PDF and metadata removal through the real UI, one browser per run. Each output is downloaded and checked:
// PDF opened again with the site's own pdf.js (page count, size, rendered colours: orientation), JPEG scan bytes embedded as is;
// image outputs read back with magick-wasm in Node (no EXIF/GPS/XMP/IPTC, ICC kept, orientation applied).
// Usage: node tests/img-pdf.mjs [chromium|firefox|webkit]   (`npm run preview` on :4321)
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { initializeImageMagick, ImageMagick, MagickFormat as F } from '@imagemagick/magick-wasm';
import { launch, open, run } from './qa2-lib.mjs';

await initializeImageMagick(readFileSync(new URL('../public/engines/magick@0.0.46/magick.0.wasm', import.meta.url)));
const name = process.argv[2] || 'chromium';
const fx = (f) => readFileSync(new URL('./fixtures/' + f, import.meta.url));
const SECRETS = ['TestCam', 'Secret caption', 'SecretComment', 'GPSLatitude', 'Exif\0'];
const leaks = (b) => SECRETS.filter((s) => b.includes(s));
const FMT = { JPG: F.Jpeg, PNG: F.Png, WEBP: F.WebP, TIFF: F.Tiff };
const browser = await launch(name);
const page = await open(await browser.newContext({ acceptDownloads: true }));

// render page 1 with pdf.js from the site's engine path; colour samples at 25 % and 75 % height (centre column)
const render = (buf) => page.evaluate(async (bytes) => {
  const base = '/engines/pdfjs@6.5.438/';
  const m = await import(base + 'pdf.min.mjs'); m.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs';
  const doc = await m.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false }).promise, pg = await doc.getPage(1);
  const vp = pg.getViewport({ scale: 4 }), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
  await pg.render({ canvas: c, canvasContext: c.getContext('2d'), viewport: vp }).promise;
  const at = (y) => Array.from(c.getContext('2d').getImageData(c.width >> 1, Math.floor(c.height * y), 1, 1).data);
  return { pages: doc.numPages, view: pg.view.map((x) => +x.toFixed(2)), top: at(0.25), bottom: at(0.75) };
}, [...buf]);
const red = (p) => p[0] > 180 && p[2] < 90, blue = (p) => p[2] > 180 && p[0] < 90;

const res = [];
const cases = [
  ['meta.jpg', 'PDF', async (b, r) => {
    const meta = fx('meta.jpg'), sos = meta.indexOf(Buffer.from([0xff, 0xda]));
    assert.ok(b.includes(meta.subarray(sos, meta.lastIndexOf(Buffer.from([0xff, 0xd9])) + 2)), 'JPEG scan embedded byte for byte');
    assert.ok(b.includes('/DCTDecode') && b.includes('/ICCBased')); assert.deepEqual(leaks(b), []);
    assert.deepEqual([r.pages, r.view], [1, [0, 0, 15.36, 30.72]]); assert.ok(red(r.top) && blue(r.bottom), 'orientation 6 applied ' + r.top + ' / ' + r.bottom);
  }],
  ['sample.png', 'PDF', async (b, r) => { assert.ok(b.includes('/FlateDecode') && !b.includes('/DCTDecode')); assert.equal(r.pages, 1); }],
  ['sample.heic', 'PDF', async (b, r) => { assert.equal(r.pages, 1); assert.ok(r.view[2] > 0); }],
  ['meta.heic', 'PDF', async (b, r) => { assert.deepEqual(leaks(b), []); assert.ok(b.includes('/ICCBased')); assert.ok(red(r.top) && blue(r.bottom), 'heic orientation'); }],
  ['alpha.webp', 'PDF', async (b, r) => { assert.ok(b.includes('/SMask')); assert.deepEqual(leaks(b), []); assert.ok(r.top[0] > 240 && r.top[1] > 100 && r.top[1] < 160, 'half-transparent red over white ' + r.top); }],
  ...['PNG', 'WEBP', 'TIFF'].map((to) => ['meta.jpg', to]), ...['JPG', 'PNG'].map((to) => ['meta.heic', to]),
];
for (const [file, to, check] of cases) {
  console.error('case', file, to); const o = await run(page, file, to, { save: true }); const row = { file, to, name: o.saved?.name, bytes: o.saved?.bytes, ms: o.ms, ok: false };
  try {
    assert.ok(o.buf, 'saved'); assert.equal(o.saved.name, file.replace(/\.[^.]+$/, '.' + to.toLowerCase()));
    if (to === 'PDF') await check(o.buf, await render(o.buf));
    else ImageMagick.read(o.buf, FMT[to], (i) => {
      assert.deepEqual(leaks(o.buf), []); assert.equal(i.getAttribute('exif:GPSLatitude'), null); assert.ok(i.getProfile('icc')?.data.length > 0, 'icc kept');
      assert.ok(i.height > i.width, 'rotated'); const px = i.getPixels((p) => p.getPixel(16, 4)); assert.ok(px[0] > 150 && px[2] < 100, 'top is red ' + px);
    });
    row.ok = true;
  } catch (e) { row.err = String(e.message || e).slice(0, 200); }
  res.push(row);
}
console.log(JSON.stringify({ browser: name, res, errs: page.errs }, null, 1));
await browser.close();
process.exit(res.every((r) => r.ok) && !page.errs.length ? 0 : 1);
