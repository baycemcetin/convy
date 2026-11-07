// Thin-content gate (SEO-SAYFALAR §3.3). Pure functions, no imports: a violation here fails the build (publish.ts throws).
// Word counts are whitespace tokens. Thresholds are the written spec; change them there first.
export type Lang = 'en' | 'tr';
export interface Faq { q: string; a: string }
export interface PairText {
  id: string; lang: Lang; title: string; description: string; h1: string;
  intro: string; metaHook: string; steps: string[]; pairNote: string; limits: string[]; faq: Faq[]; factRefs: string[];
  aboutFrom: string; aboutTo: string;
}
export const words = (s: string) => (s.match(/\S+/g) ?? []).length;
const inRange = (n: number, lo: number, hi: number) => n >= lo && n <= hi;

/** Field-level errors for one page (field numbers = SEO-SAYFALAR §3.2). `valid` = pair-facts keys that exist and are not 'unverified'. */
export function checkPage(p: PairText, valid: Set<string>, relatedCount: number, relatedNeeded: number): string[] {
  const e: string[] = [];
  const bad = (m: string) => e.push(`${p.id}: ${m}`);
  if (p.title.length > 60) bad(`title ${p.title.length} chars (max 60)`);
  if (!inRange(p.description.length, 105, 155)) bad(`description ${p.description.length} chars (105-155)`);
  if (!p.metaHook.trim()) bad('metaHook empty');
  if (!inRange(words(p.intro), 30, 55)) bad(`intro ${words(p.intro)} words (30-55)`);
  if (p.steps.length !== 3) bad(`steps ${p.steps.length} (need 3)`);
  if (words(p.pairNote) < 120) bad(`pairNote ${words(p.pairNote)} words (min 120)`);
  const refs = p.factRefs.filter((r) => valid.has(r));
  if (new Set(refs).size < 3) bad(`factRefs: ${new Set(refs).size} usable pair-facts references (min 3; unverified or unknown keys do not count)`);
  const unknown = p.factRefs.filter((r) => !valid.has(r));
  if (unknown.length) bad(`factRefs not usable (missing or unverified): ${unknown.join(', ')}`);
  if (!inRange(p.limits.length, 1, 3)) bad(`limits ${p.limits.length} (1-3)`);
  if (!inRange(p.faq.length, 3, 5)) bad(`faq ${p.faq.length} questions (3-5)`);
  p.faq.forEach((f, i) => { if (!inRange(words(f.a), 25, 80)) bad(`faq[${i}] answer ${words(f.a)} words (25-80)`); });
  for (const [k, t] of [['aboutFrom', p.aboutFrom], ['aboutTo', p.aboutTo]] as const) if (!inRange(words(t), 50, 90)) bad(`${k} ${words(t)} words (50-90)`);
  if (relatedCount < relatedNeeded) bad(`related links ${relatedCount} (min ${relatedNeeded})`);
  const prose = proseWords(p);
  if (prose < 300) bad(`unique prose ${prose} words (min 300)`);
  if ((words(p.aboutFrom) + words(p.aboutTo)) / prose > 0.5) bad('shared format texts are over half of the prose');
  return e;
}
export const proseWords = (p: PairText) =>
  [p.intro, ...p.steps, p.pairNote, p.aboutFrom, p.aboutTo, ...p.limits, ...p.faq.flatMap((f) => [f.q, f.a])].reduce((a, s) => a + words(s), 0);

const shingles = (s: string, n = 5) => { const w = s.toLowerCase().split(/\s+/).filter(Boolean); const out = new Set<string>(); for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' ')); return out; };
const own = (p: PairText) => [p.pairNote, ...p.faq.map((f) => f.a)].join(' ');

/** Site-wide: unique title/description per language; 5-word shingle overlap of pairNote + FAQ answers (>=30% warn, >=50% error). */
export function checkSite(pages: PairText[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = [];
  for (const k of ['title', 'description'] as const) {
    const seen = new Map<string, string>();
    for (const p of pages) { const key = p.lang + '|' + p[k]; const o = seen.get(key); if (o) errors.push(`${p.id}: ${k} duplicates ${o}`); else seen.set(key, p.id); }
  }
  const sh = pages.map((p) => shingles(own(p)));
  pages.forEach((p, i) => pages.forEach((q, j) => {
    if (i === j || p.lang !== q.lang || !sh[i].size) return;
    let common = 0; for (const s of sh[i]) if (sh[j].has(s)) common++;
    const r = common / sh[i].size;
    if (r >= 0.5) errors.push(`${p.id}: ${(r * 100).toFixed(0)}% of pairNote/FAQ shingles shared with ${q.id} (max 50%)`);
    else if (r >= 0.3) warnings.push(`${p.id}: ${(r * 100).toFixed(0)}% of pairNote/FAQ shingles shared with ${q.id}`);
  }));
  return { errors, warnings };
}
