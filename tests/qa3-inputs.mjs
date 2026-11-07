// QA tur 3 §5: LaTeX/RTF/ODT/EPUB -> MD/HTML/DOCX, 12 MP+ photos -> WEBP/AVIF. Saves outputs. Usage: OUT=<dir> node tests/qa3-inputs.mjs [browser]
import { launch, open, run } from './qa2-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t3'; mkdirSync(OUT, { recursive: true });
const docs = ['sample.tex', 'sample.rtf', 'sample.odt', 'sample.epub'].flatMap((f) => ['MD', 'HTML', 'DOCX'].map((t) => [f, t]));
const imgs = ['photo12mp.jpg', 'photo12mp.png', 'big15mp.jpg'].flatMap((f) => ['WEBP', 'AVIF'].map((t) => [f, t]));
const cases = [...docs, ...imgs, ['images.epub', 'MD'], ['images.odt', 'HTML']].filter((c) => !process.env.ONLY || c.join(' ').includes(process.env.ONLY));
const b = await launch(name); const ctx = await b.newContext({ acceptDownloads: true }); const res = [];
for (const [file, to] of cases) {
  const p = await open(ctx); const r = { file, to };
  try { const s = await run(p, file, to, { save: true, timeout: 240000 }); const buf = s.buf; delete s.buf; Object.assign(r, s);
    if (buf) { r.magic = buf.subarray(0, 12).toString('hex'); writeFileSync(`${OUT}/out-${name}-${file}.${to.toLowerCase()}`, buf);
      if (/^(MD|HTML)$/.test(to)) { const t = buf.toString('utf8'); r.len = t.length; r.head = t.slice(0, 160); r.residue = (t.match(/\[\]\{#|\{#[^}]*\}|::: |\\\\begin/g) || []).length; if (to === 'MD' && /\.(odt|rtf)$/.test(file)) r.list = /^- one$/m.test(t) && !t.includes('•'); /* real list must come out as a Markdown list */ } }
  } catch (e) { r.exc = String(e).slice(0, 200); }
  r.errs = p.errs; res.push(r); console.error(file, to, r.exc || r.label, r.say?.replace(/\n/g, ' | ') || '', r.saved?.name || '', r.ms + 'ms');
  await p.close();
}
writeFileSync(`${OUT}/inputs-${name}.json`, JSON.stringify(res, null, 1)); await b.close();
