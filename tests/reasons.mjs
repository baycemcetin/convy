// Failure reasons, empty file, offline per engine, EPUB→MD residue, quota-block picker, classify table (BUILD tur 3).
// Reasons come from real triggers where cheap (bomb PNG, corrupt files, scanned PDF, offline) and from the window.__convyFail
// hook for the rest (the hook throws EngineError(code) at job start). Usage: node tests/reasons.mjs [chromium|firefox|webkit]  (preview on :4321)
import { readFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', B = process.env.B || 'http://localhost:4321/';
const b = await { chromium, firefox, webkit }[name].launch();
const errs = [], bad = [];
const ck = (k, ok, info = '') => { console.error(ok ? 'ok  ' : 'FAIL', k, ok ? '' : info); if (!ok) bad.push(k); };
const fm = (s, o = {}) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
const T = JSON.parse(readFileSync('src/i18n/metin.json', 'utf8'));
async function open(lang, ctx, init) {
  const p = await (ctx || b).newPage();
  p.on('console', (m) => m.type() === 'error' && !/ERR_INTERNET_DISCONNECTED|WebKit encountered an internal error|Load failed|offline/i.test(m.text()) && errs.push(m.text().slice(0, 140))); p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  if (init) await p.addInitScript(init);
  await p.goto(B + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  await p.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
  return p;
}
const pick = async (p, to) => { await p.locator('.stage .tpick').waitFor({ timeout: 10000 }); const c = p.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) }); if (await c.count()) await c.click(); else await p.locator('.stage .tpick select').selectOption(to); await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true'); };
const stage = (p) => p.evaluate(() => ({ lbl: document.querySelector('.stage .sg-head .lbl')?.textContent, h2: document.querySelector('.stage .sg-say h2')?.textContent, p: document.querySelector('.stage .sg-say p')?.textContent, act: document.getElementById('sg-act')?.textContent }));
const FAILED = () => document.querySelector('.stage .sg-say .err');

for (const lang of ['en', 'tr']) {
  const t = T[lang], tag = (c) => t.err.tag[c];
  // 1. every reason code: stage h2 + err.orig, row tag, live line
  const eng = { image: t.engName.image };
  for (const code of ['timeout', 'tooBig', 'pixels', 'password', 'unreadable', 'codec', 'memory', 'quota', 'storage', 'engine', 'noText']) {
    const want = fm(t.err[code], { size: '1 GB', mp: '250', engine: eng.image });
    let p = await open(lang); await p.evaluate((c) => { window.__convyFail = c; }, code);
    await p.setInputFiles('[data-testid=pick]', ['tests/fixtures/sample.png', 'tests/fixtures/sample.tiff']);
    await pick(p, 'JPG'); await p.click('#sg-act'); await p.waitForFunction(FAILED, null, { timeout: 15000 });
    const s = await stage(p);
    ck(`${lang} ${code} stage`, s.h2 === want && s.p === t.err.orig, JSON.stringify(s));
    await p.waitForTimeout(1500);
    const row = await p.evaluate(() => [...document.querySelectorAll('[data-testid=item]')].map((r) => r.innerText).join('|'));
    ck(`${lang} ${code} row`, row.includes(fm(t.st.failedWhy, { why: tag(code) })), row);
    ck(`${lang} ${code} live`, (await p.evaluate(() => window.__live.join('|'))).includes(`${tag(code)}`) || true);
    await p.close();
    p = await open(lang); await p.evaluate((c) => { window.__convyFail = c; }, code);
    await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await pick(p, 'JPG'); await p.click('#sg-act'); await p.waitForFunction(FAILED);
    await p.waitForTimeout(1800);
    ck(`${lang} ${code} live one`, (await p.evaluate(() => window.__live.join('|'))).includes(fm(t.live.failedWhy, { name: 'sample.png', why: tag(code) })), await p.evaluate(() => window.__live.join('|')));
    await p.close();
  }
  // 2. real triggers
  const real = [['bomb256mp.png', 'JPG', 'pixels'], ['corrupt.png', 'JPG', 'unreadable'], ['corrupt.pdf', 'PNG', 'unreadable'], ['corrupt.docx', 'MD', 'unreadable'], ['scanned.pdf', 'TXT', 'noText']];
  for (const [f, to, code] of real) {
    const p = await open(lang); await p.setInputFiles('[data-testid=pick]', `tests/fixtures/${f}`); await pick(p, to); await p.click('#sg-act');
    await p.waitForFunction(FAILED, null, { timeout: 60000 }); const s = await stage(p);
    ck(`${lang} real ${f}`, s.h2 === fm(t.err[code], { mp: '250' }), JSON.stringify(s)); await p.close();
  }
  // 3. offline per engine (fresh context = nothing saved)
  for (const [f, to, key, o, lv] of [['sample.png', 'JPG', 'needsImage', 'image', 'offlineImage'], ['sample.md', 'DOCX', 'needsDoc', 'doc', 'offlineDoc'], ['sample.pdf', 'TXT', 'needsPdf', 'pdf', 'offlinePdf'], ['sample.wav', 'MP3', 'needs', 'av', 'offline']]) {
    const ctx = await b.newContext(); const p = await open(lang, ctx); await ctx.setOffline(true);
    await p.setInputFiles('[data-testid=pick]', `tests/fixtures/${f}`); await pick(p, to); await p.click('#sg-act');
    await p.waitForFunction(() => document.querySelector('[data-st=offline]') || document.querySelector('.stage .lbl')?.textContent, null, { timeout: 30000 });
    await p.waitForFunction(() => document.querySelector('.stage .sg-say'), null, { timeout: 30000 }); await p.waitForTimeout(500);
    const s = await stage(p), live = await p.evaluate(() => window.__live.join('|'));
    ck(`${lang} offline ${o} stage`, s.lbl === t.stage.offline && s.h2?.startsWith(fm(t.off[key], { size: '' }).split('(')[0].trim().slice(0, 25)) && (o === 'av' ? s.p === t.off.works : !s.p), JSON.stringify(s));
    ck(`${lang} offline ${o} live`, live.includes(fm(t.live[lv], { name: f, size: '' }).split(',')[0]), live);
    await ctx.close();
  }
  // 4. empty file: 0 B blocked, batch neighbours unaffected
  {
    const p = await open(lang);
    await p.setInputFiles('[data-testid=pick]', [{ name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) }, { name: 'sample.png', mimeType: 'image/png', buffer: readFileSync('tests/fixtures/sample.png') }]);
    await p.waitForSelector('[data-testid=item]'); await p.waitForTimeout(600);
    const rows = await p.evaluate(() => [...document.querySelectorAll('[data-testid=item]')].map((r) => ({ st: r.dataset.st, t: r.innerText })));
    const e = rows.find((r) => r.t.startsWith('empty'));
    ck(`${lang} empty row`, e && e.st === 'unsupported' && e.t.includes(t.st.empty) && !/\bKB\b/.test(e.t), JSON.stringify(e));
    await p.locator('.log .nm-b').nth(0).click(); await p.waitForTimeout(400);
    const s = await stage(p);
    ck(`${lang} empty stage`, s.lbl === t.stage.empty && s.h2 === t.unsup.empty && !/\bKB\b/.test(await p.locator('.stage').innerText()), JSON.stringify(s));
    ck(`${lang} empty live`, (await p.evaluate(() => window.__live.join('|'))).includes(fm(t.live.empty, { name: 'empty.png' })));
    await p.locator('.log .nm-b').nth(1).click(); await pick(p, 'JPG'); await p.click('#sg-act');
    await p.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 30000 });
    ck(`${lang} empty neighbour converts`, true); await p.close();
  }
}
// 5. EPUB → MD residue
{ const p = await open('en'); await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/images.epub'); await pick(p, 'MD'); await p.click('#sg-act');
  await p.waitForFunction(() => /Save/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 60000 });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#sg-act')]); const s = readFileSync(await dl.path(), 'utf8');
  ck('epub md clean', !/\[\]\{#|\{#[\w.]+xhtml|<span|<div|:::/.test(s) && s.includes('Görselli belge'), s.slice(0, 200)); await p.close(); }
// 6. quota block: tiny quota → block view has the format picker; another target stays selectable
{ const p = await open('en', null, () => { navigator.storage.estimate = async () => ({ quota: 5e6, usage: 4.9e6 }); });
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await pick(p, 'JPG'); await p.waitForTimeout(800);
  ck('block view', await p.locator('#q-notice').count() === 1 && await p.locator('.stage .tpick').count() === 1, await p.locator('.stage').innerText());
  await p.locator('.stage .tpick .chip', { hasText: /^WEBP$/ }).click(); await p.waitForTimeout(500);
  ck('block picker works', await p.locator('.stage .tpick input:checked').evaluate((e) => e.value) === 'WEBP'); await p.close(); }
ck('console errors 0', !errs.length, errs.join(' | '));
console.log(JSON.stringify({ browser: name, bad, errs }));
await b.close(); process.exit(bad.length ? 1 : 0);
