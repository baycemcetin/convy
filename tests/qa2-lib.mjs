// QA build-tur2 shared helpers. Usage from qa2-*.mjs. Serve dist on :4321 first (npm run preview).
import { chromium, firefox, webkit } from 'playwright-core';
export const BASE = 'http://127.0.0.1:4321/';
export const launch = (n) => ({ chromium, firefox, webkit })[n || 'chromium'].launch();
export async function open(ctx, lang = 'en') {
  const p = await ctx.newPage(); p.errs = [];
  p.on('console', (m) => m.type() === 'error' && p.errs.push(m.text())); p.on('pageerror', (e) => p.errs.push(String(e)));
  await p.goto(BASE + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  await p.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
  return p;
}
export async function pickTarget(p, to) {
  await p.locator('.stage .tpick').waitFor({ timeout: 10000 });
  const chip = p.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
  if (await chip.count()) await chip.click(); else await p.locator('.stage .tpick select').selectOption(to);
}
/** add file, choose target, Convert, wait for done|failed. returns snapshot */
export async function run(p, file, to, { timeout = 120000, save = false } = {}) {
  await p.setInputFiles('[data-testid=pick]', file.startsWith('/') ? file : `tests/fixtures/${file}`);
  await pickTarget(p, to);
  await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
  const t0 = Date.now(); await p.click('#sg-act');
  await p.locator('.stage .readout:has(.v)').first().waitFor({ timeout: 1 }).catch(() => {});
  await p.waitForFunction(() => /Save|Kaydet|Try again|Yeniden/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say .err'), null, { timeout });
  await p.waitForTimeout(500);
  return snap(p, Date.now() - t0, save);
}
export async function snap(p, ms = 0, save = false) {
  const o = await p.evaluate(() => ({
    label: document.querySelector('.stage .sg-head .lbl')?.textContent, say: document.querySelector('.stage .sg-say')?.innerText || null,
    act: document.getElementById('sg-act')?.textContent, rowSt: [...document.querySelectorAll('[data-testid=item]')].map((r) => r.dataset.st),
    readout: document.querySelector('.stage .readout')?.innerText || null,
    pv: document.querySelector('.stage .pv') ? { tag: document.querySelector('.stage .pv img') ? 'img' : document.querySelector('.stage .pv pre') ? 'text' : document.querySelector('.stage .pv video') ? 'video' : document.querySelector('.stage .pv audio') ? 'audio' : '?', nw: document.querySelector('.stage .pv img')?.naturalWidth, nh: document.querySelector('.stage .pv img')?.naturalHeight, text: document.querySelector('.stage .pv pre')?.textContent.slice(0, 200) } : null,
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
  }));
  o.ms = ms;
  if (save && /Save|Kaydet/.test(o.act)) { const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#sg-act')]); const b = (await (await dl.createReadStream()).toArray()); o.saved = { name: dl.suggestedFilename(), bytes: b.reduce((a, c) => a + c.length, 0) }; o.buf = Buffer.concat(b); }
  return o;
}
