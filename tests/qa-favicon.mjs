// QA build-tur1: which favicon each browser requests, light vs dark scheme.
import { chromium, firefox, webkit } from 'playwright-core';
const out = {};
for (const [n, B] of Object.entries({ chromium, firefox, webkit })) for (const cs of ['light', 'dark']) {
  const b = await B.launch(); const ctx = await b.newContext({ colorScheme: cs }); const p = await ctx.newPage(); const reqs = [];
  p.on('response', (r) => /favicon|apple-touch|icon-/.test(r.url()) && reqs.push(`${r.status()} ${r.url().replace('http://127.0.0.1:4321', '')} ${r.headers()['content-type']}`));
  await p.goto('http://127.0.0.1:4321/'); await p.waitForFunction(() => window.__convyReady); await p.waitForTimeout(1500);
  out[`${n}-${cs}`] = { reqs, links: await p.evaluate(() => [...document.querySelectorAll('link[rel*=icon]')].map((l) => l.outerHTML)) };
  await b.close();
}
console.log(JSON.stringify(out, null, 1));
