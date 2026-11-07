// QA build-tur1: device panel, viewport screenshot (sheet at 390 is position:fixed, fullPage distorts it).
import { chromium } from 'playwright-core';
const OUT = process.env.OUT; const b = await chromium.launch();
for (const theme of ['dark', 'light']) for (const lang of ['en', 'tr']) for (const w of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, reducedMotion: 'reduce', colorScheme: theme });
  await ctx.addInitScript((t) => { try { localStorage.setItem('convy-theme', t); } catch {} }, theme);
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:4321/' + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  await p.click('.chip-dev'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/panel-${w}-${theme}-${lang}.png` });
  await ctx.close();
}
await b.close();
