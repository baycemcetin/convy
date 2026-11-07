// QA build-tur1: batch mid-run + batch done (4 files), chromium.
import { chromium } from 'playwright-core';
const OUT = process.env.OUT; const b = await chromium.launch(); const info = {};
for (const lang of ['en', 'tr']) for (const w of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:4321/' + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  await p.setInputFiles('[data-testid=pick]', ['tests/fixtures/sample.png', 'tests/fixtures/sample.png', 'tests/fixtures/sample.png', 'tests/fixtures/sample.mp4']);
  await p.locator('.stage .tpick .chip').first().click().catch(() => {}); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/batchready-${w}-dark-${lang}.png`, fullPage: true });
  await p.click('#sg-act'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/batchrun-${w}-dark-${lang}.png`, fullPage: true });
  await p.waitForFunction(() => document.querySelectorAll('[data-st=done],[data-st=failed]').length >= 3, null, { timeout: 120000 }).catch(() => {});
  await p.waitForTimeout(800);
  info[`${w}-${lang}`] = await p.evaluate(() => [...document.querySelectorAll('[data-st]')].map((e) => e.dataset.st));
  await p.screenshot({ path: `${OUT}/batchdone-${w}-dark-${lang}.png`, fullPage: true });
  await ctx.close();
}
console.log(JSON.stringify(info)); await b.close();
