// The pair list (SEO-SAYFALAR §1.2) and everything derived from it: URLs, alias redirects, Turkish suffixes.
// A pair is *listed* here; it is *published* only when both language content files exist, are not draft and pass
// pair-checks + pair-facts (publish.ts). Tier A = launch, B = second batch after indexing is seen (SEO-6).
import { byId } from '../engines/formats';
export type Lang = 'en' | 'tr';
export interface Conversion { from: string; to: string; tier: 'A' | 'B'; slug: Record<Lang, string>; suffix: { from: string; to: string } }

// Turkish ablative / dative of the format name, written by hand (pronunciation decides the vowel: no automatic suffixing).
// Pronunciation of HEIC, WebP, AVIF, JXL, OGG, Opus is a guess: the copywriter confirms.
const TR_SUFFIX: Record<string, [string, string]> = {
  jpg: ["JPG'den", "JPG'ye"], png: ["PNG'den", "PNG'ye"], webp: ["WebP'ten", "WebP'e"], avif: ["AVIF'ten", "AVIF'e"], heic: ["HEIC'ten", "HEIC'e"],
  gif: ["GIF'ten", "GIF'e"], bmp: ["BMP'den", "BMP'ye"], tiff: ["TIFF'ten", "TIFF'e"], ico: ["ICO'dan", "ICO'ya"], jxl: ["JXL'den", "JXL'ye"], psd: ["PSD'den", "PSD'ye"],
  mp3: ["MP3'ten", "MP3'e"], wav: ["WAV'dan", "WAV'a"], m4a: ["M4A'dan", "M4A'ya"], ogg: ["OGG'dan", "OGG'a"], flac: ["FLAC'tan", "FLAC'a"],
  mp4: ["MP4'ten", "MP4'e"], mov: ["MOV'dan", "MOV'a"], webm: ["WebM'den", "WebM'e"], mkv: ["MKV'den", "MKV'ye"], avi: ["AVI'dan", "AVI'ya"],
  docx: ["DOCX'ten", "DOCX'e"], md: ["Markdown'dan", "Markdown'a"], html: ["HTML'den", "HTML'e"], txt: ["TXT'den", "TXT'ye"], pdf: ["PDF'ten", "PDF'e"],
};
const NAME: Record<string, string> = { md: 'Markdown', webp: 'WebP', webm: 'WebM' }; // display name where the id's uppercase is wrong
export const fmtName = (id: string) => NAME[id] ?? byId(id)!.label;
export const kindOf = (id: string) => byId(id)!.kind;

// [tier, from, to] in SEO-SAYFALAR order. jpg-to-pdf / png-to-pdf are Cem-approved A pairs; they stay unpublished until pair-facts has them.
const LIST: [Conversion['tier'], string, string][] = [
  ...[['heic', 'jpg'], ['heic', 'png'], ['webp', 'png'], ['webp', 'jpg'], ['png', 'jpg'], ['jpg', 'png'], ['mp4', 'mp3'], ['mov', 'mp4'], ['pdf', 'jpg'], ['pdf', 'png'], ['mp4', 'gif'],
    ['webm', 'mp4'], ['avif', 'jpg'], ['avif', 'png'], ['wav', 'mp3'], ['m4a', 'mp3'], ['png', 'webp'], ['jpg', 'webp'], ['jpg', 'pdf'], ['png', 'pdf']].map(([a, b]) => ['A', a, b] as [Conversion['tier'], string, string]),
  ...[['mkv', 'mp4'], ['avi', 'mp4'], ['mp4', 'webm'], ['mov', 'gif'], ['flac', 'mp3'], ['mp3', 'wav'], ['ogg', 'mp3'], ['tiff', 'jpg'], ['tiff', 'png'], ['bmp', 'jpg'], ['ico', 'png'], ['png', 'ico'],
    ['psd', 'png'], ['jxl', 'jpg'], ['gif', 'png'], ['jpg', 'avif'], ['docx', 'md'], ['md', 'docx'], ['docx', 'txt'], ['docx', 'html'], ['html', 'docx'], ['pdf', 'txt']].map(([a, b]) => ['B', a, b] as [Conversion['tier'], string, string]),
];
export const CONVERSIONS: Conversion[] = LIST.map(([tier, from, to]) => ({
  from, to, tier, slug: { en: `${from}-to-${to}`, tr: `${from}-${to}` },
  suffix: { from: TR_SUFFIX[from]?.[0] ?? `${fmtName(from)}'den`, to: TR_SUFFIX[to]?.[1] ?? `${fmtName(to)}'e` },
}));

export const BASE = { en: '/convert/', tr: '/tr/donustur/' } as const;
export const pairUrl = (c: Conversion, l: Lang) => `${BASE[l]}${c.slug[l]}/`;
export const key = (c: Conversion) => `${c.from}-${c.to}`;
export const CATEGORIES = ['image', 'audio', 'video', 'document', 'pdf'] as const;

/** Alias spellings (`jpeg`, `heif`, `tif`, `htm`, `markdown`, `latex`, `m4v`) from formats.ts `ext`; `aac` is excluded on purpose (SEO §1.5: only if the m4a page covers AAC). */
export const aliasesOf = (id: string) => byId(id)!.ext.filter((e) => e !== id && e !== 'aac');

/** Redirect rows [source, canonical] for one published pair: each alias combination of from/to, once per trailing-slash form, both languages. */
export function aliasRedirects(c: Conversion): [string, string][] {
  const out: [string, string][] = [];
  for (const l of ['en', 'tr'] as const) {
    const froms = [c.from, ...aliasesOf(c.from)], tos = [c.to, ...aliasesOf(c.to)];
    for (const f of froms) for (const t of tos) {
      if (f === c.from && t === c.to) continue;
      const slug = l === 'en' ? `${f}-to-${t}` : `${f}-${t}`;
      out.push([`${BASE[l]}${slug}`, pairUrl(c, l)], [`${BASE[l]}${slug}/`, pairUrl(c, l)]);
    }
  }
  return out;
}

/** the target label the converter island uses for chips (formats.ts `label`), e.g. "JPG" */
export const toLabel = (c: Conversion) => byId(c.to)!.label;
export const linkText = (c: Conversion, l: Lang) => `${fmtName(c.from)} ${l === 'en' ? 'to' : '→'} ${fmtName(c.to)}`;
