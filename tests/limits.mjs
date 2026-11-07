// Engine limits (review [11]): pdf.js logs no "fake worker" warning, a 100-inch PDF page renders at the 4000 px cap,
// a 249 KB PNG claiming 256 MP fails in ms (magick ResourceLimits) and the image engine still converts afterwards,
// HTML output is titled after the file. Usage: node tests/limits.mjs [chromium|firefox|webkit]  (preview on :4321 or URL0)
import { readFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', URL0 = process.env.URL0 || 'http://localhost:4321/';
const b = await { chromium, firefox, webkit }[name].launch();
const page = await b.newPage({ acceptDownloads: true });
const warns = [], errs = [];
page.on('console', (m) => { if (process.env.DEBUG && m.text().startsWith('[convy]')) console.error(m.text().slice(0, 300)); if (m.type() === 'warning' && /fake worker/i.test(m.text())) warns.push(m.text().slice(0, 140)); if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
await page.goto(URL0); await page.waitForFunction(() => window.__convyReady);
const saved = async () => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('#sg-act')]); return readFileSync(await dl.path()); };
async function conv(file, to) {
  await page.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`);
  await page.locator('.log .nm-b', { hasText: file }).last().click().catch(() => {}); // stage the new row (a failed row keeps the stage)
  await page.locator('.stage .tpick').waitFor({ timeout: 10000 });
  const chip = page.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
  if (await chip.count()) await chip.click(); else await page.locator('.stage .tpick select').selectOption(to);
  await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
  const t0 = Date.now(); await page.click('#sg-act');
  await page.waitForFunction(() => /Save|Try again/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 120000 });
  return { file, to, ms: Date.now() - t0, ok: /Save/.test(await page.locator('#sg-act').textContent()) };
}
const res = [];
let r = await conv('sample.pdf', 'TXT'); res.push(r);
r = await conv('poster.pdf', 'PNG'); if (r.ok) { const p = await saved(); r.px = [p.readUInt32BE(16), p.readUInt32BE(20)]; } res.push(r);
r = await conv('sample.md', 'HTML'); if (r.ok) r.title = ((await saved()).toString('utf8').match(/<title>(.*)<\/title>/) || [])[1]; res.push(r);
res.push(await conv('bomb256mp.png', 'JPG'));
// the stage keeps a failed file in view, so the next image is read from its log row (Save appears when done)
r = { file: 'sample.png', to: 'JPG' }; await page.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png');
await page.locator('.log .nm-b', { hasText: 'sample.png' }).last().click(); await page.locator('.stage .tpick .chip', { hasText: /^JPG$/ }).click(); await page.click('#sg-act');
r.ok = await page.locator('.log [data-testid=save]').first().waitFor({ timeout: 60000 }).then(() => true, () => false); res.push(r);
const pass = res[0].ok && res[1].px?.join() === '4000,4000' && res[2].title === 'sample' && !res[3].ok && res[3].ms < 5000 && res[4].ok && !warns.length && !errs.length;
console.log(JSON.stringify({ browser: name, pass, res, warns, errs }, null, 1));
await b.close();
process.exit(pass ? 0 : 1);
