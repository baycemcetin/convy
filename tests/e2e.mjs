// Smoke e2e: pick → target → Convert → Save, against `astro preview` (dist + local headers).
// Usage: node tests/e2e.mjs [chromium|firefox|webkit] [--shots dir]   (preview must be running on :4321)
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium';
const URL0 = process.env.URL0 || 'http://localhost:4321/';
const cases = [['sample.png', 'JPG'], ['sample.mp4', 'WEBM'], ['sample.mp4', 'GIF']];
const browser = await { chromium, firefox, webkit }[name].launch();
const page = await browser.newPage({ acceptDownloads: true });
const errs = [];
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(URL0);
const res = [];
for (const [file, to] of cases) {
  console.error('case', file, to); await page.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`);
  const row = page.locator('[data-testid=item]').last();
  await row.locator('[data-testid=target]').selectOption(to);
  await page.waitForTimeout(300); console.error(await row.innerText()); await page.click('[data-testid=convert]');
  const t0 = Date.now();
  await row.locator('[data-st=done],[data-st=failed]').or(row.and(page.locator('[data-st=done],[data-st=failed]'))).first().waitFor({ timeout: 180000 });
  const st = await row.getAttribute('data-st');
  let saved = null;
  if (st === 'done') {
    const [dl] = await Promise.all([page.waitForEvent('download'), row.locator('[data-testid=save]').click()]);
    saved = { name: dl.suggestedFilename(), bytes: (await (await dl.createReadStream()).toArray()).reduce((a, b) => a + b.length, 0) };
  }
  res.push({ file, to, st, ms: Date.now() - t0, saved, text: await row.innerText() });
}
console.log(JSON.stringify({ browser: name, coi: await page.evaluate(() => self.crossOriginIsolated), res, errs }, null, 1));
await browser.close();
process.exit(res.every((r) => r.st === 'done' && r.saved?.bytes > 0) ? 0 : 1);
