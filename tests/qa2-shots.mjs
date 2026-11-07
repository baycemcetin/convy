// QA build-tur2 §4: new-state screenshots × {390,1440} × {en,tr} × dark (+ light for error/quota). Usage: OUT=<dir> node tests/qa2-shots.mjs
import { chromium } from 'playwright-core';
import { pickTarget, BASE } from './qa2-lib.mjs';
import { writeFileSync } from 'node:fs';
const OUT = process.env.OUT || 'test-results/t2/shots'; const F = (f) => process.cwd() + '/tests/fixtures/' + f;
const stub = `(() => { const e = () => Promise.resolve({ quota: 12e6, usage: 2e6 }); Object.defineProperty(navigator, 'storage', { value: { estimate: e }, configurable: true }); })()`;
const done = (p) => p.waitForFunction(() => /Save|Kaydet|Try again|Yeniden/.test(document.getElementById('sg-act')?.textContent || '') && !document.querySelector('[data-st=running],[data-st=queued]'), null, { timeout: 120000 });
// [state, files, target, opts]
const S = [
  ['err-single', ['corrupt.png'], 'JPG'], ['err-batch', ['corrupt.png', 'sample.png', 'sample.tiff'], 'JPG'], ['unsupported', ['mystery.xyz'], null],
  ['quota', ['sample.png'], 'JPG', { stub }], ['quota-batch', ['sample.png', 'sample.heic'], 'JPG', { stub }],
  ['offline-hang', ['sample.png'], 'JPG', { offline: true }],
  ['doc-md', ['sample.docx'], 'MD'], ['doc-docx', ['sample.md'], 'DOCX'], ['doc-txt-pdf', ['sample.pdf'], 'TXT'], ['pdf-zip', ['sample.pdf'], 'PNG'], ['scanned-txt', ['scanned.pdf'], 'TXT'],
  ['big-photo', ['big15mp.jpg'], 'PNG'], ['heic', ['sample.heic'], 'JPG'], ['audio', ['sample.wav'], 'MP3'], ['ready-doc', ['sample.docx'], null, { noRun: true }],
];
const b = await chromium.launch(); const meta = { errs: [], overflow: [] };
for (const theme of ['dark', 'light']) for (const lang of ['en', 'tr']) for (const w of [390, 1440]) for (const [name, files, to, o = {}] of S) {
  if (theme === 'light' && !/^(err-single|quota|doc-md|pdf-zip)$/.test(name)) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', colorScheme: theme, acceptDownloads: true });
  await ctx.addInitScript((t) => { try { localStorage.setItem('convy-theme', t); } catch {} }, theme); if (o.stub) await ctx.addInitScript(o.stub);
  const p = await ctx.newPage(); const tag = `${name}-${w}-${theme}-${lang}`;
  p.on('console', (m) => m.type() === 'error' && meta.errs.push(`${tag}: ${m.text()}`)); p.on('pageerror', (e) => meta.errs.push(`${tag}: ${e}`));
  await p.goto(BASE + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  if (o.offline) { await ctx.setOffline(true); await p.waitForTimeout(300); }
  await p.setInputFiles('[data-testid=pick]', files.map(F)); await p.waitForTimeout(500);
  if (to) { await pickTarget(p, to); await p.waitForTimeout(400); if (!o.noRun && !o.stub) { await p.click('#sg-act'); if (o.offline) await p.waitForTimeout(3000); else await done(p).catch(() => {}); await p.waitForTimeout(700); } }
  await p.screenshot({ path: `${OUT}/${tag}.png`, fullPage: true });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (ov > 0) meta.overflow.push(`${tag}: +${ov}px`);
  await ctx.close();
}
writeFileSync(`${OUT}/_meta.json`, JSON.stringify(meta, null, 1)); await b.close(); console.log(JSON.stringify(meta));
