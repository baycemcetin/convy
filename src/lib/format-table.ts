// How it works: the full format table, built from the format lists (engines/formats.ts + formats-more.ts) so the page can't drift
// from what the converter accepts. DocPage (Fill) puts it where how.{en,tr}.md says `<!-- formats -->`. Build time only, no client JS.
import { FORMATS, OUT, type Kind } from '../engines/formats';
import { MORE, MORE_OUT } from '../engines/formats-more';
import { CHROME } from '../i18n/site';
import type { Lang } from '../i18n';

const ALL = [...new Map([...FORMATS, ...MORE].map((f) => [f.id, f])).values()]; // by id: the client merges MORE into FORMATS on first detect
const HEAD: Record<Lang, string[]> = { en: ['Type', 'From', 'To'], tr: ['Tür', 'Kaynak', 'Hedef'] };
// display names where the id's label is not what people call the format
const NAME: Record<string, string | Record<Lang, string>> = {
  jxl: 'JPEG XL', jp2: 'JPEG 2000', md: 'Markdown', webp: 'WebP', webm: 'WebM', opus: 'Opus', ts: 'MPEG-TS', ipynb: 'Jupyter (IPYNB)', txt: { en: 'Plain text', tr: 'Düz metin' },
};
export const name = (id: string, l: Lang) => { const n = NAME[id]; return n ? (typeof n === 'string' ? n : n[l]) : ALL.find((f) => f.id === id)!.label; };
const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const KINDS: Kind[] = ['image', 'audio', 'video', 'document', 'pdf'];

/** per category: input and output format ids, from the same lists the converter reads */
export const catIds = (k: Kind) => ({ from: ALL.filter((f) => f.kind === k && !f.outOnly).map((f) => f.id), to: [...new Set([...OUT[k], ...(MORE_OUT[k] ?? [])])] });

export const formatRows = (l: Lang) => KINDS.map((k) => [
  CHROME[l].cat[k],
  catIds(k).from.map((id) => name(id, l)).join(', '),
  catIds(k).to.map((id) => name(id, l)).join(', '),
]);
export const formatTable = (l: Lang) =>
  `<table class="fmt"><thead><tr>${HEAD[l].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${formatRows(l).map((r) => `<tr>${r.map((c, i) => `<td data-l="${esc(HEAD[l][i])}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
