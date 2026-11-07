// Build-time publishing gate: which pairs get pages, which content problems fail the build. Used by every page that lists pairs
// (routes, index, related links, sitemap, redirects, 404), so a pair that is not published exists nowhere.
//   published = EN+TR pair files (not draft) + both format texts per language + pair-facts entry + pair-checks pass
// Missing prerequisites -> pair stays unpublished (reason printed). Present-but-failing content -> build error.
// CONVY_DRAFTS=1 also accepts `draft: true` files (template/SEO validation build, never production); CONVY_RELEASE=1 fails on any draft file.
import { getCollection, type CollectionEntry } from 'astro:content';
import { readFileSync, readdirSync } from 'node:fs';
import { CONVERSIONS, fmtName, key, type Conversion, type Lang } from './conversions';
import { pairFacts, type PairFacts } from './pair-facts';
import { checkPage, checkSite, type PairText } from './pair-checks';
import { DOC_KEYS, type DocKey } from '../i18n/site';

export const DRAFTS = process.env.CONVY_DRAFTS === '1';
const RELEASE = process.env.CONVY_RELEASE === '1';
const LANGS: Lang[] = ['en', 'tr'];
const ENGINE_DIR: Record<PairFacts['engine'], string> = { magick: 'magick@', pdfjs: 'pdfjs@', ffmpeg: 'ffmpeg-st@', 'mediabunny-or-ffmpeg': 'ffmpeg-st@' };
export const ENGINE_NAME: Record<PairFacts['engine'], string> = { magick: 'ImageMagick (WebAssembly)', pdfjs: 'PDF.js', ffmpeg: 'FFmpeg (WebAssembly)', 'mediabunny-or-ffmpeg': 'WebCodecs, FFmpeg as fallback' };

export interface Pub {
  c: Conversion; facts: PairFacts; entry: Record<Lang, CollectionEntry<'pairs'>>; about: Record<Lang, [CollectionEntry<'formats'>, CollectionEntry<'formats'>]>;
  text: Record<Lang, { title: string; description: string; h1: string }>; mb: number | null; draft: boolean;
}
const present = (e?: { data: { draft: boolean } }) => !!e && (!e.data.draft || DRAFTS);

/** pair-facts keys usable in factRefs: exist and not 'unverified' */
export function usableFacts(f: PairFacts): Set<string> {
  const ok = new Set<string>();
  for (const k of ['lossy', 'quality', 'metadata', 'transparency', 'animation', 'path', 'download', 'offline'] as const) if (f[k] && f[k]!.status !== 'unverified') ok.add(k);
  (['limits', 'extra'] as const).forEach((k) => f[k].forEach((x, i) => x.status !== 'unverified' && ok.add(`${k}.${i}`)));
  return ok;
}
function engineMB(f: PairFacts): number | null {
  try {
    const dir = readdirSync('public/engines').find((d) => d.startsWith(ENGINE_DIR[f.engine]));
    return dir ? Math.max(1, Math.round(JSON.parse(readFileSync(`public/engines/${dir}/manifest.json`, 'utf8')).transfer / 1e6)) : null;
  } catch { return null; } // engines not prepared: the summary row shows no size rather than a made-up one
}
const compose = (l: Lang, c: Conversion, hook: string) => {
  const a = fmtName(c.from), b = fmtName(c.to);
  return l === 'en'
    ? { title: `${a} to ${b} Converter, in Your Browser | Convy`, h1: `${a} to ${b}`, description: `Convert ${a} to ${b} in your browser: ${hook}. Free, no account, no ads.` }
    : { title: `${a} ${b} Dönüştürücü, Tarayıcıda | Convy`, h1: `${a} ${b} Dönüştürücü`, description: `${a} dosyalarını ${c.suffix.to} çevir: ${hook}. Ücretsiz, hesapsız, reklamsız.` };
};

export interface Related { same: Conversion[]; target: Conversion[]; reverse: Conversion | null }
export function relatedOf(c: Conversion, pubs: { c: Conversion }[]): Related {
  const others = pubs.map((p) => p.c).filter((x) => x !== c);
  return { same: others.filter((x) => x.from === c.from).slice(0, 2), target: others.filter((x) => x.to === c.to).slice(0, 2), reverse: others.find((x) => x.from === c.to && x.to === c.from) ?? null };
}
const relatedCount = (r: Related) => r.same.length + r.target.length + (r.reverse ? 1 : 0);

let cache: Promise<{ pubs: Pub[]; log: string[] }> | undefined;
export const loadPairs = () => (cache ??= build());

async function build() {
  const pairs = await getCollection('pairs'), formats = await getCollection('formats');
  const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
  const P = byId(pairs), F = byId(formats);
  const errors: string[] = [], log: string[] = [];
  for (const e of pairs) if (!CONVERSIONS.some((c) => e.id.startsWith(key(c) + '.'))) errors.push(`${e.id}: not in conversions.ts`);
  if (RELEASE) for (const e of [...pairs, ...formats]) if (e.data.draft) errors.push(`${e.id}: draft in a release build`);

  // pass 1: prerequisites
  const cand: Omit<Pub, 'text' | 'mb'>[] = [];
  for (const c of CONVERSIONS) {
    const en = P.get(`${key(c)}.en`), tr = P.get(`${key(c)}.tr`);
    if (!present(en) && !present(tr)) continue;
    if (!present(en) || !present(tr)) { log.push(`unpublished ${key(c)}: only one language has content (both or none)`); continue; }
    const facts = pairFacts(c.from, c.to);
    if (!facts) { log.push(`unpublished ${key(c)}: no pair-facts entry yet`); continue; }
    const about = {} as Pub['about']; let miss = '';
    for (const l of LANGS) { const a = F.get(`${c.from}.${l}`), b = F.get(`${c.to}.${l}`); if (!present(a) || !present(b)) miss ||= `format text ${!present(a) ? c.from : c.to}.${l}`; else about[l] = [a!, b!]; }
    if (miss) { log.push(`unpublished ${key(c)}: missing ${miss}`); continue; }
    cand.push({ c, facts, entry: { en: en!, tr: tr! }, about, draft: en!.data.draft || tr!.data.draft });
  }
  // pass 2: checks
  const texts: PairText[] = [];
  const out: Pub[] = cand.map((x) => {
    const text = {} as Pub['text'];
    const rel = relatedCount(relatedOf(x.c, cand)), need = cand.length >= 4 ? 3 : 0;
    if (!need && cand.length) log.push(`related-link minimum (3) not enforced: only ${cand.length} candidate pair(s)`);
    for (const l of LANGS) {
      const d = x.entry[l].data, t = compose(l, x.c, d.metaHook);
      text[l] = t;
      const pt: PairText = { id: x.entry[l].id, lang: l, ...t, intro: d.intro, metaHook: d.metaHook, steps: d.steps, pairNote: x.entry[l].body ?? '', limits: d.limits, faq: d.faq, factRefs: d.factRefs, aboutFrom: x.about[l][0].body ?? '', aboutTo: x.about[l][1].body ?? '' };
      texts.push(pt);
      errors.push(...checkPage(pt, usableFacts(x.facts), rel, need));
    }
    return { ...x, text, mb: engineMB(x.facts) };
  });
  const site = checkSite(texts);
  errors.push(...site.errors); log.push(...site.warnings.map((w) => 'warning ' + w));
  if (errors.length) throw new Error(`Content checks failed (SEO-SAYFALAR §3.3):\n  ${errors.join('\n  ')}`);
  log.push(`${out.length} pair(s) published${DRAFTS ? ' (CONVY_DRAFTS=1: drafts included)' : ''}`);
  for (const l of log) console.log('[convy content]', l);
  return { pubs: out, log };
}

// ---- content pages P4-P7: always built; draft = noindex + out of the sitemap; release build refuses drafts
export async function loadDocs() {
  const all = await getCollection('pages');
  const m = new Map(all.map((e) => [e.id, e]));
  const out = {} as Record<DocKey, Record<Lang, CollectionEntry<'pages'>>>;
  for (const k of DOC_KEYS) { out[k] = {} as Record<Lang, CollectionEntry<'pages'>>; for (const l of LANGS) {
    const e = m.get(`${k}.${l}`); if (!e) throw new Error(`pages/${k}.${l}.md is missing`);
    if (RELEASE && e.data.draft) throw new Error(`pages/${k}.${l}.md is draft in a release build`);
    out[k][l] = e;
  } }
  return out;
}
