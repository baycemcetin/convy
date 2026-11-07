// E2E through the real UI: pick file → target chip on the stage → #sg-act Convert → wait for the result → #sg-act Save (download).
// Usage: node tests/e2e.mjs [chromium|firefox|webkit]   (`npm run preview` must be running on :4321)
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
await page.waitForFunction(() => window.__convyReady);
const res = [];
for (const [file, to] of cases) {
  const out = file.replace(/\.[^.]+$/, '.' + to.toLowerCase());
  await page.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`);
  const chip = page.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
  await chip.click({ timeout: 10000 });
  const act = page.locator('#sg-act');
  await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
  const t0 = Date.now();
  await act.click();
  // result: the readout's Result field names the output and the slot became Save; or the stage shows the failure
  const done = page.locator('.stage .readout', { hasText: out }).and(page.locator('.stage .readout'));
  const failed = page.locator('.stage .sg-say .err');
  await done.or(failed).first().waitFor({ timeout: 180000 });
  await page.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say .err'), null, { timeout: 10000 });
  const st = (await failed.count()) ? 'failed' : 'done';
  let saved = null;
  if (st === 'done') {
    const [dl] = await Promise.all([page.waitForEvent('download'), act.click()]);
    saved = { name: dl.suggestedFilename(), bytes: (await (await dl.createReadStream()).toArray()).reduce((a, b) => a + b.length, 0) };
  }
  res.push({ file, to, st, ms: Date.now() - t0, saved });
}
console.log(JSON.stringify({ browser: name, coi: await page.evaluate(() => self.crossOriginIsolated), res, errs }, null, 1));
await browser.close();
process.exit(res.every((r) => r.st === 'done' && r.saved?.bytes > 0 && r.saved.name === r.file.replace(/\.[^.]+$/, '.' + r.to.toLowerCase())) && !errs.length ? 0 : 1);
