// Wave 3 probe: live.batch counts only the current batch (1 file converted first, then a batch of 2 → "2 files converted").
import { chromium } from 'playwright-core';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(process.env.URL0 || 'http://127.0.0.1:4321/'); await p.waitForFunction(() => window.__convyReady);
await p.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
const pick = async (f) => { await p.setInputFiles('[data-testid=pick]', f); await p.waitForTimeout(400); };
await pick('tests/fixtures/sample.png');
await p.locator('.stage .tpick .chip', { hasText: /^JPG$/ }).click(); await p.click('#sg-act');
await p.waitForFunction(() => document.querySelectorAll('[data-st=done]').length === 1 || document.querySelector('.stage .pill'), null, { timeout: 60000 });
await p.waitForTimeout(1500);
await pick(['tests/fixtures/sample.wav', 'tests/fixtures/sample.mp3']);
for (const to of ['MP3', 'WAV']) { await p.locator('.stage .tpick').waitFor(); const c = p.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) }); if (await c.count()) await c.click(); await p.waitForTimeout(1400); }
await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
await p.click('#sg-act');
await p.waitForFunction(() => document.querySelectorAll('[data-st=done]').length === 3, null, { timeout: 60000 }); await p.waitForTimeout(2000);
const live = await p.evaluate(() => window.__live);
const approx = await p.evaluate(() => [...document.querySelectorAll('.sr')].map((e) => e.textContent).filter((t) => /about/.test(t)).length);
console.log(JSON.stringify({ live, approxSrNodes: approx }, null, 1)); await b.close();
