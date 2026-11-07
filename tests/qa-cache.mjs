// QA build-tur1: which responses are 200/304 on reload, per browser; image + mp4->webm convert after each reload (engines).
import { chromium, firefox, webkit } from 'playwright-core';
const out = {};
for (const [n, B] of Object.entries({ chromium, firefox, webkit })) {
  const b = await B.launch(); const ctx = await b.newContext({ acceptDownloads: true }); const p = await ctx.newPage();
  const logs = []; p.on('console', (m) => ['error', 'warning'].includes(m.type()) && logs.push(m.text())); p.on('pageerror', (e) => logs.push(String(e)));
  let cur = []; p.on('response', (r) => cur.push([r.status(), r.request().resourceType(), r.url().replace('http://127.0.0.1:4321', '')]));
  await p.goto('http://127.0.0.1:4321/'); await p.waitForFunction(() => window.__convyReady);
  out[n] = { loads: [] };
  for (let i = 0; i < 4; i++) {
    cur = []; if (i) { await p.reload(); await p.waitForFunction(() => window.__convyReady); }
    await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.mp4');
    await p.locator('.stage .tpick .chip', { hasText: /^WEBM$/ }).click(); await p.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
    await p.click('#sg-act'); await p.locator('.stage .readout', { hasText: 'sample.webm' }).waitFor({ timeout: 120000 });
    await p.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || ''));
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#sg-act')]);
    const bytes = (await (await dl.createReadStream()).toArray()).reduce((a, x) => a + x.length, 0);
    const by = {}; cur.forEach(([s, t]) => (by[`${t}:${s}`] = (by[`${t}:${s}`] || 0) + 1));
    out[n].loads.push({ i, bytes, by, doc: cur.find((c) => c[1] === 'document')?.[0], wasm: cur.filter((c) => /wasm/.test(c[2])).map((c) => c[0]) });
  }
  out[n].logs = logs; await b.close();
}
console.log(JSON.stringify(out));
