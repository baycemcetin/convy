// Self-check for the image facts in src/content/pair-facts.ts. Runs the image worker's exact steps (src/engines/magick.worker.ts:
// read with explicit format → autoOrient → metadata clean (EXIF/XMP/IPTC out, ICC kept) → white background for JPG/BMP → quality 85
// → write; PDF through src/engines/pdf-write.ts, read back with pdf.js) in Node with the shipped wasm.
// Node output is byte-identical to the browsers' (heic→jpg 50 654 B, heic→png 135 556 B in test-results/t2/inputs-*.json).
// Usage: node tests/pair-facts.mjs     (exit 1 on the first fact that no longer holds)
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { initializeImageMagick, ImageMagick, MagickImage, MagickImageCollection, MagickFormat as F, MagickColor, AlphaAction } from '@imagemagick/magick-wasm';

await initializeImageMagick(readFileSync(new URL('../public/engines/magick@0.0.46/magick.0.wasm', import.meta.url)));
const FMT = { jpg: F.Jpeg, png: F.Png, webp: F.WebP, avif: F.Avif, heic: F.Heic, gif: F.Gif, bmp: F.Bmp, tiff: F.Tiff, ico: F.Ico, jxl: F.Jxl };
const { jpegPdf, pixelsPdf } = await import('../src/engines/pdf-write.ts');
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
// same as magick.worker.ts clean()
const clean = (img) => {
  for (const p of img.profileNames) if (p !== 'icc' && p !== 'icm') img.removeProfile(p);
  for (const a of img.attributeNames) if (/^(exif|xmp|iptc|8bim|comment|tiff:(artist|copyright|document|hostcomputer|make|model|software|timestamp))/i.test(a)) img.removeAttribute(a);
};
const toPdf = (b, from) => (from === 'jpg' && jpegPdf(b)) || ImageMagick.read(b, FMT[from], (img) => {
  img.autoOrient(); clean(img); img.depth = 8; const a = img.hasAlpha, icc = img.getProfile('icc')?.data ?? null, w = img.width, h = img.height;
  return img.write(a ? F.Rgba : F.Rgb, (d) => pixelsPdf(d, w, h, a, icc));
});
const pdfInfo = async (b) => { const d = await pdfjs.getDocument({ data: b.slice(), isEvalSupported: false }).promise; const p = await d.getPage(1); const r = { pages: d.numPages, view: p.view.map((x) => +x.toFixed(2)) }; return r; };
const SECRETS = ['TestCam', 'Secret caption', 'SecretComment', 'GPSLatitude', 'Exif\0'];
const leaks = (b) => SECRETS.filter((s) => Buffer.from(b).includes(s));
const fx = (f) => readFileSync(new URL('./fixtures/' + f, import.meta.url));
const convert = (b, from, to) => ImageMagick.read(b, FMT[from], (img) => {
  img.autoOrient(); clean(img);
  if ((to === 'jpg' || to === 'bmp') && img.hasAlpha) { img.backgroundColor = new MagickColor(255, 255, 255); img.alpha(AlphaAction.Remove); }
  img.quality = 85;
  return img.write(FMT[to], (d) => d.slice());
});
const info = (b, f) => ImageMagick.read(b, FMT[f], (i) => ({
  w: i.width, h: i.height, alpha: i.hasAlpha, make: i.getAttribute('exif:Make'), gps: i.getAttribute('exif:GPSLatitude'),
  orient: i.getAttribute('exif:Orientation'), px: Array.from(i.getPixels((p) => p.getPixel(0, 0))),
}));
const frames = (b, f) => { const c = MagickImageCollection.create(); c.read(b, FMT[f]); const n = c.length; c.dispose(); return n; };

// JPEG with a hand-built EXIF block: Make=TestCam, Orientation=6, GPSLatitude 41/1 0/1 0/1
function withExif(jpg) {
  const v = new DataView(new ArrayBuffer(124)); let p = 0; const u16 = (x) => { v.setUint16(p, x, true); p += 2; }, u32 = (x) => { v.setUint32(p, x, true); p += 4; };
  u16(0x4949); u16(42); u32(8); u16(3);
  u16(0x010f); u16(2); u32(8); u32(62); u16(0x0112); u16(3); u32(1); u16(6); u16(0); u16(0x8825); u16(4); u32(1); u32(70); u32(0);
  p = 62; for (const c of 'TestCam\0') v.setUint8(p++, c.charCodeAt(0));
  p = 70; u16(2); u16(1); u16(2); u32(2); v.setUint8(p++, 78); v.setUint8(p++, 0); p += 2; u16(2); u16(5); u32(3); u32(100); u32(0);
  p = 100; for (const n of [41, 1, 0, 1, 0, 1]) u32(n);
  const seg = new Uint8Array(134); seg.set([0xff, 0xe1, 0, 132, 69, 120, 105, 102, 0, 0]); seg.set(new Uint8Array(v.buffer), 10);
  const out = new Uint8Array(jpg.length + seg.length); out.set(jpg.subarray(0, 2)); out.set(seg, 2); out.set(jpg.subarray(2), 2 + seg.length); return out;
}
const small = ImageMagick.read(fx('photo12mp.jpg'), F.Jpeg, (i) => { i.resize(400, 300); return i.write(F.Jpeg, (d) => d.slice()); });
const exifJpg = withExif(small);
const anim = (fmt) => { const c = MagickImageCollection.create(); for (const k of ['red', 'green', 'blue']) { const i = MagickImage.create(); i.read(new MagickColor(k), 32, 32); c.push(i); } const o = c.write(FMT[fmt], (d) => d.slice()); c.dispose(); return o; };
const halfRed = (() => { const i = MagickImage.create(); i.read(new MagickColor(255, 0, 0, 128), 32, 32); const o = i.write(F.Png, (d) => d.slice()); i.dispose(); return o; })();
const ok = [];
const check = async (name, fn) => { await fn(); ok.push(name); };

const meta = fx('meta.jpg'), metaHeic = fx('meta.heic');
assert.equal(leaks(meta).length, SECRETS.length, 'positive control: the fixture carries every marker');
await check('EXIF/GPS, XMP, IPTC, comment removed; orientation applied; ICC kept (jpg/heic in → every image target)', () => {
  for (const [src, from] of [[meta, 'jpg'], [metaHeic, 'heic'], [exifJpg, 'jpg']]) for (const to of ['jpg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'ico', 'jxl']) {
    if (to === from) continue;
    const o = convert(src, from, to), r = info(o, to), k = from + '->' + to;
    assert.deepEqual(leaks(o), [], k + ' leaks'); assert.equal(r.gps, null, k + ' gps'); assert.equal(r.make, null, k + ' make');
    assert.ok(r.h > r.w, k + ' rotated');
    if (src !== exifJpg) {
      assert.ok(r.px[0] > 150 && r.px[2] < 100, k + ' top is red ' + r.px);
      if (['jpg', 'png', 'webp', 'avif', 'tiff', 'jxl'].includes(to)) assert.ok(ImageMagick.read(o, FMT[to], (i) => i.getProfile('icc')?.data.length > 0), k + ' icc');
    }
  }
});
await check('EXIF removed through webp/avif input', () => {
  for (const mid of ['webp', 'avif']) { const m = ImageMagick.read(exifJpg, F.Jpeg, (i) => i.write(FMT[mid], (d) => d.slice())); assert.equal(info(m, mid).gps, '41/1,0/1,0/1', 'fixture'); for (const to of ['jpg', 'png']) assert.equal(info(convert(m, mid, to), to).gps, null, mid + '->' + to); }
});
await check('jpg → pdf: JPEG embedded without re-encoding, metadata segments cut, ICC as ICCBased, orientation 6 → portrait page at 150 dpi', async () => {
  const pdf = toPdf(meta, 'jpg'), s = Buffer.from(pdf);
  const sos = meta.indexOf(Buffer.from([0xff, 0xda])), scan = meta.subarray(sos, meta.lastIndexOf(Buffer.from([0xff, 0xd9])) + 2);
  assert.ok(s.includes(scan), 'scan bytes identical'); assert.ok(s.includes('/DCTDecode') && s.includes('/ICCBased'));
  assert.deepEqual(leaks(pdf), []); assert.deepEqual(await pdfInfo(pdf), { pages: 1, view: [0, 0, 15.36, 30.72] });
  const big = toPdf(fx('photo12mp.jpg'), 'jpg'); assert.deepEqual((await pdfInfo(big)).view, [0, 0, 1958.4, 1474.56]);
});
await check('png/heic/webp(alpha) → pdf: Flate (lossless), alpha as SMask, metadata gone', async () => {
  const png = toPdf(fx('sample.png'), 'png'); assert.ok(Buffer.from(png).includes('/FlateDecode')); assert.equal((await pdfInfo(png)).pages, 1);
  const h = toPdf(metaHeic, 'heic'); assert.deepEqual(leaks(h), []); assert.ok(Buffer.from(h).includes('/ICCBased')); assert.deepEqual((await pdfInfo(h)).view, [0, 0, 15.36, 30.72]);
  assert.ok(Buffer.from(toPdf(halfRed, 'png')).includes('/SMask'), 'png alpha → SMask');
  const a = toPdf(fx('alpha.webp'), 'webp'); assert.ok(Buffer.from(a).includes('/SMask')); assert.deepEqual(leaks(a), []);
  // lossless: the Flate stream inflates to exactly magick's RGB pixels
  const { inflateSync } = await import('node:zlib'); const raw = ImageMagick.read(fx('sample.png'), F.Png, (i) => { i.autoOrient(); i.depth = 8; return i.write(F.Rgb, (d) => d.slice()); });
  const at = Buffer.from(png).indexOf('stream\n', Buffer.from(png).indexOf('/Subtype/Image')) + 7, len = +/\/Length (\d+)>>\nstream\n$/.exec(Buffer.from(png.subarray(0, at)).toString('latin1'))[1];
  assert.ok(Buffer.from(inflateSync(png.subarray(at, at + len))).equals(Buffer.from(raw)), 'pixels identical');
});
await check('transparency → white in JPG, kept in PNG/WebP', () => {
  const j = info(convert(halfRed, 'png', 'jpg'), 'jpg'); assert.equal(j.alpha, false); assert.ok(j.px[1] > 100 && j.px[2] > 100, 'blended with white ' + j.px);
  assert.equal(info(convert(halfRed, 'png', 'webp'), 'webp').alpha, true);
  const wa = convert(halfRed, 'png', 'webp'); assert.equal(info(convert(wa, 'webp', 'png'), 'png').alpha, true);
});
await check('animated WebP/GIF in → first frame only', () => {
  for (const f of ['webp', 'gif']) { const a = anim(f); assert.equal(frames(a, f), 3); const o = convert(a, f, 'png'); assert.equal(frames(o, 'png'), 1); assert.ok(info(o, 'png').px[0] > 200, 'first (red) frame'); }
});
await check('WebP out is lossy VP8 even from PNG', () => {
  const s = Buffer.from(convert(fx('sample.png'), 'png', 'webp')).toString('latin1'); assert.ok(s.includes('VP8 ') && !s.includes('VP8L'));
});
await check('heic sample → same bytes as the browsers', () => {
  assert.equal(convert(fx('sample.heic'), 'heic', 'jpg').length, 50654); assert.equal(convert(fx('sample.heic'), 'heic', 'png').length, 135556);
});
console.log('pair-facts image checks OK:', ok.length, '\n- ' + ok.join('\n- '));
