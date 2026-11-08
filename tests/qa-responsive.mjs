// Responsive check of content pages: full-page shots at 320/375/768/1024/1440 + horizontal overflow and console errors.
// Usage: node tests/qa-responsive.mjs <outDir> [prefix] [widths]   (preview on 127.0.0.1:4321)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'test-results/responsive';
const PRE = process.argv[3] || '';
const WIDTHS = (process.argv[4] || '320,375,768,1024,1440').split(',').map(Number);
const BASE = 'http://127.0.0.1:4321';
const PAGES = [['how', '/how-it-works/'], ['sss', '/tr/sss/'], ['hakkinda', '/tr/hakkinda/'], ['gizlilik', '/tr/gizlilik/'],
  ['heic-jpg', '/tr/donustur/heic-jpg/'], ['convert', '/convert/'], ['home-tr', '/tr/'], ['404', '/convert/foo-to-bar/']];
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const bad = [];
for (const w of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce', colorScheme: 'light' });
  for (const [name, path] of PAGES) {
    const p = await ctx.newPage(), errs = [];
    p.on('console', (m) => m.type() === 'error' && !/status of 404/.test(m.text()) && errs.push(m.text()));
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(250);
    const o = await p.evaluate(() => {
      const iw = innerWidth, sw = document.documentElement.scrollWidth;
      const wide = [...document.querySelectorAll('main *')].filter((e) => e.getBoundingClientRect().right > iw + 1 && getComputedStyle(e).position !== 'absolute').slice(0, 3).map((e) => e.tagName + '.' + e.className);
      return { sw, iw, wide };
    });
    await p.screenshot({ path: `${OUT}/${PRE}${name}-${w}.png`, fullPage: true });
    const line = `${w} ${name}: scrollWidth ${o.sw}/${o.iw}${o.wide.length ? ' wide:' + o.wide.join(',') : ''}${errs.length ? ' ERR:' + errs.join(' | ') : ''}`;
    if (o.sw > o.iw || errs.length || o.wide.length) bad.push(line);
    console.log(line);
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(bad.length ? `\n${bad.length} issue(s)` : '\nno overflow, no console errors');
