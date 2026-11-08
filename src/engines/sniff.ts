// Magic bytes of every supported input format (see detect() in formats.ts). Lazy chunk: loaded when the first file arrives.
// Formats without a signature (TGA, SVGZ, RST, Org, Typst, AsciiDoc, man, IPYNB, CSV/TSV, MD, TeX) are read by extension.
import { MORE, MORE_OUT } from './formats-more';
import type { Format, Kind } from './formats';
/** Adds the long tail to formats.ts's tables (once, from detect). */
export function register(all: Format[], out: Record<Kind, string[]>) { all.push(...MORE); for (const k in MORE_OUT) out[k as Kind].push(...MORE_OUT[k as Kind]!); return true; }
const asc = (b: Uint8Array, at: number, s: string) => [...s].every((c, i) => b[at + i] === c.charCodeAt(0));
/** Extensions that are taken only when the bytes confirm them (formats.ts detect). */
export const NEED_SIG = new Set(['ts', 'xml']);
const ASF = [0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11];
/** Candidate format ids for the bytes, [] when they say nothing. */
export function sniff(b: Uint8Array): string[] {
  const s = new TextDecoder('latin1').decode(b), has = (x: string) => s.includes(x);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ['jpg'];
  if (asc(b, 1, 'PNG\r\n') && b[0] === 0x89) return ['png'];
  if (asc(b, 0, 'GIF8')) return ['gif'];
  if (asc(b, 0, 'RIFF')) return asc(b, 8, 'WEBP') ? ['webp'] : asc(b, 8, 'WAVE') ? ['wav'] : asc(b, 8, 'AVI ') ? ['avi'] : [];
  if (asc(b, 0, 'BM') && [12, 40, 52, 56, 64, 108, 124].includes(b[14])) return ['bmp']; // DIB header size: "BM" alone matches plain text
  if (asc(b, 0, 'II*\0') || asc(b, 0, 'MM\0*')) return ['tiff'];
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return ['ico'];
  if (b[0] === 0 && b[1] === 0 && b[2] === 2 && b[3] === 0 && (b[4] || b[5])) return ['cur']; // image count > 0: TGA also starts 00 00 02 00
  if ((b[0] === 0xff && b[1] === 0x0a) || asc(b, 4, 'JXL ')) return ['jxl'];
  if (asc(b, 0, '8BPS')) return ['psd'];
  if (asc(b, 0, 'qoif')) return ['qoi'];
  if (asc(b, 4, 'jP  ') || (b[0] === 0xff && b[1] === 0x4f && b[2] === 0xff && b[3] === 0x51)) return ['jp2']; // JP2 box / J2K codestream
  if (b[0] === 0x76 && b[1] === 0x2f && b[2] === 0x31 && b[3] === 0x01) return ['exr'];
  if (asc(b, 0, '#?RADIANCE') || asc(b, 0, '#?RGBE')) return ['hdr'];
  if (asc(b, 0, 'DDS ')) return ['dds'];
  if (b[0] === 0x0a && [0, 2, 3, 4, 5].includes(b[1]) && b[2] === 1 && [1, 2, 4, 8].includes(b[3])) return ['pcx'];
  const pnm = /^P([1-6])\s+(#[^\n]*\s+)*\d+\s+\d+/.exec(s); // header with sizes: "P1 notes" in a text file is not a bitmap
  if (pnm) return [['pbm', 'pgm', 'ppm'][(+pnm[1] - 1) % 3], 'pnm'];
  if (/^P7\s/.test(s) && has('WIDTH')) return ['pam', 'pnm'];
  if (has('/* XPM */')) return ['xpm'];
  if (/^#define\s+\S*_width\s+\d+/.test(s)) return ['xbm'];
  if (asc(b, 4, 'ftyp')) { // ISO base media: the major brand says which family
    const brands = s.slice(8, 64);
    return /avif|avis/.test(brands) ? ['avif'] : /hei[cxms]|hev[cx]|mif1|msf1/.test(brands) ? ['heic'] : brands.startsWith('qt  ') ? ['mov']
      : brands.startsWith('M4A ') ? ['m4a', 'm4b'] : brands.startsWith('M4B ') ? ['m4b', 'm4a'] : brands.startsWith('3g') ? ['3gp'] : ['mp4', 'm4a', 'mov', 'm4b', '3gp'];
  }
  if (asc(b, 0, 'ID3')) return ['mp3', 'aac', 'mp2']; // a tag can sit in front of any MPEG / ADTS stream: the extension decides
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && (b[1] >> 1 & 3) !== 0) return (b[1] >> 1 & 3) === 1 ? ['mp3'] : ['mp2', 'mp3']; // MPEG audio layer III / II, I
  if (b[0] === 0xff && (b[1] & 0xf6) === 0xf0) return ['aac']; // ADTS
  if (asc(b, 0, 'OggS')) return has('theora') ? ['ogv'] : ['ogg', 'opus']; // (not '\x80theora': this 'latin1' decoder is windows-1252, 0x80 = €)
  if (asc(b, 0, 'fLaC')) return ['flac'];
  if (asc(b, 0, 'FORM') && (asc(b, 8, 'AIFF') || asc(b, 8, 'AIFC'))) return ['aiff'];
  if (ASF.every((x, i) => b[i] === x)) return has('\xc0\xef\x19\xbc\x4d\x5b\xcf\x11') ? ['wmv', 'wma'] : ['wma', 'wmv']; // video stream type GUID in the header
  if (b[0] === 0x0b && b[1] === 0x77) return ['ac3'];
  if (asc(b, 0, 'caff')) return ['caf'];
  if (asc(b, 0, '.snd')) return ['au'];
  if (asc(b, 0, 'TTA1')) return ['tta'];
  if (asc(b, 0, 'Creative Voice File')) return ['voc'];
  if (asc(b, 0, '#!AMR')) return ['amr'];
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && (b[3] === 0xba || b[3] === 0xb3)) return b[3] === 0xba ? ['mpg', 'vob'] : ['mpg']; // MPEG-PS / ES
  if ([0, 188, 376].every((o) => b[o] === 0x47) || [4, 196, 388].every((o) => b[o] === 0x47)) return ['ts']; // TS / M2TS packets
  if (asc(b, 0, 'FLV\x01')) return ['flv'];
  if (b[0] === 0x06 && b[1] === 0x0e && b[2] === 0x2b && b[3] === 0x34) return ['mxf'];
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return has('webm') ? ['webm'] : ['mkv'];
  if (asc(b, 0, '%PDF-')) return ['pdf'];
  if (asc(b, 0, '{\\rtf')) return ['rtf'];
  if (asc(b, 0, 'PK\x03\x04')) return has('epub+zip') ? ['epub'] : has('opendocument.text') ? ['odt'] : /\[Content_Types\]|word\//.test(s) ? ['docx'] : [];
  if (/^(\xef\xbb\xbf)?\s*</.test(s) && !/<html|<!doctype html/i.test(s)) { // XML family: the root element (or DOCTYPE) names it
    if (/<svg[\s>]/.test(s)) return ['svg'];
    if (has('<FictionBook')) return ['fb2'];
    if (/<opml[\s>]/.test(s)) return ['opml'];
    if (/JATS|NLM\/\/DTD/.test(s)) return ['jats'];
    if (/docbook\.org|DTD DocBook/i.test(s)) return ['docbook'];
  }
  return [];
}
