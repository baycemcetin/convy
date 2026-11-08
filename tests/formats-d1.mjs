// Format Dilim 1 through the real UI: every new input (tests/fixtures/fmt) converted once, every new output produced once, each
// result downloaded and its first bytes checked. Same flow as e2e.mjs (pick → target chip / "More formats" select → Convert → Save).
// Usage: node tests/formats-d1.mjs [chromium|firefox|webkit]   (`npm run build` + `npm run preview` on :4321). ONLY=<substring> filters.
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium';
const URL0 = process.env.URL0 || 'http://localhost:4321/';
const F = 'fmt/';
const S = (b, at, s) => [...s].every((c, i) => b[at + i] === c.charCodeAt(0));
const txt = (b) => b.length > 0 && !b.includes(0);
// output id → [file extension, first-bytes check]
const OUTS = {
  PNG: ['png', (b) => S(b, 1, 'PNG')], JPG: ['jpg', (b) => b[0] === 0xff && b[1] === 0xd8], MP3: ['mp3', (b) => S(b, 0, 'ID3') || b[0] === 0xff],
  MP4: ['mp4', (b) => S(b, 4, 'ftyp')], MD: ['md', txt], DOCX: ['docx', (b) => S(b, 0, 'PK')],
  DDS: ['dds', (b) => S(b, 0, 'DDS ')], EXR: ['exr', (b) => b[0] === 0x76 && b[1] === 0x2f], HDR: ['hdr', (b) => S(b, 0, '#?')], JP2: ['jp2', (b) => S(b, 4, 'jP  ')],
  PBM: ['pbm', (b) => S(b, 0, 'P4') || S(b, 0, 'P1')], PCX: ['pcx', (b) => b[0] === 0x0a], PGM: ['pgm', (b) => S(b, 0, 'P5')], PPM: ['ppm', (b) => S(b, 0, 'P6')],
  QOI: ['qoi', (b) => S(b, 0, 'qoif')], TGA: ['tga', (b) => b.length > 18 && b[2] === 2], XPM: ['xpm', (b) => S(b, 0, '/* XPM */')],
  AAC: ['aac', (b) => b[0] === 0xff && (b[1] & 0xf6) === 0xf0], AC3: ['ac3', (b) => b[0] === 0x0b && b[1] === 0x77], AIFF: ['aiff', (b) => S(b, 0, 'FORM') && S(b, 8, 'AIFF')],
  M4B: ['m4b', (b) => S(b, 4, 'ftyp')], WMA: ['wma', (b) => b[0] === 0x30 && b[1] === 0x26 && b[2] === 0xb2],
  APNG: ['apng', (b) => S(b, 1, 'PNG') && Buffer.from(b).includes('acTL')], WEBP: ['webp', (b) => S(b, 8, 'WEBP') && Buffer.from(b).includes('ANIM')],
  AsciiDoc: ['adoc', txt], DocBook: ['dbk', (b) => Buffer.from(b).includes('docbook.org')], FB2: ['fb2', (b) => Buffer.from(b).includes('<FictionBook')],
  IPYNB: ['ipynb', (b) => JSON.parse(Buffer.from(b)).nbformat >= 4], JATS: ['xml', (b) => Buffer.from(b).includes('<article')], man: ['man', (b) => Buffer.from(b).includes('.TH')],
  OPML: ['opml', (b) => Buffer.from(b).includes('<opml')], Org: ['org', txt], RST: ['rst', txt], Typst: ['typ', txt],
};
// [fixture, target]: inputs (one conversion each), then outputs (one source each)
const IN = {
  image: ['sample.svg', 'sample.svgz', 'nosize.svg', 'sample.qoi', 'sample.jp2', 'sample.j2k', 'sample.tga', 'sample.exr', 'sample.hdr', 'sample.dds', 'sample.pcx',
    'sample.pbm', 'sample.pgm', 'sample.ppm', 'sample.pnm', 'sample.pam', 'sample.cur', 'sample.xpm', 'sample.xbm'],
  audio: ['sample.aac', 'alac.m4a', 'sample.aiff', 'sample.aifc', 'sample.wma', 'sample.ac3', 'sample.caf', 'sample.mp2', 'sample.au', 'sample.m4b', 'sample.tta', 'sample.voc', 'sample.amr'],
  video: ['sample.mpg', 'sample.ts', 'sample.m2ts', 'sample.flv', 'sample.f4v', 'sample.wmv', 'sample.3gp', 'sample.3g2', 'sample.ogv', 'sample.vob', 'sample.mxf'],
  doc: ['sample.rst', 'sample.dbk', 'sample.ipynb', 'sample.typ', 'sample.opml', 'sample.org', 'sample.fb2', 'sample.xml', 'sample.1', 'sample.adoc', 'sample.csv', 'sample.tsv'],
};
const TO = { image: 'PNG', audio: 'MP3', video: 'MP4', doc: 'DOCX' };
const cases = [
  ...Object.entries(IN).flatMap(([k, fs]) => fs.map((f) => [F + f, TO[k]])),
  [F + 'sample.svg', 'JPG'], // SVG through magick as well (PNG skips the engine)
  ...['DDS', 'EXR', 'HDR', 'JP2', 'PBM', 'PCX', 'PGM', 'PPM', 'QOI', 'TGA', 'XPM'].map((t) => ['sample.png', t]),
  ...['AAC', 'AC3', 'AIFF', 'M4B', 'WMA'].map((t) => ['sample.wav', t]),
  ['sample.mp4', 'APNG'], ['sample.mp4', 'WEBP'],
  ...['AsciiDoc', 'DocBook', 'FB2', 'IPYNB', 'JATS', 'man', 'OPML', 'Org', 'RST', 'Typst'].map((t) => ['sample.md', t]),
].filter((c) => !process.env.ONLY || c.join(' ').includes(process.env.ONLY));

const browser = await { chromium, firefox, webkit }[name].launch();
const page = await browser.newPage({ acceptDownloads: true });
const errs = [];
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
page.on('pageerror', (e) => errs.push(String(e)));
const res = [];
for (const [i, [file, to]] of cases.entries()) {
  if (i % 10 === 0) { // keep the queue short; one retry: WebKit once never hydrated after a reload (1 of 2 full runs, not reproduced alone)
    const load = async () => { await page.goto(URL0); await page.waitForFunction(() => window.__convyReady, null, { timeout: 15000 }); };
    await load().catch(load);
  }
  const [ext, ok] = OUTS[to];
  const out = file.split('/').pop().replace(/\.[^.]+$/, '.' + ext);
  const t0 = Date.now();
  let st = 'failed', saved = null, why = '';
  try {
    await page.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`);
    await page.locator('.stage .tpick').waitFor({ timeout: 10000 });
    const chip = page.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
    if (await chip.count()) await chip.click(); else await page.locator('.stage .tpick select').selectOption(to);
    await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
    const act = page.locator('#sg-act');
    await act.click();
    const done = page.locator('.stage .readout', { hasText: out }), failed = page.locator('.stage .sg-say .err');
    await done.or(failed).first().waitFor({ timeout: 180000 });
    await page.waitForFunction(() => /Save|Kaydet/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say .err'), null, { timeout: 10000 });
    if (await failed.count()) why = await failed.first().textContent();
    else {
      const [dl] = await Promise.all([page.waitForEvent('download'), act.click()]);
      const b = new Uint8Array(Buffer.concat(await (await dl.createReadStream()).toArray()));
      saved = { name: dl.suggestedFilename(), bytes: b.length, head: (() => { try { return ok(b); } catch { return false; } })() };
      if (file.endsWith('nosize.svg')) saved.dim = Buffer.from(b).readUInt32BE(16) === 400 && Buffer.from(b).readUInt32BE(20) === 100; // viewBox size (PNG IHDR)
      st = saved.name === out && saved.bytes > 0 && saved.head && saved.dim !== false ? 'done' : 'bad';
    }
  } catch (e) { why = String(e).slice(0, 160); }
  console.error(st.padEnd(6), file, '→', to, Date.now() - t0, 'ms', why);
  res.push({ file, to, st, ms: Date.now() - t0, saved, why: why || undefined });
}
const bad = res.filter((r) => r.st !== 'done');
console.log(JSON.stringify({ browser: name, total: res.length, ok: res.length - bad.length, bad, errs }, null, 1));
await browser.close();
process.exit(!bad.length && !errs.length ? 0 : 1);
