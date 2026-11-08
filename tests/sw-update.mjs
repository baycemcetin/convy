// Service worker update path (scripts/sw.mjs): a new deploy must replace the shell, never leave the old one stuck.
// Copies dist/ (engines symlinked) to a temp dir, serves it on :4399, installs the SW, then "deploys" a changed index.html
// + regenerated sw.js and checks: next navigation shows the new page (network-first), the new SW takes over,
// only the new shell cache remains, the engine cache is untouched, and offline reload serves the new page.
// Usage: node tests/sw-update.mjs [chromium|firefox|webkit]   (after npm run build)
import { chromium, firefox, webkit } from 'playwright-core';
import { mkdtempSync, cpSync, symlinkSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
const name = process.argv[2] || 'chromium', B = 'http://127.0.0.1:4399/';
const D = mkdtempSync(join(tmpdir(), 'swu-'));
cpSync('dist', D, { recursive: true, filter: (s) => !resolve(s).startsWith(resolve('dist/engines')) });
symlinkSync(resolve('dist/engines'), join(D, 'engines'));
const srv = spawn('node', ['scripts/serve.mjs', '--port', '4399'], { env: { ...process.env, DIST: D }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
let bad = 0; const ck = (k, ok, info = '') => { if (!ok) bad++; console.error(ok ? 'ok  ' : 'FAIL', k, ok ? '' : String(info).slice(0, 200)); };
const ctx = await { chromium, firefox, webkit }[name].launchPersistentContext(mkdtempSync(join(tmpdir(), 'swu-p-')));
try {
  const p = await ctx.newPage();
  await p.goto(B); await p.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 });
  await p.evaluate(() => caches.open('convy-engines-v1').then((c) => c.put('/engines/magick@0.0.46/x', new Response('x')))); // stands in for a saved engine
  const k1 = await p.evaluate(() => caches.keys());
  ck('v1: one shell cache + engine cache', k1.filter((k) => k.startsWith('convy-shell-')).length === 1 && k1.includes('convy-engines-v1'), k1);
  // deploy v2
  writeFileSync(join(D, 'index.html'), readFileSync(join(D, 'index.html'), 'utf8').replace('</body>', '<!--deploy-v2--></body>'));
  execFileSync('node', ['scripts/sw.mjs'], { env: { ...process.env, DIST: D } });
  await p.reload(); ck('v2 page served on the next navigation (network-first)', (await p.content()).includes('deploy-v2'));
  const old = k1.find((k) => k.startsWith('convy-shell-')); // poll from Node: a waitForFunction predicate returning a Promise counts as truthy at once
  for (let t = 0; t < 60; t++) { const k = await p.evaluate(() => caches.keys()); if (!k.includes(old) && k.some((x) => x.startsWith('convy-shell-'))) break; await p.waitForTimeout(500); }
  const k2 = await p.evaluate(() => caches.keys());
  ck('v2: old shell cache deleted, one new shell cache', k2.filter((k) => k.startsWith('convy-shell-')).length === 1 && !k2.includes(k1.find((k) => k.startsWith('convy-shell-'))), k2);
  ck('v2: engine cache untouched', await p.evaluate(() => caches.open('convy-engines-v1').then((c) => c.match('/engines/magick@0.0.46/x')).then((r) => !!r)));
  await ctx.setOffline(true);
  const off = await p.reload().then(() => p.content(), (e) => 'FAILED ' + e);
  ck('v2 offline reload serves the new page', off.includes('deploy-v2'), off.slice(0, 120));
} finally { await ctx.close(); srv.kill(); }
console.log(JSON.stringify({ name, bad })); process.exit(bad ? 1 : 0);
