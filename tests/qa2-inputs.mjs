// QA build-tur2 §2: inputs (HEIC PSD big JPG TIFF JXL, LaTeX RTF ODT EPUB, scanned PDF) in one browser. Usage: OUT=<dir> node tests/qa2-inputs.mjs [browser]
import { launch, open, run } from './qa2-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2';
mkdirSync(OUT, { recursive: true });
const cases = [['sample.heic', 'JPG'], ['sample.heic', 'PNG'], ['sample.psd', 'PNG'], ['handmade.psd', 'PNG'], ['big15mp.jpg', 'PNG'], ['big15mp.jpg', 'WEBP'], ['small.tif', 'JPG'], ['sample.tiff', 'PNG'], ['sample.jxl', 'PNG'], ['sample.png', 'JXL'], ['sample.png', 'TIFF'],
  ['sample.tex', 'DOCX'], ['sample.tex', 'MD'], ['sample.rtf', 'MD'], ['sample.rtf', 'DOCX'], ['sample.odt', 'MD'], ['sample.odt', 'TXT'], ['sample.epub', 'MD'], ['sample.epub', 'TXT'], ['sample.docx', 'EPUB'], ['sample.md', 'HTML'], ['sample.md', 'ODT'],
  ['scanned.pdf', 'TXT'], ['scanned.pdf', 'PNG'], ['sample.pdf', 'JPG'], ['sample.mp3', 'OGG'], ['sample.wav', 'FLAC']]
  .filter((c) => !process.env.ONLY || c.join(' ').includes(process.env.ONLY));
const b = await launch(name); const ctx = await b.newContext({ acceptDownloads: true }); const res = [];
for (const [file, to] of cases) {
  const p = await open(ctx); const r = { file, to };
  try { const s = await run(p, file, to, { save: true, timeout: 150000 }); const buf = s.buf; delete s.buf; Object.assign(r, s);
    if (buf && /^sample\.(png|tiff)$|^sample\.jxl$/.test(`sample.${to.toLowerCase()}`) && file === 'sample.png') writeFileSync(`${OUT}/gen-sample.${to.toLowerCase()}`, buf);
    if (buf && to === 'TXT') r.txtHead = buf.toString('utf8').slice(0, 160);
    if (buf && /^(MD|HTML)$/.test(to)) r.head = buf.toString('utf8').slice(0, 200);
    if (buf && (to === 'DOCX' || to === 'ODT' || to === 'EPUB')) r.magic = buf.subarray(0, 4).toString('hex');
    if (buf && /^(PNG|JPG|WEBP|JXL|TIFF)$/.test(to)) r.magic = buf.subarray(0, 12).toString('hex');
  } catch (e) { r.exc = String(e).slice(0, 200); }
  r.live = await p.evaluate(() => window.__live).catch(() => null); r.errs = p.errs; res.push(r);
  console.error(file, to, r.exc || r.label, r.say?.replace(/\n/g, ' | ') || '', r.saved?.name || '');
  await p.close();
}
writeFileSync(`${OUT}/inputs-${name}.json`, JSON.stringify(res, null, 1)); await b.close();
