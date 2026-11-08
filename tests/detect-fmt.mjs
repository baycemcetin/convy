// Format Dilim 1: the real detect() (formats.ts + lazy sniff chunk, bundled with rolldown) on every fixture in tests/fixtures/fmt,
// plus renamed files (content wins) and the extensions that need a signature (.ts, .xml). No browser. Usage: node tests/detect-fmt.mjs
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const dir = mkdtempSync(join(tmpdir(), 'convy-detect-'));
execFileSync('npx', ['rolldown', 'src/engines/formats.ts', '--format', 'esm', '-d', dir], { stdio: 'ignore' });
const { detect, targets, outName } = await import(join(dir, 'formats.js'));
const FX = 'tests/fixtures/fmt/';
// file → expected id (extension aliases share an id)
const want = { 'nosize.svg': 'svg', 'sample.j2k': 'jp2', 'sample.dbk': 'docbook', 'sample.typ': 'typst', 'sample.xml': 'jats', 'sample.1': 'man',
  'sample.adoc': 'asciidoc', 'alac.m4a': 'm4a', 'sample.aifc': 'aiff', 'sample.m2ts': 'ts', 'sample.f4v': 'mp4', 'sample.3g2': '3gp' };
const fails = [];
const check = async (name, bytes, exp) => { const f = await detect(new File([bytes], name)); if ((f?.id ?? null) !== exp) fails.push(`${name}: ${f?.id ?? null} ≠ ${exp}`); return f; };
let n = 0;
for (const name of readdirSync(FX)) {
  const exp = want[name] ?? name.split('.').pop();
  const f = await check(name, readFileSync(FX + name), exp); n++;
  if (f && !targets(f).length) fails.push(`${name}: no targets`);
}
// renamed: content wins wherever there is a signature
const renamed = { 'sample.svg': 'svg', 'sample.qoi': 'qoi', 'sample.exr': 'exr', 'sample.ppm': 'ppm', 'sample.wma': 'wma', 'sample.ac3': 'ac3',
  'sample.ts': 'ts', 'sample.mxf': 'mxf', 'sample.ogv': 'ogv', 'sample.amr': 'amr', 'sample.fb2': 'fb2', 'sample.opml': 'opml', 'sample.dbk': 'docbook', 'sample.xml': 'jats' };
for (const [name, exp] of Object.entries(renamed)) { await check(name.replace(/\.\w+$/, '.bin'), readFileSync(FX + name), exp); n++; }
// signature required: TypeScript in .ts, plain XML, a text file that starts like a Netpbm magic
for (const [name, text, exp] of [['app.ts', 'export const x: number = 1;\n', null], ['data.xml', '<?xml version="1.0"?><root/>', null],
  ['notes.md', 'P1 notes for the meeting\n', 'md'], ['page.html', '<!doctype html><html><body><svg></svg></body></html>', 'html']]) { await check(name, text, exp); n++; }
// existing formats keep their result
for (const [name, exp] of [['sample.png', 'png'], ['sample.mp3', 'mp3'], ['sample.mp4', 'mp4'], ['sample.flac', 'flac'], ['sample.docx', 'docx'], ['sample.md', 'md']]) { await check(name, readFileSync('tests/fixtures/' + name), exp); n++; }
// output names take the format's first extension
for (const [to, exp] of [['docbook', 'a.dbk'], ['typst', 'a.typ'], ['asciidoc', 'a.adoc'], ['jats', 'a.xml'], ['tiff', 'a.tiff'], ['jpg', 'a.jpg']]) if (outName('a.md', to) !== exp) fails.push(`outName ${to}: ${outName('a.md', to)}`);
rmSync(dir, { recursive: true }); // after the last detect: the sniff chunk is imported lazily from here
console.log(JSON.stringify({ checked: n, fails }, null, 1));
process.exit(fails.length ? 1 : 0);
