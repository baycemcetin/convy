// QA build-tur2 §1: corrupt / truncated / unsupported / mislabelled inputs. Usage: OUT=<dir> node tests/qa2-errors.mjs [browser]
import { launch, open, run, snap } from './qa2-lib.mjs';
import { writeFileSync, mkdirSync, copyFileSync, writeFileSync as wf } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2'; mkdirSync(OUT, { recursive: true });
wf(`${OUT}/empty.png`, ''); copyFileSync('tests/fixtures/sample.png', `${OUT}/mislabel.jpg`); copyFileSync('tests/fixtures/sample.mp3', `${OUT}/mislabel.png`); copyFileSync('tests/fixtures/sample.docx', `${OUT}/mislabel.pdf`);
const abs = (f) => process.cwd() + '/' + f;
const conv = [['tests/fixtures/corrupt.png', 'JPG'], [`${OUT}/empty.png`, 'JPG'], [`${OUT}/mislabel.jpg`, 'WEBP'], [`${OUT}/mislabel.png`, 'JPG'], [`${OUT}/mislabel.pdf`, 'TXT'],
  ['tests/fixtures/corrupt.mp4', 'WEBM'], ['tests/fixtures/corrupt.mp4', 'MP3'], ['tests/fixtures/truncated.mp4', 'WEBM'], ['tests/fixtures/truncated.mp3', 'WAV'],
  ['tests/fixtures/corrupt.pdf', 'PNG'], ['tests/fixtures/corrupt.pdf', 'TXT'], ['tests/fixtures/truncated.pdf', 'TXT'], ['tests/fixtures/corrupt.docx', 'MD']].map(([f, t]) => [abs(f), t]);
const unsup = ['tests/fixtures/mystery.xyz'];
const b = await launch(name); const ctx = await b.newContext({ acceptDownloads: true }); const res = [];
for (const [file, to] of conv) {
  const p = await open(ctx); const r = { file: file.split('/').pop(), to };
  try { Object.assign(r, await run(p, file, to, { timeout: 200000 })); } catch (e) { r.exc = String(e).slice(0, 200); r.snap = await snap(p).catch(() => null); }
  r.live = await p.evaluate(() => window.__live); r.errs = p.errs; res.push(r);
  console.error(r.file, to, r.exc || `${r.label} | ${r.say?.replace(/\n/g, ' / ')} | ${r.act} | ${r.ms}ms`);
  await p.screenshot({ path: `${OUT}/err-${r.file}-${to}-${name}.png` }).catch(() => {}); await p.close();
}
for (const f of [...unsup, `${OUT}/empty.png`]) {
  const p = await open(ctx); await p.setInputFiles('[data-testid=pick]', abs(f)); await p.waitForTimeout(800);
  const s = await snap(p); s.live = await p.evaluate(() => window.__live); s.file = f.split('/').pop(); res.push(s); console.error('unsup', s.file, s.label, s.say, s.act); await p.close();
}
writeFileSync(`${OUT}/errors-${name}.json`, JSON.stringify(res, null, 1)); await b.close();
