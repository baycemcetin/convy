// MB_LIMIT fact (src/content/pair-facts.ts): a video above MEDIABUNNY_TESTED_MAX on the Mediabunny path gets the 'warned'
// state (row word + mem notice + live region) and can still be converted (Convert is enabled). The ffmpeg path (audio out) gets no warning.
// The 2.2 GB file is av-h264-720p.mov followed by references to one 1 MB blob: no 2 GB allocation, Mediabunny probes the real header.
// Usage: node tests/size-warn.mjs [chromium|firefox|webkit]   (`npm run preview` must be running on :4321)
import { readFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';
const name = process.argv[2] || 'chromium';
const browser = await { chromium, firefox, webkit }[name].launch();
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(process.env.URL0 || 'http://localhost:4321/');
await page.waitForFunction(() => window.__convyReady);
const mp4 = [...readFileSync(new URL('./fixtures/av-h264-720p.mov', import.meta.url))];
const pick = (mb, fname) => page.evaluate(([b, mb, fname]) => {
  const head = new Blob([new Uint8Array(b)]), fill = new Blob([new Uint8Array(1e6)]);
  const f = new File([head, ...Array(mb).fill(fill)], fname, { type: 'video/quicktime' });
  const dt = new DataTransfer(); dt.items.add(f);
  const i = document.querySelector('[data-testid=pick]'); i.files = dt.files; i.dispatchEvent(new Event('change', { bubbles: true }));
  return f.size;
}, [mp4, mb, fname]);
const res = {};
const choose = async (to) => {
  const chip = page.locator('.stage .tpick .chip', { hasText: new RegExp(`^${to}$`) });
  await page.locator('.stage .tpick').waitFor({ timeout: 10000 });
  if (await chip.count()) await chip.click(); else await page.locator('.stage .tpick select').selectOption(to);
};
// big 720p H.264 MOV → MP4: Mediabunny only where WebCodecs can encode H.264 (not Firefox here, which then uses ffmpeg: no warning)
res.mediabunny = await page.evaluate(async () => { // the fixture has H.264 + AAC: both encoders needed (media.worker.ts probe)
  const ok = (p) => p?.then((r) => r.supported, () => false) ?? false;
  return (await ok(self.VideoEncoder?.isConfigSupported({ codec: 'avc1.42001f', width: 1280, height: 720 }))) && (await ok(self.AudioEncoder?.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2 })));
});
res.size = await pick(2200, 'big.mov');
await choose('MP4');
if (res.mediabunny) {
  await page.waitForFunction(() => /not tested at this size/i.test(document.querySelector('.stage')?.textContent || ''), null, { timeout: 30000 });
  res.stage = true;
  res.live = await page.waitForFunction(() => { const t = document.querySelector('[aria-live]')?.textContent || ''; return /not tested at this size/.test(t) && t; }, null, { timeout: 10000 }).then((h) => h.jsonValue());
} else {
  await page.waitForFunction(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true', null, { timeout: 30000 });
  await page.waitForTimeout(1000);
  res.stage = !/not tested at this size/i.test(await page.locator('.stage').textContent()); res.live = true;
}
res.convertEnabled = await page.evaluate(() => document.getElementById('sg-act')?.getAttribute('aria-disabled') !== 'true');
// stage a second file (it inherits MP4): the big file's row now sits in the log with the mem notice
await pick(1, 'small.mov');
await page.locator('[data-testid=item]', { hasText: 'small.mov' }).locator('.nm-b').click();
res.rowNotice = await page.locator('[data-testid=item]', { hasText: 'big.mov' }).locator('[data-testid=mem]').textContent({ timeout: res.mediabunny ? 10000 : 1000 }).catch(() => null);
// same big file → MP3 (ffmpeg path: audio out): no warning
await page.locator('[data-testid=item]', { hasText: 'big.mov' }).locator('select').selectOption('MP3').catch(() => {});
await page.waitForTimeout(1500);
res.mp3Notice = await page.locator('[data-testid=item]', { hasText: 'big.mov' }).locator('[data-testid=mem]').count();
console.log(JSON.stringify({ browser: name, res, errs }, null, 1));
await browser.close();
process.exit(res.size > 2e9 && res.stage && res.live && res.convertEnabled && (res.mediabunny ? /2\.0 GB/.test(res.rowNotice || '') : res.rowNotice === null) && res.mp3Notice === 0 && !errs.length ? 0 : 1);
