// QA tur 3 §3: real failure triggers, EN/TR stage + row screenshots (1440 and 390). Usage: OUT=<dir> node tests/qa3-reasons.mjs [browser]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t3r', B = 'http://127.0.0.1:4321/'; mkdirSync(OUT, { recursive: true });
const T = JSON.parse(readFileSync('src/i18n/metin.json', 'utf8'));
const cases = [['password.pdf', 'TXT', 'password'], ['password.pdf', 'PNG', 'password'], ['corrupt.png', 'JPG', 'unreadable'], ['corrupt.pdf', 'PNG', 'unreadable'], ['truncated.pdf', 'TXT', 'unreadable?'], ['corrupt.docx', 'MD', 'unreadable'], ['corrupt.mp4', 'WEBM', 'unreadable|codec'], ['truncated.mp4', 'WEBM', '?'], ['truncated.mp3', 'WAV', '?'], ['bomb256mp.png', 'JPG', 'pixels'], ['scanned.pdf', 'TXT', 'noText']];
const b = await { chromium, firefox, webkit }[name].launchPersistentContext(await import('node:fs').then((f) => f.mkdtempSync(require_tmp() + '/q3r-')), { acceptDownloads: true, viewport: { width: 1440, height: 900 } });
function require_tmp() { return process.env.TMPDIR || '/tmp'; }
const fm = (s, o = {}) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
const res = [];
for (const lang of ['en', 'tr']) for (const [f, to, exp] of cases) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 120))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
  await p.goto(B + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  await p.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
  const r = { lang, f, to, exp };
  try { await p.setInputFiles('[data-testid=pick]', `tests/fixtures/${f}`); await p.locator('.stage .tpick').waitFor({ timeout: 10000 });
    const c = p.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) }); if (await c.count()) await c.click(); else await p.locator('.stage .tpick select').selectOption(to);
    await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true'); await p.click('#sg-act');
    await p.waitForFunction(() => document.querySelector('.stage .sg-say .err') || /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 90000 }); await p.waitForTimeout(1800);
    Object.assign(r, await p.evaluate(() => ({ st: document.querySelector('[data-testid=item]')?.dataset.st, lbl: document.querySelector('.stage .sg-head .lbl')?.textContent, h2: document.querySelector('.stage .sg-say h2')?.textContent, p: document.querySelector('.stage .sg-say p')?.textContent, row: document.querySelector('[data-testid=item]')?.innerText.replace(/\n/g, ' | '), live: window.__live.join(' | '), act: document.getElementById('sg-act')?.textContent, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })));
    const code = Object.keys(T[lang].err).find((k) => typeof T[lang].err[k] === 'string' && r.h2 === fm(T[lang].err[k], { mp: '250', size: '1 GB', engine: T[lang].engName.pdf })); r.code = code || (r.h2 === T[lang].err.orig ? 'ORIG-fallback' : 'other');
    const tag = f.replace('.', '_') + '-' + to; await p.screenshot({ path: `${OUT}/${lang}-${name}-${tag}-1440.png` }); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/${lang}-${name}-${tag}-390.png`, fullPage: true });
    r.sw390 = await p.evaluate(() => document.documentElement.scrollWidth);
  } catch (e) { r.exc = String(e).slice(0, 160); }
  r.errs = errs; res.push(r); console.error(lang, f, to, '->', r.code || r.exc, '|', r.h2?.slice(0, 70)); await p.close();
}
writeFileSync(`${OUT}/reasons-${name}.json`, JSON.stringify(res, null, 1)); await b.close();
