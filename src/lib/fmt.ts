// Number / size / percent formatting, ported 1:1 from the hi-fi (bilesen.js "format" block). Copy comes from metin.json.
import type { Copy, Lang } from '../i18n';
export const fmt = (s: string, o?: Record<string, unknown>) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && k in o ? String(o[k]) : m));

export function formatter(lang: Lang, t: Copy) {
  const loc = lang === 'tr' ? 'tr-TR' : 'en-US';
  const num = (x: number, d: number) => new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
  const size = (mb: number | null | undefined) => {
    if (mb == null) return null;
    if (mb < 1) return num(Math.max(1, Math.round(mb * 1000)), 0) + ' KB'; // a 141-byte file reads 1 KB, never 0 KB
    if (mb >= 1000) return num(mb / 1000, 1) + ' GB';
    return num(mb, mb >= 100 ? 0 : 1) + ' MB';
  };
  const sizeParts = (mb: number) => { const s = size(mb)!; const i = s.lastIndexOf(' '); return [s.slice(0, i), s.slice(i + 1)] as const; };
  const pct = (p: number) => new Intl.NumberFormat(loc, { style: 'percent' }).format(p);
  /** [a, u, unitFirst]: TR writes "%64" */
  const pctParts = (p: number) => { const s = pct(p); return lang === 'tr' ? (['%', s.slice(1), true] as const) : ([s.slice(0, -1), '%', false] as const); };
  const plural = (n: number, one: string, other: string) => fmt(new Intl.PluralRules(loc).select(n) === 'one' ? one : other, { n });
  /** spoken size for the live region, never "MB" */
  const say = (mb: number, whole = false) => mb < 1 ? `${num(Math.max(1, Math.round(mb * 1000)), 0)} ${t.sr.kb}` : mb >= 1000 ? `${num(mb / 1000, 1)} ${t.sr.gb}` : whole ? `${num(Math.ceil(mb), 0)} ${t.sr.mb}` : `${num(mb, mb >= 100 ? 0 : 1)} ${t.sr.mb}`;
  /** engine download: manifest `transfer`, rounded UP once (TEYIT A1-6); unknown → "—" (R-2026-13) */
  const dl = (mb: number | null | undefined) => (mb == null ? '—' : num(Math.ceil(mb), 0) + ' MB');
  const dur = (s: number | null) => (s == null ? null : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);
  return { t, lang, num, size, sizeParts, pct, pctParts, plural, say, dl, dur };
}
export type F = ReturnType<typeof formatter>;
