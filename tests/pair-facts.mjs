// Self-check for the image facts in src/content/pair-facts.ts. Runs the image worker's exact steps (src/engines/magick.worker.ts:
// read with explicit format → autoOrient → white background for JPG/BMP → quality 85 → write) in Node with the shipped wasm.
// Node output is byte-identical to the browsers' (heic→jpg 50 654 B, heic→png 135 556 B in test-results/t2/inputs-*.json).
// Usage: node tests/pair-facts.mjs     (exit 1 on the first fact that no longer holds)
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { initializeImageMagick, ImageMagick, MagickImage, MagickImageCollection, MagickFormat as F, MagickColor, AlphaAction } from '@imagemagick/magick-wasm';

await initializeImageMagick(readFileSync(new URL('../public/engines/magick@0.0.46/magick.0.wasm', import.meta.url)));
const FMT = { jpg: F.Jpeg, png: F.Png, webp: F.WebP, avif: F.Avif, heic: F.Heic, gif: F.Gif };
const fx = (f) => readFileSync(new URL('./fixtures/' + f, import.meta.url));
const convert = (b, from, to) => ImageMagick.read(b, FMT[from], (img) => {
  img.autoOrient();
  if (to === 'jpg' && img.hasAlpha) { img.backgroundColor = new MagickColor(255, 255, 255); img.alpha(AlphaAction.Remove); }
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
const check = (name, fn) => { fn(); ok.push(name); };

check('EXIF incl. GPS kept, orientation applied (jpg/png/webp/avif out)', () => {
  for (const to of ['jpg', 'png', 'webp', 'avif']) {
    const r = info(convert(exifJpg, 'jpg', to), to);
    assert.equal(r.make, 'TestCam', to); assert.equal(r.gps, '41/1,0/1,0/1', to); assert.equal(r.orient, '1', to); assert.ok(r.h > r.w, to + ' rotated');
  }
});
check('EXIF kept through webp/avif input', () => {
  for (const mid of ['webp', 'avif']) { const m = ImageMagick.read(exifJpg, F.Jpeg, (i) => i.write(FMT[mid], (d) => d.slice())); for (const to of ['jpg', 'png']) assert.equal(info(convert(m, mid, to), to).gps, '41/1,0/1,0/1', mid + '->' + to); }
});
check('transparency → white in JPG, kept in PNG/WebP', () => {
  const j = info(convert(halfRed, 'png', 'jpg'), 'jpg'); assert.equal(j.alpha, false); assert.ok(j.px[1] > 100 && j.px[2] > 100, 'blended with white ' + j.px);
  assert.equal(info(convert(halfRed, 'png', 'webp'), 'webp').alpha, true);
  const wa = convert(halfRed, 'png', 'webp'); assert.equal(info(convert(wa, 'webp', 'png'), 'png').alpha, true);
});
check('animated WebP/GIF in → first frame only', () => {
  for (const f of ['webp', 'gif']) { const a = anim(f); assert.equal(frames(a, f), 3); const o = convert(a, f, 'png'); assert.equal(frames(o, 'png'), 1); assert.ok(info(o, 'png').px[0] > 200, 'first (red) frame'); }
});
check('WebP out is lossy VP8 even from PNG', () => {
  const s = Buffer.from(convert(fx('sample.png'), 'png', 'webp')).toString('latin1'); assert.ok(s.includes('VP8 ') && !s.includes('VP8L'));
});
check('heic sample → same bytes as the browsers', () => {
  assert.equal(convert(fx('sample.heic'), 'heic', 'jpg').length, 50654); assert.equal(convert(fx('sample.heic'), 'heic', 'png').length, 135556);
});
console.log('pair-facts image checks OK:', ok.length, '\n- ' + ok.join('\n- '));
