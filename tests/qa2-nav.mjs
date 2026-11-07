// QA build-tur2 §3: EN<->TR hops + bfcache (pageshow persisted) + init after history navigation (R-2026-26). Usage: OUT=<dir> node tests/qa2-nav.mjs [browser]
import { chromium, firefox, webkit } from 'playwright-core';
import { pickTarget, snap, BASE } from './qa2-lib.mjs';
import { writeFileSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2';
const b = await { chromium, firefox, webkit }[name].launch(name === 'chromium' ? { ignoreDefaultArgs: ['--disable-back-forward-cache'] } : {});
const ctx = await b.newContext({ acceptDownloads: true }); const p = await ctx.newPage(); const R = { steps: [] }; const errs = [];
p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
await p.addInitScript(() => { window.__pageshows = []; addEventListener('pageshow', (e) => window.__pageshows.push({ persisted: e.persisted, path: location.pathname })); addEventListener('pagehide', (e) => (window.__hides = (window.__hides || 0) + 1)); });
const info = async (tag) => { const o = { tag, ...(await p.evaluate(() => ({ path: location.pathname, lang: document.documentElement.lang, ready: !!window.__convyReady, shows: window.__pageshows, items: document.querySelectorAll('[data-testid=item]').length, act: document.getElementById('sg-act')?.textContent, label: document.querySelector('.stage .sg-head .lbl')?.textContent, h1: document.querySelector('h1')?.textContent.slice(0, 40), theme: document.documentElement.dataset.theme, live: document.getElementById('live')?.textContent }))), errs: errs.length }; R.steps.push(o); return o; };
const conv = async (file, to) => { await p.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`); await pickTarget(p, to); await p.click('#sg-act'); await p.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 60000 }); };
await p.goto(BASE); await p.waitForFunction(() => window.__convyReady); await info('en-load');
await conv('sample.png', 'JPG'); await info('en-converted');
await p.click('a.lang'); await p.waitForURL('**/tr/'); await p.waitForFunction(() => window.__convyReady); await info('tr-after-click');
await conv('sample.png', 'JPG').catch((e) => (R.trConvErr = String(e).slice(0, 120))); await info('tr-converted');
await p.goBack(); await p.waitForLoadState(); await p.waitForTimeout(800); await info('back-to-en');
const readyBack = await p.evaluate(() => !!window.__convyReady);
// does the restored/reloaded EN page still work?
try { await conv('sample.wav', 'MP3'); R.enAfterBackConvert = 'ok'; } catch (e) { R.enAfterBackConvert = String(e).slice(0, 160); }
await info('en-after-back-convert');
await p.goForward(); await p.waitForLoadState(); await p.waitForTimeout(800); await info('forward-to-tr');
try { await conv('sample.png', 'WEBP'); R.trAfterForwardConvert = 'ok'; } catch (e) { R.trAfterForwardConvert = String(e).slice(0, 160); }
await p.goBack(); await p.waitForTimeout(500); await p.click('a.lang'); await p.waitForURL('**/tr/'); await p.goBack(); await p.waitForTimeout(500); await p.click('a.lang'); await p.waitForURL('**/tr/'); await p.waitForTimeout(500); await info('hop-x3');
// device panel language switch (location.href)
await p.click('.chip-dev'); await p.waitForTimeout(300); const sw = p.locator('.dpanel .seg.two button[lang=en]'); if (await sw.count()) { await sw.click(); await p.waitForURL((u) => u.pathname === '/'); } await p.waitForTimeout(500); await info('panel-switch-to-en');
await p.goBack(); await p.waitForTimeout(500); await info('panel-back');
R.errs = errs; writeFileSync(`${OUT}/nav-${name}.json`, JSON.stringify(R, null, 1)); await b.close();
for (const s of R.steps) console.error(JSON.stringify(s));
console.error('errs', errs, R.enAfterBackConvert, R.trAfterForwardConvert, R.trConvErr);
