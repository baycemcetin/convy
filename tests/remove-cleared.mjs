// KALDIR-VE-SILINDI acceptance (7 criteria): × on finished rows, the "cleared" state after the OPFS copy is deleted, Convert again,
// ZIP counts, keyboard/reduced motion, re-save cancels the first timer. The 60 s clock is shortened with window.__convyClearMs
// (a test hook; the product keeps 60 s). Needs test-results/big.mp4 (>50 MB, made by tests/opfs.mjs) and the preview on :4321.
// Usage: node tests/remove-cleared.mjs [chromium|firefox|webkit]    env: URL0 (e.g. http://localhost:4321/tr/), SHOTS=<dir>
import { existsSync, mkdtempSync, mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', URL0 = process.env.URL0 || 'http://localhost:4321/', BIG = 'test-results/big.mp4', CLEAR = 3000;
const lang = /\/tr\/?$/.test(URL0) ? 'tr' : 'en';
const T = JSON.parse(readFileSync('src/i18n/metin.json', 'utf8'))[lang];
const fm = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
if (!existsSync(BIG)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=1280x720:r=30:d=2', '-vf', 'noise=alls=40:allf=t,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'ultrafast', '-crf', '4', BIG]);
const dir = mkdtempSync(join(tmpdir(), 'convy-rc-'));
const errs = [], r = {}, bad = [];
const check = (k, ok, info) => { console.error(ok ? 'ok  ' : 'FAIL', k); r[k] = info === undefined ? !!ok : info; if (!ok) bad.push(k); };
const launch = (extra = {}) => ({ chromium, firefox, webkit })[name].launchPersistentContext(mkdtempSync(join(tmpdir(), 'convy-rcp-')), { acceptDownloads: true, ...extra }); // persistent: WebKit refuses OPFS otherwise
async function boot(ctx, url = URL0) {
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await page.addInitScript((ms) => { window.__convyClearMs = ms; }, CLEAR);
  await page.goto(url); await page.waitForFunction(() => window.__convyReady); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__live = []; const l = document.getElementById('live'); new MutationObserver(() => l.textContent && window.__live.push(l.textContent)).observe(l, { childList: true, characterData: true, subtree: true }); });
  return page;
}
const ls = (p) => p.evaluate(async () => { const o = []; const walk = async (d, pre) => { for await (const [n, h] of d.entries()) { if (h.kind === 'directory') await walk(h, pre + n + '/'); else o.push(pre + n); } }; await walk(await navigator.storage.getDirectory(), ''); return o; });
const focusId = (p) => p.evaluate(() => document.activeElement?.id || document.activeElement?.dataset?.testid || document.activeElement?.tagName);
const row = (p, i) => p.locator('[data-testid=item]').nth(i);
const states = (p) => p.locator('[data-testid=item]').evaluateAll((e) => e.map((x) => x.dataset.st));
async function pickTargets(p, want) { // pin each file that still needs a target, click its chip (image batches take one choice)
  for (let k = 0; k < 6; k++) {
    const n = await p.locator('[data-testid=item][data-st=needs]').count(); if (!n) break;
    const el = p.locator('[data-testid=item][data-st=needs]').first();
    const nm = (await el.locator('.nm-b').textContent()).trim(); await el.locator('.nm-b').click();
    const to = want(nm), chip = p.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
    await p.locator('.stage .tpick').waitFor(); if (await chip.count()) await chip.click(); else await p.locator('.stage .tpick select').selectOption(to);
    await p.waitForTimeout(300);
  }
}
const convertAll = async (p) => { await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true'); await p.click('#sg-act'); };
const inputs = (p, files) => p.setInputFiles('[data-testid=pick]', files);
const box = (loc) => loc.evaluate((e) => { const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
async function shot(p, tag) {
  if (!process.env.SHOTS) return;
  mkdirSync(process.env.SHOTS, { recursive: true });
  for (const [w, h] of [[390, 844], [1440, 900]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(300); await p.screenshot({ path: join(process.env.SHOTS, `${tag}-${lang}-${w}.png`), fullPage: true }); }
  await p.setViewportSize({ width: 1280, height: 800 });
}

// ---------- A. big outputs: save, re-save, cleared, Convert again, ZIP counts ----------
{
  const ctx = await launch(), p = await boot(ctx);
  console.error('A: add + convert'); await inputs(p, [BIG, BIG, 'tests/fixtures/sample.png']);
  await p.waitForFunction(() => document.querySelectorAll('[data-testid=item]').length === 3);
  await pickTargets(p, (nm) => (/\.mp4$/.test(nm) ? 'MP4' : 'JPG'));
  await convertAll(p);
  await p.waitForFunction(() => document.querySelectorAll('[data-st=done]').length === 3, null, { timeout: 240000 });
  await p.waitForTimeout(1500);
  check('A0 three done, two OPFS files', (await ls(p)).length === 2, await ls(p));

  // criterion 1: × on every finished, non-staged row; name = "Remove {input name}"; hit area >= 44 x 44 on a phone
  const rm0 = row(p, 0).locator('[data-testid=rm]');
  check('1 × visible, labelled', (await rm0.count()) === 1 && (await rm0.getAttribute('aria-label')) === fm(T.a11y.remove, { name: 'big.mp4' }), await rm0.getAttribute('aria-label'));
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(200);
  const hit = await rm0.evaluate((e) => { const b = e.getBoundingClientRect(), cx = b.x + b.width / 2, cy = b.y + b.height / 2; const ok = (x, y) => { const t = document.elementFromPoint(x, y); return t === e || e.contains(t); }; return { w: b.width, ok: [[-21, -21], [21, -21], [-21, 21], [21, 21]].map(([dx, dy]) => ok(cx + dx, cy + dy)) }; });
  check('1 hit area 44x44 at 390', hit.w >= 44 && hit.ok.every(Boolean), hit);
  await p.setViewportSize({ width: 1280, height: 800 });

  // criterion 3 + 7 (re-save): stage file 0, Save twice 2 s apart; the first timer must not fire; frame size stays; the slot node keeps focus
  await row(p, 0).locator('.nm-b').click(); await p.waitForTimeout(400);
  const pv0 = await box(p.locator('.stage .pv.tile'));
  await p.focus('#sg-act'); await p.evaluate(() => { window.__slot = document.getElementById('sg-act'); });
  // keyboard activation below: WebKit does not focus a button on click
  const dl = async () => { await p.focus('#sg-act'); const [d] = await Promise.all([p.waitForEvent('download'), p.keyboard.press('Enter')]); const bytes = (await (await d.createReadStream()).toArray()).reduce((a, c) => a + c.length, 0); return bytes; };
  const t0 = Date.now(); const b1 = await dl(); await p.waitForTimeout(2000); const b2 = await dl();
  check('7 second download readable', b1 > 0 && b2 === b1, [b1, b2]);
  await p.waitForTimeout(Math.max(0, t0 + CLEAR + 700 - Date.now())); // past the first timer of file 0
  check('7 re-save cancelled the first timer', (await states(p))[0] === 'done' && (await ls(p)).length >= 1, await states(p));
  await p.waitForFunction(() => document.querySelector('[data-testid=item]').dataset.st === 'cleared', null, { timeout: 8000 });
  check('3 stage: same slot node, focus kept, Convert again, no Volt', await p.evaluate((rb) => { const s = document.getElementById('sg-act'); return window.__slot === s && document.activeElement === s && s.textContent.trim() === rb && !document.querySelector('.stage .pill, .stage [data-volt]') && !!document.querySelector('.stage .stx.cl'); }, T.btn.reconvert));
  // row 1 (not staged): its own Save button keeps focus across the switch to Convert again
  await row(p, 1).locator('[data-testid=save]').focus(); await p.evaluate(() => { window.__rowBtn = document.activeElement; });
  await Promise.all([p.waitForEvent('download'), p.keyboard.press('Enter')]);
  await p.waitForFunction(() => document.querySelectorAll('[data-st=cleared]').length === 2, null, { timeout: 8000 });
  check('3 row says cleared, button Convert again (same node, focus kept)', await p.evaluate(({ rb, tx, rc }) => { const b = window.__rowBtn, t = b.closest('.row'); return document.activeElement === b && b.textContent.trim() === rb && t.querySelector('.stx').textContent.includes(tx) && b.getAttribute('aria-label').startsWith(rc); }, { rb: T.btn.reconvert, tx: T.st.cleared, rc: T.a11y.reconvert.split('{')[0] }));
  const pv1 = await box(p.locator('.stage .pv.tile.gone'));
  check('3 preview frame same size, empty state text', pv1.join() === pv0.join() && (await p.locator('.stage .pv.gone p').textContent()) === T.stage.cleared, [pv0, pv1]);
  check('3 OPFS files deleted', (await ls(p)).length === 0, await ls(p));
  check('3 no live announcement for cleared', !(await p.evaluate(() => window.__live)).some((m) => /cleared|deleted its copy|kopyas/i.test(m)));
  await shot(p, 'cleared-two');

  // criterion 5: ZIP counts only what still exists; cleared files in the note; summary counts them as finished
  await p.setViewportSize({ width: 1280, height: 800 });
  // convert file 1 again → done; file 0 stays cleared
  await row(p, 1).locator('[data-testid=reconvert]').click();
  await p.waitForFunction(() => document.querySelectorAll('[data-testid=item]')[1].dataset.st === 'done', null, { timeout: 120000 });
  check('4 Convert again re-ran, row back to done', (await states(p)).join() === 'cleared,done,done', await states(p));
  const zipTxt = await p.locator('[data-testid=zip]').textContent(), why = await p.locator('#zip-why').textContent();
  check('5 ZIP counts done only (2), note skippedOne', zipTxt.trim() === fm(T.btn.saveDone, { d: 2 }) && why.includes(fm(T.batch.skippedOne, { n: 1 })), [zipTxt, why]);
  check('5 summary counts cleared as finished', (await p.locator('.sum .data').first().textContent()).trim() === fm(T.batch.doneOf, { d: 3, n: 3 }), await p.locator('.sum .data').first().textContent());
  const [zd] = await Promise.all([p.waitForEvent('download'), p.click('[data-testid=zip]')]);
  const zpath = join(dir, 'z.zip'); await zd.saveAs(zpath);
  const entries = execFileSync('unzip', ['-Z1', zpath]).toString().trim().split('\n');
  check('5 ZIP holds 2 files', entries.length === 2, entries);
  await p.waitForFunction(() => document.querySelectorAll('[data-st=cleared]').length === 2, null, { timeout: 8000 });
  check('5 two skipped (plural)', (await p.locator('#zip-why').textContent()).includes(fm(T.batch.skipped, { n: 2 })) && (await p.locator('[data-testid=zip]').textContent()).trim() === fm(T.btn.saveDone, { d: 1 }));
  // remove the small result: every remaining result is cleared → no ZIP button, no note
  await row(p, 2).locator('[data-testid=rm]').click(); await p.waitForTimeout(500);
  check('5 all cleared: ZIP button and note hidden', (await p.locator('[data-testid=zip], #zip-why').count()) === 0);

  // criterion 4 (no room): the quota check blocks Convert again
  await p.evaluate(() => { window.__est = navigator.storage.estimate.bind(navigator.storage); navigator.storage.estimate = async () => ({ quota: 1e6, usage: 0 }); });
  await row(p, 1).locator('[data-testid=reconvert]').click(); await p.waitForTimeout(600);
  check('4 no room: row blocked, nothing started', (await states(p))[1] === 'ready' && (await row(p, 1).locator('.stx').textContent()).trim() === T.st.blocked, await states(p));
  await p.evaluate(() => { navigator.storage.estimate = window.__est; });
  await row(p, 1).getByRole('button', { name: fm(T.a11y.remove, { name: 'big.mp4' }) }).click(); await p.waitForTimeout(400);
  // the stage's own Remove removes the last cleared file; nothing left → Choose files has focus
  await p.waitForFunction(() => document.querySelectorAll('[data-testid=item]').length === 0); // one file: no queue rows
  check('2 row Remove, one file left: focus on the slot', (await focusId(p)) === 'sg-act', await focusId(p));
  await p.getByRole('button', { name: fm(T.a11y.remove, { name: 'big.mp4' }) }).click(); await p.waitForTimeout(400);
  check('2 last file removed: Choose files focused', await p.evaluate(() => document.activeElement === document.querySelector('[data-testid=choose]')));
  await ctx.close();
}

// ---------- B. focus, announcements, motion (cheap PNG batch) ----------
async function pngBatch(p) {
  await inputs(p, ['tests/fixtures/sample.png', 'tests/fixtures/sample.tiff', 'tests/fixtures/small.tif']);
  await p.waitForFunction(() => document.querySelectorAll('[data-testid=item]').length === 3);
  await pickTargets(p, () => 'JPG'); await convertAll(p);
  await p.waitForFunction(() => document.querySelectorAll('[data-st=done]').length === 3, null, { timeout: 60000 }); await p.waitForTimeout(1500);
}
const names = (p) => p.locator('[data-testid=item] .nm-b').allTextContents().then((a) => a.map((x) => x.trim()));
{
  const ctx = await launch(), p = await boot(ctx);
  await pngBatch(p);
  const nm = await names(p); // [sample.png, sample.tiff, small.tif]; the stage shows the last result
  // 1) keyboard on row 0 → next row's name; 0 ms; announced once
  await row(p, 0).locator('[data-testid=rm]').focus();
  const waitGone = p.evaluate(() => new Promise((res) => { document.addEventListener('keydown', () => setTimeout(() => res(document.querySelectorAll('[data-testid=item]').length), 40), { once: true }); }));
  await p.keyboard.press('Enter'); const left40 = await waitGone;
  await p.waitForTimeout(200);
  check('6 keyboard: row gone within 40 ms', left40 === 2, left40);
  check('2 focus → next row name', (await focusId(p)).startsWith('nm-') && (await p.evaluate(() => document.activeElement.textContent.trim())) === nm[1], await focusId(p));
  check('2 announced once', (await p.evaluate(() => window.__live)).filter((m) => m.includes(fm(T.live.removed, { name: nm[0] }))).length === 1);
  // 2) mouse on the last row (row 1 is staged elsewhere) → previous row's name; the fade is still running at 40 ms
  await ctx.close();
}
{
  const ctx = await launch(), p = await boot(ctx);
  await pngBatch(p);
  const nm = await names(p);
  await row(p, 0).locator('.nm-b').click(); await p.waitForTimeout(400); // stage file 0 so the last row carries ×
  const waitMouse = p.evaluate(() => new Promise((res) => { document.addEventListener('click', () => setTimeout(() => res(document.querySelectorAll('[data-testid=item]').length), 40), { once: true, capture: true }); }));
  await row(p, 2).locator('[data-testid=rm]').click(); const at40 = await waitMouse;
  await p.waitForTimeout(500);
  check('6 mouse: exit animates (row still there at 40 ms)', at40 === 3, at40);
  check('2 focus → previous row name', (await p.evaluate(() => document.activeElement.textContent.trim())) === nm[1], await focusId(p));
  // 3) one file left → the slot
  await row(p, 1).locator('[data-testid=rm]').click(); await p.waitForTimeout(500);
  check('2 one file left: focus on the slot', (await focusId(p)) === 'sg-act', await focusId(p));
  check('2 announced once each', (await p.evaluate(() => window.__live)).filter((m) => /removed|kaldırıldı/.test(m)).length === 2);
  // 4) Remove on the stage, single file → Choose files; the OPFS-free result is gone
  await p.getByRole('button', { name: fm(T.a11y.remove, { name: nm[0] }) }).click(); await p.waitForTimeout(500);
  check('2 stage Remove → Choose files', await p.evaluate(() => document.activeElement === document.querySelector('[data-testid=choose]')));
  await ctx.close();
}
{
  const ctx = await launch({ reducedMotion: 'reduce' }), p = await boot(ctx);
  await pngBatch(p);
  await row(p, 0).locator('.nm-b').click(); await p.waitForTimeout(300);
  const w = p.evaluate(() => new Promise((res) => { document.addEventListener('click', () => setTimeout(() => res(document.querySelectorAll('[data-testid=item]').length), 40), { once: true, capture: true }); }));
  await row(p, 2).locator('[data-testid=rm]').click();
  check('6 reduced motion: row gone at 40 ms with the mouse', (await w) === 2, await w);
  await ctx.close();
}

// ---------- C. 320 / 390 / 1440 overflow (cleared row text in this language) ----------
{
  const ctx = await launch(), p = await boot(ctx);
  await inputs(p, [BIG, 'tests/fixtures/sample.png']);
  await p.waitForFunction(() => document.querySelectorAll('[data-testid=item]').length === 2);
  await pickTargets(p, (nm) => (/\.mp4$/.test(nm) ? 'MP4' : 'JPG')); await convertAll(p);
  await p.waitForFunction(() => document.querySelectorAll('[data-st=done]').length === 2, null, { timeout: 240000 });
  await row(p, 1).locator('.nm-b').click(); await p.waitForTimeout(300);
  await row(p, 0).locator('[data-testid=save]').click(); // row 0 not staged → its own Save
  await p.waitForFunction(() => document.querySelector('[data-testid=item]').dataset.st === 'cleared', null, { timeout: 15000 });
  const ov = {};
  for (const w of [320, 390, 1440]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(300); ov[w] = await overflow(p); }
  check('7 no horizontal overflow 320/390/1440', Object.values(ov).every((v) => v <= 0), ov);
  const cl = row(p, 0); await p.setViewportSize({ width: 320, height: 900 }); await p.waitForTimeout(300);
  const lay = await cl.evaluate((e) => { const st = e.querySelector('.st').getBoundingClientRect(), dt = e.querySelector('.dt').getBoundingClientRect(), nm = e.querySelector('.nm').getBoundingClientRect(); return { actionsBelowData: st.top >= dt.bottom - 1, nameW: Math.round(nm.width), right: Math.round(st.right) }; });
  check('7 phone: cleared row actions under the data line', lay.actionsBelowData && lay.right <= 320, lay);
  await shot(p, 'cleared-queue');
  await ctx.close();
}

console.log(JSON.stringify({ browser: name, lang, pass: !bad.length && !errs.length, failed: bad, ...r, errs }, null, 1));
process.exit(!bad.length && !errs.length ? 0 : 1);
