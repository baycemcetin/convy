// E3 (review 2026-11-08): REAL outage cold open. The server is killed (no setOffline: Playwright Firefox's emulation does not cover
// SW fetches, so qa3-offline D can pass there without proving the cache). After one online visit + one conversion, a new tab must open
// / and /tr/ from the service worker and convert with the saved engine. Own server on :4399 (does not touch the :4321 preview).
// Usage: node tests/qa3-outage.mjs [chromium|firefox|webkit]   (after npm run build)   exit 1 on any failure
import { chromium, firefox, webkit } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pickTarget } from './qa2-lib.mjs';
const name = process.argv[2] || 'chromium', PORT = 4399, B = `http://127.0.0.1:${PORT}/`;
const srv = spawn('node', ['scripts/serve.mjs', '--port', String(PORT)], { stdio: 'ignore' });
for (let i = 0; i < 50 && !(await fetch(B).then(() => true, () => false)); i++) await new Promise((r) => setTimeout(r, 100));
const ctx = await { chromium, firefox, webkit }[name].launchPersistentContext(mkdtempSync(join(tmpdir(), 'q3o-')), { acceptDownloads: true });
const bad = []; const ck = (k, ok, info = '') => { console.error(ok ? 'ok  ' : 'FAIL', `${name} ${k}`, ok ? '' : JSON.stringify(info).slice(0, 200)); if (!ok) bad.push(k); };
const convert = async (p) => {
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await pickTarget(p, 'JPG');
  await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true'); await p.click('#sg-act');
  await p.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say .err'), null, { timeout: 90000 });
  return p.evaluate(() => [...document.querySelectorAll('[data-testid=item]')].map((r) => r.dataset.st));
};
try {
  const p1 = await ctx.newPage(); await p1.goto(B); await p1.waitForFunction(() => window.__convyReady);
  ck('SW controls the page', await p1.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 }).then(() => true, () => false));
  ck('online convert (saves the image engine)', (await convert(p1)).every((s) => s === 'done'));
  await p1.waitForTimeout(1000); await p1.close();
  srv.kill('SIGKILL'); await new Promise((r) => setTimeout(r, 500));
  ck('server is down', await fetch(B).then(() => false, () => true));
  for (const path of ['', 'tr/']) {
    const p = await ctx.newPage();
    const r = await p.goto(B + path).then((x) => ({ status: x.status(), sw: x.fromServiceWorker() }), (e) => String(e).slice(0, 80));
    ck(`cold open /${path} from the service worker`, r.status === 200 && r.sw, r);
    if (r.status === 200) {
      ck(`/${path} app ready`, await p.waitForFunction(() => window.__convyReady, null, { timeout: 20000 }).then(() => true, () => false));
      ck(`/${path} converts with the saved engine`, (await convert(p).catch((e) => [String(e).slice(0, 60)])).every((s) => s === 'done'));
    }
    await p.close();
  }
} finally { srv.kill('SIGKILL'); await ctx.close(); }
console.error(bad.length ? `${name}: ${bad.length} FAIL` : `${name}: all ok`); process.exit(bad.length ? 1 : 0);
