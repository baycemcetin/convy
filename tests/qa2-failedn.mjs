// QA build-tur2: grouped failure announcement (3 corrupt images + 1 good) EN+TR. Usage: node tests/qa2-failedn.mjs
import { launch, open, pickTarget, snap } from './qa2-lib.mjs';
const b = await launch('chromium'); const F = (f) => process.cwd() + '/tests/fixtures/' + f;
for (const lang of ['en', 'tr']) { const ctx = await b.newContext(); const p = await open(ctx, lang);
  await p.setInputFiles('[data-testid=pick]', [F('corrupt.png'), F('sample.png'), F('mislabel.jpg').replace('fixtures', '../test-results/t2'), F('empty.png').replace('fixtures', '../test-results/t2')]);
  await pickTarget(p, 'WEBP'); await p.click('#sg-act'); await p.waitForTimeout(6000);
  const s = await snap(p); console.log(lang, JSON.stringify(await p.evaluate(() => window.__live)), '|', s.label, '|', await p.locator('.log .sum').innerText());
  await p.screenshot({ path: `test-results/t2/failedN-${lang}.png`, fullPage: true }); await ctx.close(); }
await b.close();
