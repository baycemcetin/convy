// QA build-tur2 §3: live-region transcript (what a screen reader would say, with timestamps), EN + TR. Usage: OUT=<dir> node tests/qa2-live.mjs [browser]
import { launch, open, pickTarget, snap } from './qa2-lib.mjs';
import { writeFileSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2'; const b = await launch(name); const R = {};
const F = (f) => process.cwd() + '/tests/fixtures/' + f; const W = (p, ms) => p.waitForTimeout(ms);
for (const lang of ['en', 'tr']) {
  const ctx = await b.newContext(); const p = await open(ctx, lang); const T = R[lang] = { regionAttrs: await p.evaluate(() => { const r = document.getElementById('live'); return [...r.attributes].map((a) => `${a.name}=${a.value}`); }), steps: [] };
  await p.evaluate(() => { window.__t0 = Date.now(); window.__lt = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__lt.push([Date.now() - window.__t0, r.textContent])).observe(r, { childList: true, characterData: true, subtree: true }); });
  const step = async (label, fn, wait = 1500) => { const n0 = (await p.evaluate(() => window.__lt.length)); try { await fn(); } catch (e) { T.steps.push({ label, exc: String(e).slice(0, 100) }); return; } await W(p, wait); T.steps.push({ label, said: (await p.evaluate(() => window.__lt)).slice(n0) }); };
  const reload = async () => { await p.reload(); await p.waitForFunction(() => window.__convyReady); await p.evaluate(() => { window.__t0 = Date.now(); window.__lt = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__lt.push([Date.now() - window.__t0, r.textContent])).observe(r, { childList: true, characterData: true, subtree: true }); }); };
  await step('add png', () => p.setInputFiles('[data-testid=pick]', F('sample.png')));
  await step('pick JPG + Convert', async () => { await pickTarget(p, 'JPG'); await p.click('#sg-act'); }, 3000);
  await step('remove? (n/a) add unsupported', () => p.setInputFiles('[data-testid=pick]', F('mystery.xyz')));
  await step('remove unsupported', async () => { await p.getByRole('button', { name: /mystery|^Remove|^Kaldır/ }).first().click(); });
  await reload();
  await step('add corrupt.png, JPG, Convert', async () => { await p.setInputFiles('[data-testid=pick]', F('corrupt.png')); await pickTarget(p, 'JPG'); await p.click('#sg-act'); }, 4500);
  await step('Try again (same failure)', () => p.click('#sg-act'), 4500);
  await reload();
  await step('3 corrupt files → fail together', async () => { await p.setInputFiles('[data-testid=pick]', [F('corrupt.png'), F('truncated.pdf'), F('corrupt.docx')]); await W(p, 300); }, 500);
  await step('(choose JPG for image only)', async () => { await pickTarget(p, 'JPG').catch(() => {}); }, 300);
  await reload();
  await step('scanned.pdf → TXT', async () => { await p.setInputFiles('[data-testid=pick]', F('scanned.pdf')); await pickTarget(p, 'TXT'); await p.click('#sg-act'); }, 3000);
  await reload();
  await step('4 pngs → WEBP batch', async () => { await p.setInputFiles('[data-testid=pick]', [F('sample.png'), F('sample.tiff'), F('small.tif'), F('sample.psd')]); await pickTarget(p, 'WEBP'); await p.click('#sg-act'); }, 6000);
  await step('Save ZIP (no announcement expected)', async () => { await p.getByRole('button', { name: /ZIP|Kaydet/ }).first().click().catch(() => {}); }, 1500);
  await reload();
  await step('stop long gif', async () => { await p.setInputFiles('[data-testid=pick]', `${OUT}/long.mp4`); await pickTarget(p, 'GIF'); await p.click('#sg-act'); await W(p, 2500); await p.click('#sg-act'); }, 1500);
  await ctx.close();
}
writeFileSync(`${OUT}/live-${name}.json`, JSON.stringify(R, null, 1)); await b.close();
for (const l of ['en', 'tr']) { console.error('==', l, R[l].regionAttrs.join(' ')); for (const s of R[l].steps) console.error(' *', s.label, '=>', s.exc || JSON.stringify(s.said.map(([t, m]) => `${t}ms ${m}`))); }
