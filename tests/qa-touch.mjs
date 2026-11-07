// QA build-tur1: R-2026-23 touch check — after tapping, no sticky hover state (computed border of tapped-then-left chip == untouched chip).
import { chromium, webkit, devices } from 'playwright-core';
const out = {};
for (const [n, B, d] of [['chromium-pixel7', chromium, 'Pixel 7'], ['webkit-iphone13', webkit, 'iPhone 13']]) {
  const b = await B.launch(); const ctx = await b.newContext({ ...devices[d], reducedMotion: 'reduce', colorScheme: 'dark' }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4321/'); await p.waitForFunction(() => window.__convyReady);
  out[n] = { hoverMq: await p.evaluate(() => matchMedia('(hover:hover) and (pointer:fine)').matches) };
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await p.waitForTimeout(300);
  const chips = p.locator('.stage .tpick .chip'); await chips.nth(1).tap(); await chips.nth(0).tap(); await p.waitForTimeout(300);
  const bc = (i) => chips.nth(i).evaluate((e) => getComputedStyle(e).borderColor);
  out[n].tappedThenLeft = await bc(1); out[n].untouched = await bc(2);
  await p.locator('.chip-dev').tap(); await p.waitForTimeout(400); await p.screenshot({ path: `${process.env.OUT}/touch-${n}.png` });
  await b.close();
}
console.log(JSON.stringify(out));
