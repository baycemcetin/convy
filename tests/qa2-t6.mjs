// QA build-tur2 §1 (T6): engine-fetch failure + recovery, stop / retry / remove, failed-in-batch. Usage: OUT=<dir> node tests/qa2-t6.mjs [browser]
import { launch, open, pickTarget, snap } from './qa2-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2'; mkdirSync(OUT, { recursive: true });
const F = (f) => process.cwd() + '/tests/fixtures/' + f;
const b = await launch(name); const R = {}; const W = (p, ms) => p.waitForTimeout(ms);
const rows = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid=item]')].map((r) => `${r.querySelector('.nm-b')?.textContent.trim()}:${r.dataset.st}`));
const state = async (p) => { const s = await snap(p); return { label: s.label, act: s.act, say: s.say?.replace(/\n/g, ' / '), rows: await rows(p), focus: await p.evaluate(() => document.activeElement?.id || document.activeElement?.className || document.activeElement?.tagName) }; };
const done = (p, ms = 60000) => p.waitForFunction(() => !document.querySelector('[data-st=running],[data-st=queued]') && document.querySelectorAll('[data-testid=item]').length || !document.querySelector('.stage .sg-head ~ .sg-meter [role=progressbar]') && /Save|Try again/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: ms }).catch(() => 'HANG');
async function add(p, files, to) { await p.setInputFiles('[data-testid=pick]', files.map(F)); await pickTarget(p, to); await W(p, 400); }

// a) engine file fetch fails (page online, wasm aborted) → fail + recovery after route removed
for (const [tag, file, to, glob] of [['image', 'sample.png', 'JPG', '**/engines/magick*/**'], ['doc', 'sample.md', 'DOCX', '**/engines/pandoc*/**'], ['pdf', 'sample.pdf', 'TXT', '**/engines/pdfjs*/**'], ['av', 'sample.wav', 'MP3', '**/engines/ffmpeg*/**']]) {
  const ctx = await b.newContext({}); const p = await open(ctx); const o = R['enginefail-' + tag] = {};
  await ctx.route(glob, (r) => r.abort()); await add(p, [file], to); await p.click('#sg-act'); await W(p, 6000);
  o.afterFail = await state(p); await p.screenshot({ path: `${OUT}/enginefail-${tag}-${name}.png` });
  await ctx.unroute(glob);
  if (/Try again/.test(o.afterFail.act || '')) { await p.click('#sg-act'); await W(p, 8000); o.afterRetryOnline = await state(p); } else o.note = 'no retry slot: ' + o.afterFail.act;
  o.live = await p.evaluate(() => window.__live); o.errs = p.errs.slice(0, 4); await ctx.close();
}
// b) stop a running video (GIF), then convert again
{ const ctx = await b.newContext({}); const p = await open(ctx); const o = R.stopVideo = {};
  await add(p, ['sample.mp4'], 'GIF'); await p.click('#sg-act'); await W(p, 1500); o.running = await state(p);
  await p.click('#sg-act'); await W(p, 500); o.afterStop = await state(p); await p.screenshot({ path: `${OUT}/stopped-${name}.png` });
  await p.click('#sg-act'); await W(p, 20000); o.afterAgain = await state(p); o.live = await p.evaluate(() => window.__live); o.errs = p.errs; await ctx.close(); }
// c) batch of slow images: stop one (queued), stop all, convert again, remove running
{ const ctx = await b.newContext({}); const p = await open(ctx); const o = R.batchStop = {};
  await add(p, ['big15mp.jpg', 'big15mp.jpg', 'big15mp.jpg', 'sample.png'], 'WEBP'); o.added = await state(p);
  await p.click('#sg-act'); await W(p, 1500); o.running = await state(p); await p.screenshot({ path: `${OUT}/batch-running-${name}.png` });
  await p.getByRole('button', { name: /^Stop all$/ }).first().click(); await W(p, 800); o.afterStopAll = await state(p);
  await p.screenshot({ path: `${OUT}/batch-stopped-${name}.png` });
  await p.click('#sg-act'); await W(p, 12000); o.afterConvertAgain = await state(p);
  o.live = await p.evaluate(() => window.__live); o.errs = p.errs; await ctx.close(); }
// d) remove while running (single file), then new file works
{ const ctx = await b.newContext({}); const p = await open(ctx); const o = R.removeRunning = {};
  await add(p, ['big15mp.jpg'], 'WEBP'); await p.click('#sg-act'); await W(p, 800); o.running = await state(p);
  o.hasRemove = await p.getByRole('button', { name: /^Remove/ }).count();
  await p.click('#sg-act'); await W(p, 500); o.afterStop = await state(p);
  // remove the cancelled one via the second file route: add a second file, remove first through its row
  await p.setInputFiles('[data-testid=pick]', F('sample.png')); await W(p, 500); o.two = await state(p);
  const nm = await p.locator('.nm-b').first().innerText().catch(() => null);
  o.removeBtns = await p.locator('.log button').allInnerTexts();
  await p.click('#sg-act'); await W(p, 8000); o.afterConvert = await state(p); o.errs = p.errs; await ctx.close(); }
// e) failed inside a batch + retry loop + ZIP of done only
{ const ctx = await b.newContext({ acceptDownloads: true }); const p = await open(ctx); const o = R.failedBatch = {};
  await p.setInputFiles('[data-testid=pick]', [F('sample.png'), F('corrupt.png'), F('sample.tiff')]); await W(p, 500);
  await pickTarget(p, 'JPG'); await W(p, 400); await p.click('#sg-act'); await W(p, 5000); o.after = await state(p);
  o.sum = await p.locator('.log .sum').innerText().catch(() => null); o.zipBtn = await p.locator('[data-testid=zip]').innerText().catch(() => null);
  await p.screenshot({ path: `${OUT}/batch-withfail-${name}.png`, fullPage: true });
  await W(p, 3500); o.live = await p.evaluate(() => window.__live);
  // zip contents
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-testid=zip]')]); const buf = Buffer.concat(await (await dl.createReadStream()).toArray()); o.zip = { name: dl.suggestedFilename(), bytes: buf.length, entries: [...buf.toString('latin1').matchAll(/PK\x03\x04[\s\S]{26}([\w .()-]+\.jpg)/g)].map((m) => m[1]) };
  // retry the failed one ×3
  const retryBtn = p.getByRole('button', { name: 'Try again' }); o.retryBtns = await retryBtn.count();
  for (let i = 0; i < 3 && (await retryBtn.count()); i++) { await retryBtn.first().click(); await W(p, 1200); }
  o.afterRetries = await state(p);
  // remove failed via its row button with the keyboard, focus must land somewhere sane
  const rm = p.getByRole('button', { name: /^Remove corrupt/ }); o.rmCount = await rm.count();
  o.errs = p.errs.length; await ctx.close(); }
writeFileSync(`${OUT}/t6-${name}.json`, JSON.stringify(R, null, 1)); await b.close();
for (const [k, v] of Object.entries(R)) console.error(k, JSON.stringify(v).slice(0, 1200));
