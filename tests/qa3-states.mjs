// QA tur 3 §4: new states (done+x, cleared, empty file, failed, quota block + picker) x 320/390/1440 x light/dark: overflow + WCAG AA contrast + screenshots.
// Needs test-results/big.mp4 (tests/opfs.mjs makes it) and preview on :4321. Usage: OUT=<dir> LANG=en|tr node tests/qa3-states.mjs [chromium|firefox|webkit]
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t3s', lang = process.env.QLANG || 'en', B = 'http://127.0.0.1:4321/' + (lang === 'tr' ? 'tr/' : '');
mkdirSync(OUT, { recursive: true });
const VPS = [[320, 700], [390, 844], [1440, 900]], THEMES = ['light', 'dark'];
const R = { name, lang, overflow: [], contrast: [], exempt: 0, measured: 0, errs: [], shots: 0 };
const measure = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (f, b) => { const a = f[3]; return [0, 1, 2].map((i) => f[i] * a + b[i] * (1 - a)); };
  const lum = (c) => { const l = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const bgOf = (el) => { const chain = []; let n = el, img = false; while (n && n.nodeType === 1) { const s = getComputedStyle(n); if (s.backgroundImage !== 'none') img = true; const c = rgba(s.backgroundColor); if (c[3] > 0) { chain.push(c); if (c[3] >= 0.999) break; } n = n.parentElement; } let base = [255, 255, 255]; if (!chain.length || chain[chain.length - 1][3] < 0.999) base = rgba(getComputedStyle(document.body).backgroundColor).slice(0, 3); if (!getComputedStyle(document.body).backgroundColor.match(/\d/) ) base = [255, 255, 255]; for (let i = chain.length - 1; i >= 0; i--) base = over(chain[i], base); return { c: base, img }; };
  const opac = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility === 'visible' && s.display !== 'none'; };
  const sel = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const out = { fails: [], n: 0, exempt: 0, imgBg: 0 };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seen = new Set();
  for (let t; (t = walker.nextNode());) {
    const el = t.parentElement; if (!el || seen.has(el) || !t.nodeValue.trim() || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) || !vis(el)) continue; seen.add(el);
    const s = getComputedStyle(el), fg = rgba(s.color), o = opac(el); fg[3] *= o; const { c: bg, img } = bgOf(el); if (img) out.imgBg++;
    const dis = el.closest('[disabled],[aria-disabled=true]') && !el.closest('#sg-act'); if (dis) { out.exempt++; continue; }
    const px = parseFloat(s.fontSize), large = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700), need = large ? 3 : 4.5, r = ratio(over(fg, bg), bg); out.n++;
    if (r < need - 0.005) out.fails.push({ kind: 'text', sel: sel(el), text: t.nodeValue.trim().slice(0, 40), ratio: +r.toFixed(2), need, px, fg: over(fg, bg).map(Math.round), bg: bg.map(Math.round), img });
  }
  for (const el of document.querySelectorAll('svg')) { if (!vis(el) || el.getAttribute('aria-hidden') === 'false') continue; const s = getComputedStyle(el); let col = s.fill !== 'none' && s.fill !== 'rgba(0, 0, 0, 0)' && !/^url/.test(s.fill) ? s.fill : s.stroke; if (!col || col === 'none') col = s.color; const fg = rgba(col === 'currentcolor' ? s.color : col); fg[3] *= opac(el); const { c: bg } = bgOf(el); const r = ratio(over(fg, bg), bg); if (el.closest('[disabled],[aria-disabled=true]')) { out.exempt++; continue; } out.n++; if (r < 2.995) out.fails.push({ kind: 'icon', sel: sel(el.parentElement || el), ratio: +r.toFixed(2), need: 3, fg: over(fg, bg).map(Math.round), bg: bg.map(Math.round) }); }
  out.sw = document.documentElement.scrollWidth; out.cw = document.documentElement.clientWidth;
  out.wide = [...document.querySelectorAll('body *')].filter((e) => vis(e) && e.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && !e.closest('[hidden]')).slice(0, 5).map(sel);
  return out;
};
const b = await { chromium, firefox, webkit }[name].launchPersistentContext(mkdtempSync(join(tmpdir(), 'q3s-' + name + '-')), { acceptDownloads: true, viewport: { width: 1440, height: 900 } });
const boot = async (init) => { const p = await b.newPage(); p.on('console', (m) => m.type() === 'error' && R.errs.push(m.text().slice(0, 160))); p.on('pageerror', (e) => R.errs.push(String(e).slice(0, 160))); if (init) await p.addInitScript(init); await p.goto(B); await p.waitForFunction(() => window.__convyReady); await p.waitForTimeout(1200); return p; };
const pickTarget = async (p, to) => { await p.locator('.stage .tpick').waitFor(); const c = p.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) }); if (await c.count()) await c.click(); else await p.locator('.stage .tpick select').selectOption(to); await p.waitForTimeout(300); };
async function sweep(p, tag, select) {
  for (const th of THEMES) for (const [w, h] of VPS) {
    await p.emulateMedia({ colorScheme: th, reducedMotion: 'reduce' }); await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(250);
    for (const [label, act] of select) { await act(); await p.waitForTimeout(350);
      const m = await p.evaluate(measure); const key = `${tag}-${label}-${th}-${w}`; R.measured += m.n; R.exempt += m.exempt;
      if (m.sw > m.cw || m.wide.length) R.overflow.push({ key, sw: m.sw, cw: m.cw, wide: m.wide });
      for (const f of m.fails) R.contrast.push({ key, ...f });
      if (name === 'chromium' || w === 390 || th === 'light') { await p.screenshot({ path: `${OUT}/${lang}-${name}-${key}.png`, fullPage: true }); R.shots++; } }
  }
}
// ---- mixed list: cleared (needs >50 MB), done, empty, failed
if (!process.env.ONLYQUOTA) {
  const p = await boot(() => { window.__convyClearMs = 3000; });
  await p.setInputFiles('[data-testid=pick]', ['test-results/big.mp4', 'tests/fixtures/sample.png', '/tmp/q3e/empty.png', 'tests/fixtures/corrupt.png']);
  await p.waitForFunction(() => document.querySelectorAll('[data-testid=item]').length === 4);
  for (const nm of ['big.mp4', 'sample.png', 'corrupt.png']) { await p.locator('[data-testid=item]', { hasText: nm }).first().locator('.nm-b').click(); await pickTarget(p, nm === 'big.mp4' ? 'MP4' : 'JPG'); }
  await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true'); await p.click('#sg-act');
  await p.waitForFunction(() => document.querySelectorAll('[data-st=done],[data-st=failed]').length >= 3, null, { timeout: 240000 }); await p.waitForTimeout(1500);
  R.afterConvert = await p.evaluate(() => [...document.querySelectorAll('[data-testid=item]')].map((r) => r.dataset.st));
  const sel = (nm) => () => p.locator('[data-testid=item]', { hasText: nm }).first().locator('.nm-b').click();
  await sweep(p, 'done', [['list-done', sel('sample.png')], ['empty', sel('empty.png')], ['failed', sel('corrupt.png')]]);
  // save big.mp4 -> cleared after 3 s
  await p.setViewportSize({ width: 1440, height: 900 }); await p.emulateMedia({ colorScheme: 'light' });
  await p.locator('[data-testid=item]', { hasText: 'big.mp4' }).first().locator('.nm-b').click(); await p.waitForTimeout(400); await p.focus('#sg-act');
  const dl = p.waitForEvent('download', { timeout: 20000 }); await p.keyboard.press('Enter'); await (await dl).path().catch(() => {});
  await p.waitForFunction(() => document.querySelector('[data-st=cleared]'), null, { timeout: 15000 }).catch(() => { R.noCleared = true; }); await p.waitForTimeout(500);
  R.afterSave = await p.evaluate(() => [...document.querySelectorAll('[data-testid=item]')].map((r) => r.dataset.st));
  if (!R.noCleared) await sweep(p, 'cleared', [['stage', sel('big.mp4')]]);
  await p.close();
}
// ---- quota block + picker
{
  const p = await boot(() => { navigator.storage.estimate = async () => ({ quota: 5e6, usage: 4.99e6 }); });
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await pickTarget(p, 'JPG'); await p.waitForTimeout(800);
  R.blockView = await p.evaluate(() => ({ notice: !!document.querySelector('#q-notice'), picker: !!document.querySelector('.stage .tpick'), row: document.querySelector('[data-testid=item]')?.dataset.st }));
  await sweep(p, 'quota', [['block', async () => {}]]); await p.close();
}
writeFileSync(`${OUT}/states-${lang}-${name}.json`, JSON.stringify(R, null, 1)); await b.close();
console.log(JSON.stringify({ name, lang, measured: R.measured, contrastFails: R.contrast.length, overflow: R.overflow.length, errs: R.errs.length, shots: R.shots, afterConvert: R.afterConvert, afterSave: R.afterSave, blockView: R.blockView }));
