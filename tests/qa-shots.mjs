// QA build-tur1: states × {390,1440} × {dark,light} × {en,tr}, chromium, reduced motion. Also measures .from vs figure overlap.
// Usage: OUT=<dir> node tests/qa-shots.mjs
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
const OUT = process.env.OUT || 'test-results/qa';
const BASE = 'http://127.0.0.1:4321/';
const b = await chromium.launch(); const meta = { errs: [], overlap: [], running: {}, overflow: [] };
for (const theme of ['dark', 'light']) for (const lang of ['en', 'tr']) for (const w of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', colorScheme: theme });
  await ctx.addInitScript((t) => { try { localStorage.setItem('convy-theme', t); } catch {} }, theme);
  const p = await ctx.newPage(); const tag = `${w}-${theme}-${lang}`;
  p.on('console', (m) => m.type() === 'error' && meta.errs.push(`${tag}: ${m.text()}`)); p.on('pageerror', (e) => meta.errs.push(`${tag}: ${e}`));
  await p.goto(BASE + (lang === 'tr' ? 'tr/' : '')); await p.waitForFunction(() => window.__convyReady);
  const shot = async (s) => {
    await p.screenshot({ path: `${OUT}/${s}-${tag}.png`, fullPage: true });
    const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, th: document.documentElement.dataset.theme }));
    if (o.sw > o.cw) meta.overflow.push(`${s}-${tag}: scrollWidth ${o.sw} > ${o.cw}`);
    if (o.th !== theme) meta.overflow.push(`${s}-${tag}: data-theme=${o.th}`);
    const ov = await p.evaluate(() => [...document.querySelectorAll('.stage .from')].map((f) => { const prev = f.previousElementSibling; if (!prev) return null; const a = f.getBoundingClientRect(), c = prev.getBoundingClientRect(); return { from: f.textContent, a: [a.left, a.top, a.right, a.bottom].map(Math.round), fig: [c.left, c.top, c.right, c.bottom].map(Math.round), overlap: a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom }; }).filter(Boolean));
    if (ov.length) meta.overlap.push({ s: `${s}-${tag}`, ov });
  };
  await shot('empty');
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await p.waitForTimeout(400); await shot('needs');
  await p.locator('.stage .chip', { hasText: 'JPG' }).click(); await p.waitForTimeout(400); await shot('ready');
  await p.click('#sg-act'); await p.locator('.stage .pill').waitFor({ timeout: 60000 }); await p.waitForTimeout(500); await shot('done');
  // running: video → GIF, shoot early
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.mp4'); await p.waitForTimeout(400);
  await p.locator('.stage .tpick .chip', { hasText: /^GIF$/ }).click(); await p.waitForTimeout(300);
  await p.click('#sg-act'); await p.waitForTimeout(250);
  const live = await p.evaluate(() => !document.querySelector('.stage .pill') && !document.querySelector('.stage .readout'));
  meta.running[tag] = live; await shot('running');
  await p.locator('.stage .pill, .stage .sg-say .err').first().waitFor({ timeout: 120000 }).catch(() => {}); await p.waitForTimeout(300);
  await p.reload(); await p.waitForFunction(() => window.__convyReady);
  await p.setInputFiles('[data-testid=pick]', ['tests/fixtures/sample.mp4', 'tests/fixtures/sample.png']); await p.waitForTimeout(600); await shot('batch');
  await p.click('.chip-dev'); await p.waitForTimeout(500); await shot('panel');
  await ctx.close();
}
writeFileSync(`${OUT}/_shots-meta.json`, JSON.stringify(meta, null, 1));
console.log('shots done', meta.errs.length, 'errs');
await b.close();
