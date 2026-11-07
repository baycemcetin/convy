// QA build-tur2 T6: stop a long video job on both video engines (WEBM = Mediabunny, GIF = ffmpeg), convert again, then Remove. Generate: ffmpeg -f lavfi -i testsrc2=size=1280x720:rate=30 -f lavfi -i sine -t 45 -pix_fmt yuv420p -c:v libx264 -crf 32 -c:a aac -shortest test-results/t2/long.mp4
import { launch, open, pickTarget, snap } from './qa2-lib.mjs';
import { writeFileSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2'; const b = await launch(name); const R = {}; const W = (p, ms) => p.waitForTimeout(ms);
const st = async (p) => { const s = await snap(p); return { label: s.label, act: s.act, readout: s.readout?.replace(/\n/g, ' ').slice(0, 160), rows: s.rowSt }; };
for (const to of ['WEBM', 'GIF', 'MP3']) {
  const ctx = await b.newContext(); const p = await open(ctx); const o = R[to] = {};
  await p.setInputFiles('[data-testid=pick]', `${OUT}/long.mp4`); await pickTarget(p, to); await p.click('#sg-act'); await W(p, 3000); o.running = await st(p);
  const t0 = Date.now(); await p.click('#sg-act'); await W(p, 700); o.afterStop = await st(p); o.stopMs = Date.now() - t0;
  await p.screenshot({ path: `${OUT}/stop-${to}-${name}.png` });
  await p.click('#sg-act'); await W(p, 3000); o.again = await st(p); // second run starts cleanly?
  await p.click('#sg-act'); await W(p, 500); o.stopAgain = await st(p);
  o.live = await p.evaluate(() => window.__live); o.errs = p.errs; await ctx.close();
}
writeFileSync(`${OUT}/stop-${name}.json`, JSON.stringify(R, null, 1)); await b.close(); console.error(JSON.stringify(R, null, 1).slice(0, 4000));
