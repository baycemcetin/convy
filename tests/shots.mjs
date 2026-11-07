// Wave 1 visual check: drives the real UI into states and screenshots them (EN/TR × 390/1440, dark).
// Usage: node tests/shots.mjs [outDir]   (preview on :4321)
import { chromium } from 'playwright-core';
const OUT = process.argv[2] || 'test-results/wave1';
const URL0 = process.env.URL0 || 'http://127.0.0.1:4321/';
const b = await chromium.launch();
const errs = [];
async function run(lang, w) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const p = await ctx.newPage();
  p.on('console', (m) => m.type() === 'error' && errs.push(`${lang}${w}: ${m.text()}`));
  p.on('pageerror', (e) => errs.push(`${lang}${w}: ${e}`));
  await p.goto(URL0 + (lang === 'tr' ? 'tr/' : ''));
  await p.waitForFunction(() => window.__convyReady);
  const shot = (s) => p.screenshot({ path: `${OUT}/${s}-${w}-${lang}.png`, fullPage: true });
  await shot('empty');
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png');
  await p.waitForTimeout(300); await shot('needs');
  await p.locator('.stage .chip', { hasText: 'JPG' }).click();
  await p.waitForTimeout(300); await shot('ready');
  await p.click('#sg-act');
  await p.locator('.stage .pill').waitFor({ timeout: 60000 });
  await p.waitForTimeout(400); await shot('done');
  await p.setInputFiles('[data-testid=pick]', ['tests/fixtures/sample.mp4', 'tests/fixtures/sample.png']);
  await p.waitForTimeout(500); await shot('batch');
  if (w === 1440) { await p.click('.chip-dev'); await p.waitForTimeout(300); await shot('panel'); await p.keyboard.press('Escape'); }
  else { await p.click('.chip-dev'); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/panel-${w}-${lang}.png` }); await p.keyboard.press('Escape'); }
  await ctx.close();
}
for (const lang of ['en', 'tr']) for (const w of [1440, 390]) await run(lang, w);
console.log(JSON.stringify({ errs }, null, 1));
await b.close();
