// Magic bytes of every supported input format (see detect() in formats.ts). Lazy chunk: loaded when the first file arrives.
const asc = (b: Uint8Array, at: number, s: string) => [...s].every((c, i) => b[at + i] === c.charCodeAt(0));
/** Candidate format ids for the bytes, [] when they say nothing. */
export function sniff(b: Uint8Array): string[] {
  const has = (s: string) => new TextDecoder('latin1').decode(b).includes(s);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ['jpg'];
  if (asc(b, 1, 'PNG\r\n') && b[0] === 0x89) return ['png'];
  if (asc(b, 0, 'GIF8')) return ['gif'];
  if (asc(b, 0, 'RIFF')) return asc(b, 8, 'WEBP') ? ['webp'] : asc(b, 8, 'WAVE') ? ['wav'] : asc(b, 8, 'AVI ') ? ['avi'] : [];
  if (asc(b, 0, 'BM') && [12, 40, 52, 56, 64, 108, 124].includes(b[14])) return ['bmp']; // DIB header size: "BM" alone matches plain text
  if (asc(b, 0, 'II*\0') || asc(b, 0, 'MM\0*')) return ['tiff'];
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return ['ico'];
  if ((b[0] === 0xff && b[1] === 0x0a) || asc(b, 4, 'JXL ')) return ['jxl'];
  if (asc(b, 0, '8BPS')) return ['psd'];
  if (asc(b, 4, 'ftyp')) { // ISO base media: the brands say which family
    const brands = new TextDecoder('latin1').decode(b.slice(8, 64));
    return /avif|avis/.test(brands) ? ['avif'] : /hei[cxms]|hev[cx]|mif1|msf1/.test(brands) ? ['heic'] : brands.startsWith('qt  ') ? ['mov'] : brands.startsWith('M4A ') ? ['m4a'] : ['mp4', 'm4a', 'mov'];
  }
  if (asc(b, 0, 'ID3') || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && (b[1] >> 1 & 3) !== 0)) return ['mp3'];
  if (b[0] === 0xff && (b[1] & 0xf6) === 0xf0) return ['m4a']; // AAC ADTS
  if (asc(b, 0, 'OggS')) return ['ogg', 'opus'];
  if (asc(b, 0, 'fLaC')) return ['flac'];
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return has('webm') ? ['webm'] : ['mkv'];
  if (asc(b, 0, '%PDF-')) return ['pdf'];
  if (asc(b, 0, '{\\rtf')) return ['rtf'];
  if (asc(b, 0, 'PK\x03\x04')) return has('epub+zip') ? ['epub'] : has('opendocument.text') ? ['odt'] : /\[Content_Types\]|word\//.test(new TextDecoder('latin1').decode(b)) ? ['docx'] : [];
  return [];
}
