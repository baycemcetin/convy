// SEO build checks (SEO-SAYFALAR §2-§3). Usage: node tests/seo-build.mjs   (builds twice: production dist/, then the draft validation build .draft-dist)
// Production: no pair page exists without content; sitemap lists only indexable pages; canonical/hreflang/404/robots/redirects/wrangler.
// Draft build (CONVY_DRAFTS=1): the sample pair renders; its canonical-less noindex form, breadcrumb, alias redirects, preset target, 404 suggestions, lang switch.
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { checkPage, checkSite, words } from '../src/content/pair-checks.ts';
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const run = (env, args) => execFileSync(args[0], args.slice(1), { env: { ...process.env, ...env }, stdio: 'pipe', encoding: 'utf8' });
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = (d) => walk(d).filter((f) => f.endsWith('.html') && !f.includes('/engines/') && !f.includes('/.prerender/')).map((f) => ({ f, rel: f.slice(d.length), h: readFileSync(f, 'utf8') }));
const tag = (h, re) => [...h.matchAll(re)].map((m) => m[1]);
const urlPath = (rel) => (rel === '/404.html' || rel === '/tr/404.html' ? rel : rel.replace(/index\.html$/, ''));

// ---------- unit: the thin-content gate rejects thin pages
{
  const thin = { id: 't.en', lang: 'en', title: 'x'.repeat(61), description: 'short', h1: 'h', intro: 'one', metaHook: '', steps: [], pairNote: 'few words', limits: [], faq: [], factRefs: ['lossy'], aboutFrom: 'a', aboutTo: 'b' };
  const e = checkPage(thin, new Set(['lossy']), 0, 3);
  ok(e.length >= 10, `thin page fails ${e.length} checks (title, description, intro, steps, pairNote, factRefs, limits, faq, about, related, prose)`);
  const dup = { ...thin, id: 'u.en', pairNote: 'same words '.repeat(30) }; const s = checkSite([dup, { ...dup, id: 'v.en' }]);
  ok(s.errors.some((x) => /duplicates/.test(x)) && s.errors.some((x) => /shingles/.test(x)), 'duplicate title/description and shingle overlap fail');
  ok(words('a b  c') === 3, 'word counter');
}

// ---------- production build
console.log('building dist ...'); run({ CONVY_DRAFTS: '', CONVY_RELEASE: '' }, ['npm', 'run', 'build', '--silent']);
const prod = pages('dist');
ok(!existsSync('dist/convert') || readdirSync('dist/convert').join() === 'index.html', 'production: /convert/ holds only the index (no pair page without content)');
ok(!existsSync('dist/tr/donustur') || readdirSync('dist/tr/donustur').join() === 'index.html', 'production: /tr/donustur/ holds only the index');
checkDir('dist', prod);
const sm = readFileSync('dist/sitemap-0.xml', 'utf8'), locs = tag(sm, /<loc>([^<]+)<\/loc>/g);
ok(locs.length >= 2 && locs.every((l) => l.startsWith('https://useconvy.com/') && l.endsWith('/')), `sitemap: ${locs.length} loc, https apex, trailing slash`);
ok(!/hreflang|xhtml/.test(sm), 'sitemap has no alternates (hreflang lives in the page <link>)');
for (const l of locs) { const p = prod.find((x) => urlPath(x.rel) === l.replace('https://useconvy.com', '')); ok(p && !/noindex/.test(p.h), `sitemap URL is an indexable built page: ${l}`); }
ok(/Sitemap: https:\/\/useconvy\.com\/sitemap-index\.xml/.test(readFileSync('public/robots.txt', 'utf8')) && existsSync('dist/sitemap-index.xml'), 'robots.txt points at sitemap-index.xml');
for (const f of ['dist/404.html', 'dist/tr/404.html']) { const h = readFileSync(f, 'utf8'); ok(/name="robots" content="noindex"/.test(h) && !/rel="canonical"|rel="alternate" hreflang/.test(h), `${f}: noindex, no canonical/hreflang`); }
ok(/not_found_handling = "404-page"/.test(readFileSync('wrangler.toml', 'utf8')), 'wrangler.toml: not_found_handling = "404-page"');
redirectsOk('dist');

// ---------- draft validation build
console.log('building .draft-dist (CONVY_DRAFTS=1) ...');
run({ CONVY_DRAFTS: '1' }, ['npx', 'astro', 'build', '--outDir', '.draft-dist', '--silent']); run({ DIST: '.draft-dist' }, ['node', 'scripts/headers.mjs']);
const dr = pages('.draft-dist');
const en = dr.find((p) => p.rel === '/convert/heic-to-jpg/index.html'), tr = dr.find((p) => p.rel === '/tr/donustur/heic-jpg/index.html');
ok(en && tr, 'draft build: sample pair exists in EN and TR');
ok(dr.filter((p) => /^\/(tr\/donustur|convert)\/[^/]+\/index\.html$/.test(p.rel)).length === 2, 'draft build: exactly 1 pair (x2 languages) of 42 listed, though pair-facts exist for 18+: no content, no page');
for (const [p, h1, lang] of [[en, 'HEIC to JPG', 'en'], [tr, 'HEIC JPG Dönüştürücü', 'tr']]) {
  ok(new RegExp(`<h1[^>]*>(<span[^>]*>)?${h1}`).test(p.h) || p.h.includes(h1), `${p.rel}: H1 "${h1}"`);
  ok(/data-to="JPG"/.test(p.h) && p.h.includes(`<html lang="${lang}"`), `${p.rel}: target preset + html lang`);
  ok(/noindex/.test(p.h), `${p.rel}: draft pair is noindex`);
  const ld = tag(p.h, /<script type="application\/ld\+json">([^<]+)<\/script>/g).map((s) => JSON.parse(s));
  const bc = ld.find((x) => x['@type'] === 'BreadcrumbList');
  ok(bc && bc.itemListElement.length === 4 && bc.itemListElement.every((it, i) => it.position === i + 1 && it.name && it.item.startsWith('https://useconvy.com/')), `${p.rel}: BreadcrumbList 4 items, positions in order`);
  ok(!ld.some((x) => x['@type'] === 'WebApplication' || x['@type'] === 'FAQPage'), `${p.rel}: no WebApplication/FAQPage`);
  const title = tag(p.h, /<title>([^<]*)<\/title>/g)[0]; ok(title.length <= 60, `${p.rel}: title ${title.length} chars`);
}
ok(!locsOf('.draft-dist').some((l) => /heic/.test(l)), 'draft pair is not in the sitemap');
const rd = readFileSync('.draft-dist/_redirects', 'utf8');
for (const r of ['/convert/heif-to-jpg /convert/heic-to-jpg/ 301', '/convert/heic-to-jpeg/ /convert/heic-to-jpg/ 301', '/convert/heif-to-jpeg /convert/heic-to-jpg/ 301', '/tr/donustur/heif-jpg/ /tr/donustur/heic-jpg/ 301']) ok(rd.includes(r), `_redirects has ${r.trim()}`);
redirectsOk('.draft-dist');
checkDir('.draft-dist', dr);

// ---------- browser: preset target, 404 suggestions + status, language switch on a pair page
const srv = spawn('node', ['scripts/serve.mjs', '--port', '4323'], { env: { ...process.env, DIST: '.draft-dist' }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const b = await chromium.launch(); const pg = await b.newPage();
try {
  await pg.goto('http://127.0.0.1:4323/convert/heic-to-jpg/'); await pg.waitForFunction(() => window.__convyReady);
  await pg.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.heic');
  await pg.locator('.stage .tpick').waitFor({ timeout: 10000 });
  ok(await pg.locator('.stage .tpick .chip input:checked + span').first().textContent() === 'JPG' && (await pg.locator('#sg-act').getAttribute('aria-disabled')) !== 'true', 'pair page: JPG is preselected after choosing a HEIC file, Convert enabled');
  ok((await pg.locator('a.lang').getAttribute('href')) === '/tr/donustur/heic-jpg/', 'language link goes to the same pair in TR');
  const r = await pg.goto('http://127.0.0.1:4323/convert/heif-to-png/'); ok(r.status() === 404, 'unpublished pair URL answers 404');
  const t = await pg.locator('#nf').innerText(); ok(/HEIC to PNG has no page/.test(t) && /JPG/.test(t), '404 suggests the published targets of HEIC');
  const r2 = await pg.goto('http://127.0.0.1:4323/tr/donustur/heic-png/'); ok(r2.status() === 404 && /HEIC → PNG için ayrı bir sayfa yok/.test(await pg.locator('#nf').innerText()), 'TR 404 + suggestion');
  const r3 = await pg.goto('http://127.0.0.1:4323/nothing/here/'); ok(r3.status() === 404 && (await pg.locator('#nf').isHidden()), 'plain 404 keeps the static links only');
} finally { await b.close(); srv.kill(); }
console.log(fails ? `${fails} FAILED` : 'all passed'); process.exit(fails ? 1 : 0);

function locsOf(d) { return tag(readFileSync(join(d, 'sitemap-0.xml'), 'utf8'), /<loc>([^<]+)<\/loc>/g); }
function redirectsOk(d) {
  const rows = readFileSync(join(d, '_redirects'), 'utf8').trim().split('\n').map((l) => l.split(' ')); const src = new Set(rows.map((r) => r[0]));
  ok(rows.length <= 2000, `${d}/_redirects: ${rows.length} rows (<= 2000)`);
  ok(rows.every(([a, b, c]) => c === '301' && !src.has(b.split('#')[0]) && a !== b), `${d}/_redirects: all 301, no chains`);
  ok(rows.every(([, b]) => existsSync(join(d, b.split('#')[0], 'index.html'))), `${d}/_redirects: every destination is a built page`);
}
function checkDir(d, ps) {
  const idx = ps.filter((p) => !/noindex/.test(p.h) && p.rel !== '/404.html');
  const titles = new Set();
  for (const p of idx) {
    const url = 'https://useconvy.com' + urlPath(p.rel), canon = tag(p.h, /<link rel="canonical" href="([^"]+)"/g);
    ok(canon.length === 1 && canon[0] === url && url.endsWith('/'), `${d}${p.rel}: self canonical`);
    const hl = Object.fromEntries([...p.h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
    const back = (u) => { const t = ps.find((x) => 'https://useconvy.com' + urlPath(x.rel) === u); return t && [...t.h.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].some((m) => m[1] === (url === hl.en ? 'en' : 'tr') && m[2] === url); };
    ok(hl.en && hl.tr && hl['x-default'] === hl.en && back(hl.en) && back(hl.tr) && (hl.en === url || hl.tr === url), `${d}${p.rel}: hreflang en/tr/x-default, reciprocal, self-referencing`);
    const t = tag(p.h, /<title>([^<]*)<\/title>/g)[0]; ok(!titles.has(t), `${d}${p.rel}: unique title`); titles.add(t);
  }
  for (const p of ps) { ok(!/FAQPage/.test(p.h), `${d}${p.rel}: no FAQPage`); const wa = /"WebApplication"/.test(p.h); ok(wa === (p.rel === '/index.html' || p.rel === '/tr/index.html'), `${d}${p.rel}: WebApplication only on the home pages`); }
}
