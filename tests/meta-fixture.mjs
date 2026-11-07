// Builds the metadata fixtures (committed; rerun only to change them): tests/fixtures/meta.jpg = 64×32 px, left half red, right half
// blue, with EXIF (Make=TestCam, Orientation=6, GPSLatitude 41/1 0/1 0/1), XMP (GPS), IPTC caption, COM and a Display P3 ICC;
// meta.heic = the same through macOS sips (keeps EXIF+GPS); alpha.webp = 32×32 half-transparent WebP with the same EXIF.
// Usage: node tests/meta-fixture.mjs   (macOS: sips and /System/Library/ColorSync/Profiles/Display P3.icc)
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { initializeImageMagick, MagickImage, MagickImageCollection, MagickColor, MagickFormat as F, ImageMagick } from '@imagemagick/magick-wasm';

await initializeImageMagick(readFileSync(new URL('../public/engines/magick@0.0.46/magick.0.wasm', import.meta.url)));
const out = (f) => new URL('./fixtures/' + f, import.meta.url);
const seg = (marker, body) => { const s = new Uint8Array(body.length + 4); s.set([0xff, marker, (body.length + 2) >> 8, (body.length + 2) & 255]); s.set(body, 4); return s; };
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const asc = (s) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

function exif() { // same block as tests/pair-facts.mjs withExif()
  const v = new DataView(new ArrayBuffer(124)); let p = 0; const u16 = (x) => { v.setUint16(p, x, true); p += 2; }, u32 = (x) => { v.setUint32(p, x, true); p += 4; };
  u16(0x4949); u16(42); u32(8); u16(3);
  u16(0x010f); u16(2); u32(8); u32(62); u16(0x0112); u16(3); u32(1); u16(6); u16(0); u16(0x8825); u16(4); u32(1); u32(70); u32(0);
  p = 62; for (const c of 'TestCam\0') v.setUint8(p++, c.charCodeAt(0));
  p = 70; u16(2); u16(1); u16(2); u32(2); v.setUint8(p++, 78); v.setUint8(p++, 0); p += 2; u16(2); u16(5); u32(3); u32(100); u32(0);
  p = 100; for (const n of [41, 1, 0, 1, 0, 1]) u32(n);
  return seg(0xe1, cat(asc('Exif\0\0'), new Uint8Array(v.buffer)));
}
const xmp = seg(0xe1, asc('http://ns.adobe.com/xap/1.0/\0<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:exif="http://ns.adobe.com/exif/1.0/" exif:GPSLatitude="41,0.0N"/></rdf:RDF></x:xmpmeta>'));
const cap = asc('Secret caption');
const iptc = seg(0xed, cat(asc('Photoshop 3.0\0' + '8BIM'), new Uint8Array([4, 4, 0, 0, 0, 0, 0, cap.length + 5, 0x1c, 2, 0x78, 0, cap.length]), cap, new Uint8Array((cap.length + 5) % 2)));
const com = seg(0xfe, asc('SecretComment'));
const icc = readFileSync('/System/Library/ColorSync/Profiles/Display P3.icc');
const app2 = seg(0xe2, cat(asc('ICC_PROFILE\0'), new Uint8Array([1, 1]), icc));

const c = MagickImageCollection.create();
for (const k of ['red', 'blue']) { const i = MagickImage.create(); i.read(new MagickColor(k), 32, 32); c.push(i); }
const base = c.appendHorizontally((i) => { i.quality = 95; return i.write(F.Jpeg, (d) => d.slice()); }); c.dispose();
const app0end = 4 + ((base[4] << 8) | base[5]); // keep JFIF APP0 first
const jpg = cat(base.subarray(0, app0end), exif(), xmp, app2, iptc, com, base.subarray(app0end));
writeFileSync(out('meta.jpg'), jpg);
execFileSync('sips', ['-s', 'format', 'heic', out('meta.jpg').pathname, '--out', out('meta.heic').pathname], { stdio: 'ignore' });
const half = MagickImage.create(); half.read(new MagickColor(255, 0, 0, 128), 32, 32);
half.setProfile('exif', exif().subarray(10));
writeFileSync(out('alpha.webp'), half.write(F.WebP, (d) => d.slice()));
for (const f of ['meta.jpg', 'meta.heic', 'alpha.webp']) ImageMagick.read(readFileSync(out(f)), (i) => console.log(f, i.width + 'x' + i.height, 'gps', i.getAttribute('exif:GPSLatitude'), 'icc', !!i.getProfile('icc'), 'alpha', i.hasAlpha));
