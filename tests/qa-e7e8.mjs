// Review 2026-11-08 E7 (focus never falls to <body>) + E8 (row FLIP on remove, first rows enter, interrupted stage swap).
// Usage: node tests/qa-e7e8.mjs [chromium|firefox|webkit]   (npm run preview on :4321)   exit 1 on any failure
import { chromium, firefox, webkit } from 'playwright-core';
import { pickTarget } from './qa2-lib.mjs';
const name = process.argv[2] || 'chromium', B = 'http://127.0.0.1:4321/';
const browser = await { chromium, firefox, webkit }[name].launch();
const bad = []; const ck = (k, ok, info = '') => { console.error(ok ? 'ok  ' : 'FAIL', `${name} ${k}`, ok ? '' : JSON.stringify(info).slice(0, 240)); if (!ok) bad.push(k); };
const fx = (f) => `tests/fixtures/${f}`;
const page = async (o = {}) => { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...o }); const p = await ctx.newPage(); p.ctx = ctx;
  await p.goto(B); await p.waitForFunction(() => window.__convyReady); return p; };
const act = (p) => p.evaluate(() => { const a = document.activeElement; return a === document.body ? 'BODY' : `${a?.tagName}${a?.type ? ':' + a.type : ''}${a?.value ? '=' + a.value : ''}${a?.id ? '#' + a.id : ''}`; });
const rows = (p, n) => p.waitForFunction((n) => document.querySelectorAll('[data-testid=item]').length === n, n);
try {
  // ---- E7 a/b: Choose files goes away -> focus on the format; arrows keep focus on the chosen radio
  { const p = await page();
    await p.focus('[data-testid=choose]'); await p.setInputFiles('[data-testid=pick]', fx('sample.png'));
    await p.locator('.stage .tpick input').first().waitFor(); await p.waitForTimeout(400);
    const a0 = await act(p); ck('E7 file added: focus on a format radio, not BODY', a0.startsWith('INPUT:radio'), a0);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(450); const a1 = await act(p);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(450); const a2 = await act(p);
    const chk = await p.evaluate(() => document.querySelector('.stage .tpick input:checked')?.value);
    ck('E7 arrow selects and focus stays on the radio (x2)', a1.startsWith('INPUT:radio') && a2.startsWith('INPUT:radio') && a1 !== a2 && a2.includes('=' + chk), { a1, a2, chk });
    const conv = await p.evaluate(() => document.getElementById('sg-act')?.getAttribute('aria-disabled'));
    ck('E7 Convert enabled after keyboard pick', conv !== 'true', conv);
    // "More formats" select keeps focus after a pick
    const sel = p.locator('.stage .tpick select');
    if (await sel.count()) { await sel.focus(); const v = await sel.evaluate((s) => s.options[s.options.length - 1].value); await sel.selectOption(v); await p.waitForTimeout(450);
      const a3 = await act(p); ck('E7 More formats: focus stays on the select', a3.startsWith('SELECT'), a3); }
    await p.ctx.close(); }
  // ---- E7 c: lazy panel, slow chunk: no focus theft after Tab away; chunk fails: live region says so
  { const ctx = await browser.newContext(); await ctx.route(/DevicePanel\.[^/]+\.js$/, async (r) => { await new Promise((s) => setTimeout(s, 2500)); await r.continue(); });
    const p = await ctx.newPage(); await p.goto(B); await p.waitForFunction(() => window.__convyReady);
    await p.focus('.chip-dev'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    const busy = await p.getAttribute('.chip-dev', 'aria-busy'); ck('E7 chip aria-busy while the panel loads', busy === 'true', busy);
    await p.focus('[data-testid=choose]'); const moved = await act(p); // not Tab: WebKit's Tab skips buttons by default await p.waitForTimeout(3200);
    const after = await act(p), open = await p.evaluate(() => !document.getElementById('dp')?.hidden && !!document.getElementById('dp'));
    ck('E7 slow panel: focus not stolen after Tab away', after === moved && !open, { moved, after, open });
    await ctx.close();
    const c2 = await browser.newContext(); await c2.route(/DevicePanel\.[^/]+\.js$/, (r) => r.abort());
    const p2 = await c2.newPage(); await p2.goto(B); await p2.waitForFunction(() => window.__convyReady);
    await p2.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
    await p2.focus('.chip-dev'); await p2.keyboard.press('Enter'); await p2.waitForTimeout(1500);
    const lv = await p2.evaluate(() => window.__live.join('|')), a = await act(p2);
    ck('E7 panel chunk fails: announced, focus on the chip', /panel didn't load/.test(lv) && a.startsWith('BUTTON'), { lv, a });
    await c2.close(); }
  // ---- E8 Y2: first rows enter (0 -> 3), 1 -> 2 only the new row moves
  { const p = await page();
    await p.evaluate(() => { window.__an = []; new MutationObserver((m) => m.forEach((r) => r.addedNodes.forEach((a) => a.nodeType === 1 && [a, ...a.querySelectorAll('*')].filter((n) => n.matches('[data-testid=item]')).forEach((n) => requestAnimationFrame(() => window.__an.push(n.getAnimations().length)))))).observe(document.body, { childList: true, subtree: true }); });
    await p.setInputFiles('[data-testid=pick]', [fx('sample.png'), fx('meta.jpg'), fx('alpha.webp')]); await rows(p, 3); await p.waitForTimeout(300);
    const an = await p.evaluate(() => window.__an); ck('E8 0 -> 3: every new row has an entry animation', an.length === 3 && an.every((n) => n > 0), an);
    await p.ctx.close();
    const p2 = await page(); await p2.setInputFiles('[data-testid=pick]', fx('sample.png')); await p2.waitForTimeout(500);
    await p2.evaluate(() => { window.__an = []; new MutationObserver((m) => m.forEach((r) => r.addedNodes.forEach((a) => a.nodeType === 1 && [a, ...a.querySelectorAll('*')].filter((n) => n.matches('[data-testid=item]')).forEach((n) => requestAnimationFrame(() => window.__an.push([n.querySelector('.nm-b')?.id, n.getAnimations().length])))))).observe(document.body, { childList: true, subtree: true }); });
    await p2.setInputFiles('[data-testid=pick]', fx('meta.jpg')); await rows(p2, 2); await p2.waitForTimeout(300);
    const an2 = await p2.evaluate(() => window.__an); ck('E8 1 -> 2: old row still, new row enters', an2.length === 2 && an2[0][1] === 0 && an2[1][1] > 0, an2);
    // ---- E8 Y1: mouse remove -> rows below FLIP up (transform animation), no single-frame jump
    await p2.ctx.close(); }
  { const p2 = await page(); await p2.setInputFiles('[data-testid=pick]', [fx('sample.png'), fx('meta.jpg'), fx('meta.heic'), fx('alpha.webp')]); await rows(p2, 4);
    await pickTarget(p2, 'WEBP'); // batch picker: every image that can take WEBP (alpha.webp stays waiting)
    await p2.waitForTimeout(400); await p2.click('#sg-act');
    await p2.waitForFunction(() => [...document.querySelectorAll('[data-testid=item]')].filter((r) => r.dataset.st === 'done').length >= 3, null, { timeout: 90000 }); await p2.waitForTimeout(1500);
    const res = await p2.evaluate(async () => {
      const all = () => [...document.querySelectorAll('[data-testid=item]')]; const last = all().at(-1), y0 = last.getBoundingClientRect().top;
      let shift = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => (shift += e.value))).observe({ type: 'layout-shift', buffered: false });
      const rm = all().find((r) => r.querySelector('[data-testid=rm]') && r !== last)?.querySelector('[data-testid=rm]'); rm?.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      const ys = []; let flip = false; for (let i = 0; i < 30; i++) { await new Promise(requestAnimationFrame); ys.push(Math.round(last.getBoundingClientRect().top)); flip ||= last.getAnimations().some((a) => /transform/.test(JSON.stringify(a.effect?.getKeyframes?.() ?? []))); }
      const jumps = ys.map((y, i) => Math.abs(y - (i ? ys[i - 1] : y0))); return { y0, ys, maxJump: Math.max(...jumps), flip, shift: +shift.toFixed(4), rmFound: !!rm };
    });
    ck('E8 remove: rows below FLIP (transform, no jump > 40 px in one frame)', res.flip && res.maxJump < 40, res);
    await p2.ctx.close(); }
  // ---- E8 Y3: interrupted stage swap: a pinned (leaving) layer never gets more opaque
  { const p = await page(); await p.setInputFiles('[data-testid=pick]', [fx('sample.png'), fx('meta.jpg'), fx('alpha.webp'), fx('photo12mp.png')]); await rows(p, 4); await p.waitForTimeout(500);
    const r = await p.evaluate(async () => {
      const seen = new Map(); let rises = 0, samples = 0; let stop = false;
      (async () => { while (!stop) { await new Promise(requestAnimationFrame); for (const n of document.querySelectorAll('.stage .sg-name')) { if (getComputedStyle(n).position !== 'absolute') continue; const o = +getComputedStyle(n).opacity; samples++; if (seen.has(n) && o > seen.get(n) + 0.01) rises++; seen.set(n, o); } } })();
      const btns = () => [...document.querySelectorAll('.row .nm-b')];
      for (let i = 0; i < 6; i++) { btns()[i % btns().length].dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })); await new Promise((s) => setTimeout(s, 85)); }
      await new Promise((s) => setTimeout(s, 600)); stop = true; return { rises, samples };
    });
    ck('E8 interrupted swap: leaving layer never rises', r.rises === 0 && r.samples > 0, r);
    await p.ctx.close(); }
} finally { await browser.close(); }
console.error(bad.length ? `${name}: ${bad.length} FAIL` : `${name}: all ok`); process.exit(bad.length ? 1 : 0);
