// OPFS output cleanup (DECISIONS 2026-11-07): outputs > 50 MB live in OPFS, one folder per tab session.
// A new session sweeps earlier sessions' folders and loose files, but never another open tab's; an unsaved output stays while
// the session lives; Save removes the file 60 s later; Stop removes the half-written file; leaving the page removes the folder.
// The input is generated (ffmpeg CLI → test-results/big.mp4, ~66 MB, H.264) because the OPFS path keys on input size.
// Usage: node tests/opfs.mjs [chromium|firefox|webkit]  (preview on :4321 or URL0)
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', URL0 = process.env.URL0 || 'http://localhost:4321/', BIG = 'test-results/big.mp4';
if (!existsSync(BIG)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=1280x720:r=30:d=2', '-vf', 'noise=alls=40:allf=t,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'ultrafast', '-crf', '4', BIG]);
// a persistent profile: WebKit refuses OPFS in ephemeral contexts (UnknownError, like a private window)
const ctx = await { chromium, firefox, webkit }[name].launchPersistentContext(mkdtempSync(join(tmpdir(), 'convy-opfs-')), { acceptDownloads: true });
const page = ctx.pages()[0] || await ctx.newPage();
const errs = [];
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 140)));
page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
const open = async (p = page) => { await p.goto(URL0); await p.waitForFunction(() => window.__convyReady); await p.waitForTimeout(1500); }; // sweep runs on load
// every OPFS entry: "dir/" or "path:size"
const ls = (p = page) => p.evaluate(async () => {
  const out = [];
  const walk = async (d, pre) => { for await (const [n, h] of d.entries()) { if (h.kind === 'directory') { out.push(pre + n + '/'); await walk(h, pre + n + '/'); } else out.push(pre + n + ':' + (await h.getFile()).size); } };
  await walk(await navigator.storage.getDirectory(), ''); return out;
});
const files = (l) => l.filter((e) => !e.endsWith('/'));
async function start() {
  await page.setInputFiles('[data-testid=pick]', BIG);
  await page.locator('.stage .tpick').waitFor({ timeout: 10000 });
  const chip = page.locator('.stage .tpick .chip', { hasText: /^MP4$/ });
  if (await chip.count()) await chip.click(); else await page.locator('.stage .tpick select').selectOption('MP4');
  await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
  await page.click('#sg-act');
}
const finish = async () => { await page.waitForFunction(() => /Save|Try again/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 180000 }); return /Save/.test(await page.locator('#sg-act').textContent()); };
const r = {};

// 1. leftovers of an earlier session (folder + a loose file from before session folders) go when a new session opens
await open();
await page.evaluate(async () => {
  const root = await navigator.storage.getDirectory();
  const w = (d, n) => d.getFileHandle(n, { create: true }); // empty files: WebKit has no createWritable on the main thread
  await w(await root.getDirectoryHandle('convy-old', { create: true }), '1-old.mp4'); await w(root, 'legacy.webm');
});
r.planted = await ls();
await open();
r.sweep = await ls();

// 2. a big output is written to OPFS and stays while unsaved, also when a second tab opens (its sweep skips our locked folder)
await start(); r.done = await finish();
r.afterDone = await ls();
const page2 = await ctx.newPage(); await open(page2);
r.afterTab2 = await ls(); await page2.close();

// 3. Save → the OPFS copy is gone 60 s later (the download reads it first)
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#sg-act')]);
r.savedBytes = (await (await dl.createReadStream()).toArray()).reduce((a, c) => a + c.length, 0);
r.beforeSpend = await ls();
await page.waitForTimeout(61000);
r.afterSave = await ls();

// 4. Stop during the conversion → no half-written file
await open(); await start();
await page.waitForFunction(() => /Stop/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
await page.click('#sg-act').catch(() => {});
await page.waitForTimeout(2000);
r.stopState = /Save/.test(await page.locator('#sg-act').textContent()) ? 'done' : 'cancelled'; // one file: no log row, the slot tells
r.afterStop = await ls();

// 5. an unsaved output, then the page goes (reload: pagehide, not bfcache) → nothing left
await open(); await start(); r.done2 = await finish();
r.beforeLeave = await ls();
await open();
r.afterLeave = await ls();

const pass = r.planted.length === 3 && !r.sweep.length && r.done
  && files(r.afterDone).length === 1 && /^convy-[^/]+\/\d+-big\.mp4:[1-9]/.test(files(r.afterDone)[0])
  && files(r.afterTab2).join() === files(r.afterDone).join() && r.savedBytes > 0 && files(r.beforeSpend).length === 1 && !files(r.afterSave).length
  && (r.stopState !== 'cancelled' || !files(r.afterStop).length) && r.done2 && files(r.beforeLeave).length === 1 && !files(r.afterLeave).length && !errs.length;
console.log(JSON.stringify({ browser: name, pass, ...r, errs }, null, 1));
await ctx.close();
process.exit(pass ? 0 : 1);
