// Document pictures survive DOCX/ODT/EPUB → HTML / MD (DECISIONS 2026-11-07). Fixtures images.* were made with pandoc from
// one Markdown file: Turkish text, a table, a 160×90 PNG and a 120×120 JPG. HTML: both pictures are data URIs, no external
// src/href. MD: both pictures are data URIs, no extracted-media path left; the result preview shortens the base64.
// Usage: node tests/doc-images.mjs [chromium|firefox|webkit]  (preview on :4321 or URL0)
import { readFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium', URL0 = process.env.URL0 || 'http://localhost:4321/';
const b = await { chromium, firefox, webkit }[name].launch();
const page = await b.newPage({ acceptDownloads: true });
const errs = [];
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 140)));
page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
const res = [];
for (const file of ['images.docx', 'images.odt', 'images.epub']) for (const to of ['HTML', 'MD']) {
  // a fresh page per case: a second file of a kind inherits the batch target and the stage keeps the earlier result
  await page.goto(URL0); await page.waitForFunction(() => window.__convyReady);
  await page.setInputFiles('[data-testid=pick]', `tests/fixtures/${file}`);
  console.error('case', file, to); await page.locator('.stage .tpick').waitFor({ timeout: 10000 }).catch(async (e) => { await page.screenshot({ path: `test-results/docimg-fail-${name}.png`, fullPage: true }); throw e; });
  const chip = page.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
  if (await chip.count()) await chip.click(); else await page.locator('.stage .tpick select').selectOption(to);
  await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
  await page.click('#sg-act');
  await page.waitForFunction(() => /Save|Try again/.test(document.getElementById('sg-act')?.textContent || ''), null, { timeout: 180000 });
  const r = { file, to, ok: /Save/.test(await page.locator('#sg-act').textContent()) };
  if (r.ok) {
    const pre = to === 'MD' ? await page.locator('.stage pre.txt').textContent().catch(() => '') : '';
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('#sg-act')]);
    const s = readFileSync(await dl.path()).toString('utf8');
    r.bytes = s.length;
    r.turkish = s.includes('ğüşıöçİĞÜŞÖÇ') && s.includes('Çanakkale');
    if (to === 'HTML') {
      r.png = (s.match(/<img[^>]*src="data:image\/png;base64,/g) || []).length;
      r.jpg = (s.match(/<img[^>]*src="data:image\/jpeg;base64,/g) || []).length;
      r.external = (s.match(/(src|href)="(https?:|\/\/)[^"]*"/g) || []).length + (s.match(/<img(?![^>]*src="data:)[^>]*>/g) || []).length;
      r.pass = r.png === 1 && r.jpg === 1 && !r.external && /<table/.test(s) && r.turkish;
    } else {
      r.png = (s.match(/\]\(data:image\/png;base64,[\w+/=]+\)/g) || []).length;
      r.jpg = (s.match(/\]\(data:image\/jpeg;base64,[\w+/=]+\)/g) || []).length;
      r.leftover = s.includes('convy-media');
      r.preview = /data:image\/png;base64,…/.test(pre) && pre.length < 2000;
      r.pass = r.png === 1 && r.jpg === 1 && !r.leftover && r.preview && r.turkish;
    }
  }
  res.push(r);
}
const pass = res.every((r) => r.pass) && !errs.length;
console.log(JSON.stringify({ browser: name, pass, res, errs }, null, 1));
await b.close();
process.exit(pass ? 0 : 1);
