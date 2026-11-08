// QA tur 3 §2: offline per engine (saved / not saved) + bfcache, persistent context (WebKit refuses OPFS in ephemeral contexts).
// Wave 5: service worker (scripts/sw.mjs) -> cold open offline must load, convert with saved engines, and the panel's offline line tells the truth.
// Usage: OUT=<dir> node tests/qa3-offline.mjs [chromium|webkit|firefox]   (preview on :4321)
import { chromium, firefox, webkit } from 'playwright-core';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pickTarget } from './qa2-lib.mjs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t3', B = 'http://127.0.0.1:4321/'; mkdirSync(OUT, { recursive: true });
const T = JSON.parse(readFileSync('src/i18n/metin.json', 'utf8'));
const R = { name, steps: [], bad: [] }; const errs = [];
let STEP = ''; const ck = (k, ok, info = '') => { STEP = k; R.steps.push({ k, ok, info: ok ? undefined : info }); if (!ok) R.bad.push(k); console.error(ok ? 'ok  ' : 'FAIL', k, ok ? '' : String(info).slice(0, 240)); };
const fm = (s, o = {}) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
const ctx = await { chromium, firefox, webkit }[name].launchPersistentContext(mkdtempSync(join(tmpdir(), 'q3-' + name + '-')), { acceptDownloads: true, ...(name === 'chromium' ? { ignoreDefaultArgs: ['--disable-back-forward-cache'] } : {}) });
const open = async (lang = 'en') => { const p = await ctx.newPage(); p.on('console', (m) => m.type() === 'error' && !/ERR_INTERNET_DISCONNECTED|Load failed|offline|NetworkError|Failed to fetch|WebKit encountered an internal error|Fetch API cannot load|respondWith received an error/i.test(m.text()) && !(name === 'webkit' && /^Refused to apply a stylesheet/.test(m.text())) && // Playwright's WebKit screenshot injects an inline <style> (0 CSP errors before the shot, 1 after; wave 5 probe)
     errs.push('[after ' + STEP + '] ' + m.text().slice(0, 160) + ' @' + (m.location().url || '').slice(-40))); p.on('pageerror', (e) => !/respondWith received an error|Fetch API cannot load/.test(String(e)) && errs.push(String(e).slice(0, 160))); // WebKit's wording for an offline engine fetch through the SW (unsaved engine, expected)
  await p.addInitScript(() => { window.__ps = []; addEventListener('pageshow', (e) => window.__ps.push(e.persisted)); });
  await p.goto(B + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady); return p; };
const stage = (p) => p.evaluate(() => ({ lbl: document.querySelector('.stage .sg-head .lbl')?.textContent, h2: document.querySelector('.stage .sg-say h2')?.textContent, p: document.querySelector('.stage .sg-say p')?.textContent, act: document.getElementById('sg-act')?.textContent, rows: [...document.querySelectorAll('[data-testid=item]')].map((r) => r.dataset.st), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
const cases = [['sample.png', 'JPG', 'needsImage', 'offlineImage'], ['sample.md', 'DOCX', 'needsDoc', 'offlineDoc'], ['sample.pdf', 'TXT', 'needsPdf', 'offlinePdf'], ['sample.wav', 'MP3', 'needs', 'offline'], ['sample.mp4', 'WEBM', 'needs', 'offline']];
const start = async (p, f, to) => { await p.setInputFiles('[data-testid=pick]', `tests/fixtures/${f}`); await pickTarget(p, to); await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true'); await p.click('#sg-act'); };
const done = (p, t = 120000) => p.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say .err'), null, { timeout: t });
const clear = async (p) => { for (let i = 0; i < 8; i++) { if (await p.locator('[data-testid=choose]').count()) return; const c = p.locator('[data-testid=rm], .stage button.quiet[aria-label^=Remove], .stage button.quiet[aria-label^=Kald]').first(); if (await c.count()) await c.click(); else if (/^(Remove|Kald)/.test((await p.locator('#sg-act').textContent()) || '')) await p.click('#sg-act'); else return; await p.waitForTimeout(500); } };
const swReady = (p) => p.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 }).then(() => true, () => false);
// the panel line follows refreshDevice() (async: manifests + Cache Storage), so wait up to 5 s for the expected text before reading it
const offLine = async (p, t, want) => { await p.click('.chip-dev'); await p.waitForSelector('#dp:not([hidden])');
  const read = (l) => [...document.querySelectorAll('#dp .dp-sec')].find((e) => e.querySelector('.lbl')?.textContent === l)?.querySelector('.small')?.textContent ?? 'NO SECTION';
  await p.waitForFunction(([l, w]) => [...document.querySelectorAll('#dp .dp-sec')].find((e) => e.querySelector('.lbl')?.textContent === l)?.querySelector('.small')?.textContent === w, [t.panel.offT, want], { timeout: 5000 }).catch(() => {});
  const s = await p.evaluate(read, t.panel.offT); await p.keyboard.press('Escape'); return s; };
const live = (p) => p.evaluate(() => window.__live?.join('|') || '');
for (const lang of ['en', 'tr']) {
  const t = T[lang];
  // ---- A: engines NOT saved (fresh profile only for the first lang pass; second pass is a new page but caches persist, so only EN is the "unsaved" truth)
  if (lang === 'en') {
    for (const [f, to, key, lv] of cases) {
      const p = await open(lang); await p.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
      await ctx.setOffline(true); await start(p, f, to);
      await p.waitForFunction(() => document.querySelector('[data-st=offline]'), null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(600);
      const s = await stage(p), lv2 = await live(p);
      const want = fm(t.off[key], { size: '' }).split('(')[0].split('about')[0].trim().slice(0, 28);
      // Playwright Firefox: setOffline does not cover fetches made by the service worker (probe: SW cache miss offline -> 200), so pdf.js
      // (an all-JS engine, loaded through the SW) still downloads here. Real offline fails like the other engines; recorded, not asserted.
      if (name === 'firefox' && f === 'sample.pdf') { R.ffPdfEmulationLeak = await stage(p); await ctx.setOffline(false); await p.close(); continue; }
      ck(`A ${name} ${f} unsaved: stage label+h2`, s.lbl === t.stage.offline && !!s.h2?.startsWith(want) , JSON.stringify(s));
      ck(`A ${name} ${f} unsaved: p`, to === 'MP3' || to === 'WEBM' ? s.p === t.off.works : !s.p, JSON.stringify(s.p));
      ck(`A ${name} ${f} unsaved: live`, lv2.includes(fm(t.live[lv], { name: f, size: '' }).split(',')[0]), lv2);
      ck(`A ${name} ${f} no h-scroll`, s.sw <= s.cw);
      await p.screenshot({ path: `${OUT}/off-${name}-unsaved-${f.replace('.', '_')}.png` }); await p.setViewportSize({ width: 390, height: 844 }); await p.screenshot({ path: `${OUT}/off-${name}-unsaved-${f.replace('.', '_')}-390.png` });
      await ctx.setOffline(false); await p.close();
    }
    // service worker: controls the page once the shell is cached; panel says "not yet" for every kind (no engine saved)
    const p = await open(lang); ck(`SW ${name} controls the page`, await swReady(p));
    const w0 = fm(t.panel.offNot, { list: t.panel.kinds.join(', ') }), l0 = await offLine(p, t, w0); ck(`SW ${name} panel: nothing ready offline yet`, l0 === w0, l0);
    await ctx.setOffline(true);
    const r = await p.reload().then(() => p.waitForFunction(() => window.__convyReady, null, { timeout: 15000 })).then(() => 'loaded', (e) => 'FAILED: ' + String(e).slice(0, 80)); R.offlineReload = r; ck(`SW ${name} reload offline loads the shell`, r === 'loaded', r); await ctx.setOffline(false); await p.close();
  }
  // ---- B: engines saved: convert once online, then offline in the SAME page (no service worker => cannot cold-open offline)
  const p = await open(lang);
  for (const [f, to] of cases) { await start(p, f, to); await done(p); await p.waitForTimeout(300); const s = await stage(p); ck(`B ${lang} ${name} ${f}->${to} online done`, /Save|Kaydet/.test(s.act), JSON.stringify(s)); await clear(p); }
  await ctx.setOffline(true); await p.evaluate(() => window.dispatchEvent(new Event('offline'))); await p.waitForTimeout(400);
  for (const [f, to] of cases) {
    await start(p, f, to); await done(p);
    await p.waitForTimeout(300); const s = await stage(p);
    ck(`B ${lang} ${name} ${f}->${to} saved+offline converts`, /Save|Kaydet/.test(s.act) && s.rows.every((x) => x === 'done'), JSON.stringify(s));
    if (f === 'sample.pdf') await p.screenshot({ path: `${OUT}/off-${name}-saved-${lang}.png` });
    await clear(p);
  }
  // ---- D: cold open offline (new page, engines saved): the shell comes from the service worker, every engine converts
  { await ctx.setOffline(true); const c = await open(lang).catch((e) => null); ck(`D ${lang} ${name} cold open offline`, !!c);
    if (c) { const w1 = fm(t.panel.offReady, { list: t.panel.kinds.join(', ') }), l1 = await offLine(c, t, w1); ck(`D ${lang} ${name} panel: all kinds ready offline`, l1 === w1, l1);
      for (const [f, to] of cases) { await start(c, f, to); await done(c); await c.waitForTimeout(300); const s = await stage(c); ck(`D ${lang} ${name} ${f}->${to} cold offline converts`, /Save|Kaydet/.test(s.act) && s.rows.every((x) => x === 'done'), JSON.stringify(s)); await clear(c); }
      await c.close(); }
    await ctx.setOffline(false); }
  // ---- C: bfcache: result on screen, leave to a non-app page, back (offline), then back online
  await start(p, 'sample.png', 'WEBP'); await done(p); const before = await stage(p);
  await p.goto('about:blank'); await p.goBack({ waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(800);
  const after = await p.evaluate(() => ({ ps: window.__ps, ready: !!window.__convyReady, rows: [...document.querySelectorAll('[data-testid=item]')].map((r) => r.dataset.st), act: document.getElementById('sg-act')?.textContent, path: location.pathname }));
  R['bfcache_' + lang] = { before: before.rows, after }; console.error('bfcache', lang, JSON.stringify(after));
  ck(`C ${lang} ${name} back: app alive (ready, no crash)`, after.ready && after.path === (lang === 'tr' ? '/tr/' : '/'), JSON.stringify(after));
  ck(`C ${lang} ${name} back: state ${after.ps?.includes(true) ? 'restored from bfcache' : 'reloaded (no bfcache)'} consistent`, after.rows.length === 0 || after.rows.every((x) => x === 'done'), JSON.stringify(after));
  // still usable after return, offline
  await p.waitForTimeout(300);
    await start(p, 'sample.md', 'DOCX').catch((e) => R.steps.push({ k: 'startAfterBack', e: String(e).slice(0, 100) })); await done(p).catch(() => {}); const s2 = await stage(p);
  ck(`C ${lang} ${name} after back (offline): convert works or shows offline, never stuck`, /Save|Kaydet/.test(s2.act) || s2.rows.includes('offline') || s2.rows.includes('failed'), JSON.stringify(s2));
  // go online while the page sits in bfcache, return: engine status must refresh
  await ctx.setOffline(false); await p.goto('about:blank'); await p.goBack({ waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(800);
  const s3 = await stage(p); const ps = await p.evaluate(() => window.__ps); ck(`C ${lang} ${name} back online: not stuck offline`, !s3.rows.includes('offline'), JSON.stringify(s3) + ' ps=' + ps);
  await p.close();
}
ck(`console errors ${name}`, !errs.length, errs.join(' | ')); R.errs = errs;
writeFileSync(`${OUT}/offline-${name}.json`, JSON.stringify(R, null, 1)); await ctx.close(); console.log(JSON.stringify({ name, bad: R.bad, offlineReload: R.offlineReload })); 
