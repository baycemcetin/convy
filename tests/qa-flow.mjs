// QA build-tur1: flow (EN/TR) + privacy (request bodies) + COEP/cache reload test, one browser per run.
// Usage: OUT=<dir> node tests/qa-flow.mjs chromium|firefox|webkit   (serve dist on :4321)
import { chromium, firefox, webkit } from 'playwright-core';
import { writeFileSync } from 'node:fs';
const name = process.argv[2] || 'chromium';
const OUT = process.env.OUT || 'test-results/qa';
const BASE = 'http://127.0.0.1:4321/';
const cases = [['sample.png', 'JPG'], ['sample.mp4', 'WEBM'], ['sample.mp4', 'GIF']];
const browser = await { chromium, firefox, webkit }[name].launch();

async function convert(page, file, to) {
  const out = file.replace(/\.[^.]+$/, '.' + to.toLowerCase());
  await page.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`);
  await page.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) }).click({ timeout: 10000 });
  await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
  const t0 = Date.now();
  const act = page.locator('#sg-act');
  await act.click();
  const done = page.locator('.stage .readout', { hasText: out });
  const failed = page.locator('.stage .sg-say .err');
  await done.or(failed).first().waitFor({ timeout: 240000 });
  await page.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say .err'), null, { timeout: 10000 });
  const st = (await failed.count()) ? 'failed' : 'done';
  let saved = null;
  if (st === 'done') {
    const [dl] = await Promise.all([page.waitForEvent('download'), act.click()]);
    saved = { name: dl.suggestedFilename(), bytes: (await (await dl.createReadStream()).toArray()).reduce((a, b) => a + b.length, 0) };
  }
  return { file, to, st, ms: Date.now() - t0, saved, nameOk: saved?.name === out };
}
function watch(page, bag) {
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && bag.console.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => bag.console.push('pageerror: ' + e));
  page.on('request', (r) => { const b = r.postDataBuffer(); bag.reqs.push({ m: r.method(), u: r.url().replace(BASE, '/'), body: b ? b.length : 0 }); });
}
const result = { browser: name, flow: [], privacy: {}, coep: {} };
const allReqs = [];
for (const lang of ['en', 'tr']) {
  const ctx = await browser.newContext({ acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage(); const bag = { console: [], reqs: [] }; watch(page, bag);
  await page.goto(BASE + (lang === 'tr' ? 'tr/' : '')); await page.waitForFunction(() => window.__convyReady);
  for (const [f, t] of cases) { try { result.flow.push({ lang, ...(await convert(page, f, t)) }); } catch (e) { result.flow.push({ lang, file: f, to: t, st: 'exception', err: String(e).slice(0, 200) }); } }
  result.flow.filter((r) => r.lang === lang).forEach((r) => (r.console = bag.console.length));
  result['console_' + lang] = bag.console;
  allReqs.push(...bag.reqs.map((r) => ({ lang, ...r })));
  await ctx.close();
}
result.privacy = { maxBody: Math.max(0, ...allReqs.map((r) => r.body)), nonGet: allReqs.filter((r) => r.m !== 'GET'), crossOrigin: allReqs.filter((r) => /^https?:/.test(r.u)), total: allReqs.length };
// COEP: isolation flag + 3 reloads, each followed by a conversion
{
  const ctx = await browser.newContext({ acceptDownloads: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage(); const bag = { console: [], reqs: [] }; watch(page, bag);
  const status = []; page.on('response', (r) => /\/(engines|_astro)\//.test(r.url()) && status.push(r.status()));
  await page.goto(BASE); await page.waitForFunction(() => window.__convyReady);
  result.coep.crossOriginIsolated = await page.evaluate(() => self.crossOriginIsolated);
  result.coep.reloads = [];
  for (let i = 1; i <= 3; i++) {
    status.length = 0;
    await page.reload(); await page.waitForFunction(() => window.__convyReady);
    let r; try { r = await convert(page, 'sample.png', 'JPG'); } catch (e) { r = { st: 'exception', err: String(e).slice(0, 200) }; }
    result.coep.reloads.push({ i, st: r.st, bytes: r.saved?.bytes, ms: r.ms, statuses: [...new Set(status)].sort(), n304: status.filter((s) => s === 304).length });
  }
  result.coep.console = bag.console;
  result.coep.violations = bag.console.filter((c) => /Content Security Policy|CSP|Cross-Origin|COEP|blocked/i.test(c));
  await ctx.close();
}
writeFileSync(`${OUT}/_raw-${name}.json`, JSON.stringify(result, null, 1));
console.log(name, 'ok', result.flow.map((r) => r.st).join(','));
await browser.close();
