// Image → one-page PDF, written by hand (no PDF library): a JPEG goes in as is (DCTDecode, not re-encoded, metadata segments cut),
// anything else arrives as 8-bit RGB(A) pixels from magick and goes in Flate (fflate, lossless), alpha as an SMask.
// Imported by magick.worker.ts only: never part of the island's first load.
import { zlibSync } from 'fflate';

const DPI = 150; // page size from pixels: 4032×3024 photo → 1935×1452 pt (68×51 cm), 1920 px screenshot → 32.5 cm wide
const MAX_PT = 14400; // PDF page side limit (ISO 32000-1 Annex C)
const te = new TextEncoder();
// cm matrix [a b c d e f] per EXIF orientation, W/H = displayed page size: maps the image's unit square onto the page
const ORIENT: Record<number, (W: number, H: number) => number[]> = {
  1: (W, H) => [W, 0, 0, H, 0, 0], 2: (W, H) => [-W, 0, 0, H, W, 0], 3: (W, H) => [-W, 0, 0, -H, W, H], 4: (W, H) => [W, 0, 0, -H, 0, H],
  5: (W, H) => [0, -H, -W, 0, W, H], 6: (W, H) => [0, -H, W, 0, 0, H], 7: (W, H) => [0, H, W, 0, 0, 0], 8: (W, H) => [0, H, -W, 0, W, 0],
};

interface Img { w: number; h: number; data: Uint8Array; dct: boolean; n: number; icc?: Uint8Array | null; alpha?: Uint8Array | null; orient?: number; invert?: boolean; }

function write(im: Img): Uint8Array {
  const o = im.orient && ORIENT[im.orient] ? im.orient : 1;
  const [dw, dh] = o > 4 ? [im.h, im.w] : [im.w, im.h];
  const k = Math.min(72 / DPI, MAX_PT / Math.max(dw, dh)); // huge images: scale the page down to the limit
  const W = Math.max(3, +(dw * k).toFixed(2)), H = Math.max(3, +(dh * k).toFixed(2));
  const cs = ['', '/DeviceGray', '', '/DeviceRGB', '/DeviceCMYK'][im.n];
  // the profile is used only when it describes these pixels (an ICC's header names its colour space at byte 16)
  const iccOk = im.icc && new TextDecoder().decode(im.icc.subarray(16, 20)) === ['', 'GRAY', '', 'RGB ', 'CMYK'][im.n];
  const objs: (string | [string, Uint8Array])[] = [
    '<</Type/Catalog/Pages 2 0 R>>',
    `<</Type/Pages/Kids[3 0 R]/Count 1>>`,
    `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Resources<</XObject<</Im0 5 0 R>>>>/Contents 4 0 R>>`,
  ];
  const content = te.encode(`q ${ORIENT[o](W, H).join(' ')} cm /Im0 Do Q`);
  objs.push([`<</Length ${content.length}>>`, content]);
  const extra = (im.alpha ? '/SMask 6 0 R' : '') + (im.dct && im.n === 4 && im.invert ? '/Decode[1 0 1 0 1 0 1 0]' : '');
  const img = (n: string, cs: string, d: Uint8Array, f: string) => [`<</Type/XObject/Subtype/Image/Width ${im.w}/Height ${im.h}/ColorSpace${cs}/BitsPerComponent 8/Filter/${f}/Length ${d.length}${n}>>`, d] as [string, Uint8Array];
  objs.push(img(extra, iccOk ? '[/ICCBased 7 0 R]' : cs, im.data, im.dct ? 'DCTDecode' : 'FlateDecode'));
  objs.push(im.alpha ? img('', '/DeviceGray', im.alpha, 'FlateDecode') : '<<>>');
  if (iccOk) objs.push([`<</N ${im.n}/Length ${im.icc!.length}>>`, im.icc!]);
  const parts: Uint8Array[] = [te.encode('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')];
  let at = parts[0].length; const xref: number[] = [];
  const put = (b: Uint8Array) => { parts.push(b); at += b.length; };
  objs.forEach((ob, i) => {
    xref.push(at);
    if (typeof ob === 'string') put(te.encode(`${i + 1} 0 obj\n${ob}\nendobj\n`));
    else { put(te.encode(`${i + 1} 0 obj\n${ob[0]}\nstream\n`)); put(ob[1]); put(te.encode('\nendstream\nendobj\n')); }
  });
  put(te.encode(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${xref.map((x) => String(x).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${at}\n%%EOF\n`));
  const out = new Uint8Array(at); let p = 0; for (const b of parts) { out.set(b, p); p += b.length; }
  return out;
}

/** JPEG → PDF without re-encoding; null when the JPEG is not plain baseline/progressive 8-bit (caller re-encodes through magick).
 *  Kept: every coding segment and the scan, byte for byte, APP0 (JFIF) and APP14 (Adobe colour transform). Cut: APP1–13/15
 *  (EXIF incl. GPS, XMP, IPTC, MPF) and COM, and anything after the first image's EOI (iPhone gain map / depth images).
 *  The ICC (APP2) goes into the PDF as an ICCBased colour space, the EXIF orientation into the page matrix. */
export function jpegPdf(b: Uint8Array): Uint8Array | null {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  const keep: Uint8Array[] = [b.subarray(0, 2)], icc: Uint8Array[] = [];
  let p = 2, w = 0, h = 0, n = 0, orient = 1, invert = false;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) return null;
    const m = b[p + 1];
    if (m === 0xff) { p++; continue; } // fill byte
    const len = (b[p + 2] << 8) | b[p + 3], seg = b.subarray(p, p + 2 + len), id = new TextDecoder('latin1').decode(seg.subarray(4, 18));
    if (m === 0xda) { // scan: copy through the first EOI (FF D9 cannot occur inside entropy-coded data, FF is stuffed as FF 00)
      let e = p + 2 + len; while (e + 1 < b.length && !(b[e] === 0xff && b[e + 1] === 0xd9)) e++;
      if (e + 1 >= b.length || !w || ![1, 3, 4].includes(n)) return null;
      keep.push(b.subarray(p, e + 2));
      const data = new Uint8Array(keep.reduce((a, s) => a + s.length, 0)); let q = 0; for (const s of keep) { data.set(s, q); q += s.length; }
      const prof = icc.length ? icc.reduce((a, s) => { const c = new Uint8Array(a.length + s.length); c.set(a); c.set(s, a.length); return c; }) : null;
      return write({ w, h, n, data, dct: true, icc: prof, orient, invert });
    }
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
      if (m > 0xc2 || seg[4] !== 8) return null; // lossless, hierarchical, arithmetic or 12-bit: not for DCTDecode
      h = (seg[5] << 8) | seg[6]; w = (seg[7] << 8) | seg[8]; n = seg[9];
    }
    if (m === 0xe1 && id.startsWith('Exif\0')) orient = exifOrientation(seg.subarray(10)) || 1;
    if (m === 0xe2 && id.startsWith('ICC_PROFILE\0')) icc[seg[16] - 1] = seg.subarray(18); // chunks in sequence order
    if (m === 0xee && id.startsWith('Adobe')) invert = true;
    const app = m >= 0xe0 && m <= 0xef;
    if ((!app || m === 0xe0 || m === 0xee) && m !== 0xfe) keep.push(seg);
    p += 2 + len;
  }
  return null;
}

function exifOrientation(t: Uint8Array) {
  const le = t[0] === 0x49, v = new DataView(t.buffer, t.byteOffset, t.length);
  const u16 = (o: number) => v.getUint16(o, le);
  try {
    const ifd = v.getUint32(4, le);
    for (let i = 0, c = u16(ifd); i < c; i++) { const e = ifd + 2 + i * 12; if (u16(e) === 0x0112) return u16(e + 8); }
  } catch {} // truncated EXIF: no orientation
  return 0;
}

/** 8-bit RGB or RGBA pixels (row-major) → PDF; alpha becomes an SMask, both Flate. */
export function pixelsPdf(px: Uint8Array, w: number, h: number, alpha: boolean, icc: Uint8Array | null): Uint8Array {
  let rgb = px, a: Uint8Array | null = null;
  if (alpha) {
    rgb = new Uint8Array(w * h * 3); a = new Uint8Array(w * h);
    for (let i = 0, j = 0; i < a.length; i++, j += 4) { rgb[i * 3] = px[j]; rgb[i * 3 + 1] = px[j + 1]; rgb[i * 3 + 2] = px[j + 2]; a[i] = px[j + 3]; }
  }
  return write({ w, h, n: 3, data: zlibSync(rgb, { level: 6 }), dct: false, icc, alpha: a && zlibSync(a, { level: 6 }) });
}
