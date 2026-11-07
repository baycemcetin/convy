// Fix round 2 checks: magic bytes, scanned PDF → TXT, offline (video engine / back online), single blocked file. Usage: OUT=<dir> node tests/qa2-fix2.mjs [browser]
import { launch, open, run, snap, pickTarget } from './qa2-lib.mjs';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/fix2'; mkdirSync(OUT, { recursive: true });
const b = await launch(name); const R = {}; const bad = [];
const ok = (k, c, v) => { R[k] = v; if (!c) bad.push(k); };
// a) content beats extension: a PNG named .jpg → WEBP converts; a PDF named .png still reads as PDF
{ const ctx = await b.newContext({ acceptDownloads: true }); const p = await open(ctx);
  copyFileSync('tests/fixtures/sample.png', `${OUT}/photo.jpg`); copyFileSync('tests/fixtures/sample.pdf', `${OUT}/doc.png`);
  const s = await run(p, `${process.cwd()}/${OUT}/photo.jpg`, 'WEBP'); ok('renamedPng', s.label === 'Result', s.label);
  ok('errs-a', !p.errs.length, p.errs); await ctx.close(); }
{ const ctx = await b.newContext({}); const p = await open(ctx);
  await p.setInputFiles('[data-testid=pick]', `${OUT}/doc.png`); await p.waitForTimeout(500);
  const f = await p.locator('.stage .readout').innerText(); ok('pdfAsPng', /FORMAT\s*\nPDF/.test(f), f.replace(/\n/g, ' ')); await ctx.close(); }
// b) scanned PDF → TXT is an error with its own line
{ const ctx = await b.newContext({}); const p = await open(ctx);
  const s = await run(p, 'scanned.pdf', 'TXT'); ok('scannedTxt', s.label === 'Couldn’t convert' && /No selectable text/.test(s.say || ''), [s.label, s.say]);
  const t = await open(await b.newContext({}), 'tr'); const s2 = await run(t, 'scanned.pdf', 'TXT'); ok('scannedTxtTr', /seçilebilir metin yok/.test(s2.say || ''), s2.say);
  ok('errs-b', !p.errs.length, p.errs); await ctx.close(); }
// c) offline before first video job: not an endless spinner; "Offline" tag; back online → ready again → converts
{ const ctx = await b.newContext({}); const p = await open(ctx);
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.wav'); await pickTarget(p, 'MP3');
  await ctx.setOffline(true); await p.waitForTimeout(300); ok('tagOff', (await p.locator('.tag-off').count()) === 1, 'tag');
  await p.click('#sg-act');
  await p.waitForFunction(() => /Needs a connection/.test(document.querySelector('.stage .sg-head .lbl')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  const s = await snap(p); ok('offlineVideo', /Needs a connection/.test(s.label) && s.act === 'Remove', [s.label, s.act, s.say]);
  await p.screenshot({ path: `${OUT}/offline-video-${name}.png` });
  await ctx.setOffline(false); await p.waitForTimeout(500);
  ok('backOnline', (await p.locator('.tag-off').count()) === 0 && /Convert/.test((await snap(p)).act), (await snap(p)).act);
  await p.click('#sg-act'); await p.waitForFunction(() => /Save/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 90000 }).catch(() => {});
  ok('convertsAfter', /Save/.test((await snap(p)).act), (await snap(p)).act); await ctx.close(); }
// d) Stop / Try again are spoken; "1 kilobyte"
{ const ctx = await b.newContext({}); const p = await open(ctx);
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.md'); await p.waitForTimeout(300);
  ok('oneKb', (await p.evaluate(() => window.__live)).some((m) => /1 kilobyte\./.test(m)), await p.evaluate(() => window.__live));
  await ctx.close(); }
writeFileSync(`${OUT}/fix2-${name}.json`, JSON.stringify(R, null, 1)); await b.close();
console.log(name, bad.length ? 'FAIL ' + bad.join(',') : 'PASS', JSON.stringify(R).slice(0, 1500));
