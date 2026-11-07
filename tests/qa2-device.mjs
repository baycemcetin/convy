// QA build-tur2 §1: offline (open tab, engine cached / not cached) + quota (storage.estimate stub). Usage: OUT=<dir> node tests/qa2-device.mjs [browser]
import { launch, open, run, snap, pickTarget } from './qa2-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/t2'; mkdirSync(OUT, { recursive: true });
const b = await launch(name); const R = {};
const wait = (p, ms) => p.waitForTimeout(ms);
const fail = async (p) => p.waitForFunction(() => /Save|Kaydet|Try again|Yeniden/.test(document.getElementById('sg-act')?.textContent || '') || document.querySelector('.stage .sg-say'), null, { timeout: 20000 }).catch(() => 'HANG');

// ---- OFFLINE ----
{ const ctx = await b.newContext({ acceptDownloads: true }); const p = await open(ctx); const o = R.offline = {};
  o.warm = (await run(p, 'sample.png', 'JPG')).label;                                   // image engine now in Cache Storage
  await p.reload(); await p.waitForFunction(() => window.__convyReady); await p.evaluate(() => { window.__live = []; const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); });
  o.savedBefore = await p.evaluate(async () => { const c = await caches.open('convy-engines-v1'); return (await c.keys()).length; });
  await ctx.setOffline(true); await wait(p, 800);
  o.onLine = await p.evaluate(() => navigator.onLine); o.tagOff = await p.locator('.tag-off').count();
  await p.screenshot({ path: `${OUT}/offline-tagcheck-${name}.png` });
  const s1 = await run(p, 'sample.png', 'WEBP'); o.cachedImage = { label: s1.label, act: s1.act, say: s1.say };            // cached engine, offline
  await p.reload().catch(() => {}); 
  const s2 = await (async () => { try { await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.md'); await pickTarget(p, 'DOCX'); await p.click('#sg-act'); await fail(p); await wait(p, 600); return snap(p); } catch (e) { return { exc: String(e).slice(0, 160) }; } })();
  o.uncachedDoc = s2; await p.screenshot({ path: `${OUT}/offline-uncached-doc-${name}.png` }).catch(() => {});
  o.reloadOffline = await p.goto('http://127.0.0.1:4321/').then((r) => r?.status(), (e) => String(e).slice(0, 80));
  await ctx.setOffline(false); await wait(p, 500); o.afterOnline = { onLine: await p.evaluate(() => navigator.onLine).catch(() => null), tagOff: await p.locator('.tag-off').count().catch(() => null) };
  o.errs = p.errs; await ctx.close(); }
// fresh ctx, page loaded online, then offline BEFORE first conversion (engine never cached)
{ const ctx = await b.newContext({}); const p = await open(ctx); const o = R.offlineUncachedImage = {};
  await ctx.setOffline(true); await wait(p, 500);
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await pickTarget(p, 'JPG'); await p.click('#sg-act'); await fail(p); await wait(p, 3500);
  Object.assign(o, await snap(p)); o.live = await p.evaluate(() => window.__live); o.tagOff = await p.locator('.tag-off').count();
  await p.screenshot({ path: `${OUT}/offline-uncached-image-${name}.png` }); o.errs = p.errs; await ctx.close(); }

// ---- QUOTA ----
const stub = (q, u) => `(() => { window.__q = { quota: ${q}, usage: ${u} }; const e = () => Promise.resolve({ quota: window.__q.quota, usage: window.__q.usage }); Object.defineProperty(navigator, 'storage', { value: { estimate: e }, configurable: true }); })()`;
for (const [tag, q, u, file, to] of [['png-10MB', 12e6, 2e6, 'sample.png', 'JPG'], ['doc-30MB', 30e6, 5e6, 'sample.md', 'DOCX'], ['av-20MB', 40e6, 20e6, 'sample.mp4', 'GIF'], ['pdf-1MB', 1e6, 0.5e6, 'sample.pdf', 'PNG'], ['ample', 50e9, 1e9, 'sample.png', 'JPG'], ['quota0', 0, 0, 'sample.png', 'JPG'], ['full-quota', 80e6, 80e6, 'sample.png', 'JPG']]) {
  const ctx = await b.newContext({}); await ctx.addInitScript(stub(q, u)); const p = await open(ctx); const o = R['quota-' + tag] = {};
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/' + file); await pickTarget(p, to); await wait(p, 600);
  Object.assign(o, await snap(p)); o.live = await p.evaluate(() => window.__live); o.notice = await p.locator('#q-notice').innerText().catch(() => null);
  o.actDisabled = await p.locator('#sg-act').getAttribute('aria-disabled');
  await p.screenshot({ path: `${OUT}/quota-${tag}-${name}.png` });
  if (tag === 'png-10MB') {                               // recovery: more room appears, then "Remove saved engines" / re-pick
    await p.evaluate(() => { window.__q.quota = 50e9; });
    o.noticeBtns = await p.locator('#q-notice button').count(); o.slotAct = await p.locator('#sg-act').innerText(); // nothing saved → no "Remove saved engines"; slot = Remove
    if (o.noticeBtns) await p.locator('#q-notice button').click(); await wait(p, 600); o.afterRemoveBtn = { label: (await snap(p)).label, notice: await p.locator('#q-notice').count() };
    o.pickerInBlock = await p.locator('.stage .tpick').count(); o.buttons = await p.locator('.stage button, .log button').allInnerTexts(); await wait(p, 500); o.afterRepick = { label: (await snap(p)).label, notice: await p.locator('#q-notice').count() };
  }
  if (tag === 'png-10MB') { // batch: blocked file + a file that fits
    await p.evaluate(() => { window.__q.quota = 12e6; });
  }
  o.errs = p.errs; await ctx.close();
}
// estimate() throws / missing
{ const ctx = await b.newContext({}); await ctx.addInitScript(`Object.defineProperty(navigator,'storage',{value:{estimate:()=>Promise.reject(new Error('x'))},configurable:true})`); const p = await open(ctx); const o = R.quotaRejects = {};
  await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/sample.png'); await pickTarget(p, 'JPG'); await wait(p, 500); Object.assign(o, await snap(p)); o.errs = p.errs; await ctx.close(); }
writeFileSync(`${OUT}/device-${name}.json`, JSON.stringify(R, null, 1)); await b.close();
for (const [k, v] of Object.entries(R)) console.error(k, JSON.stringify(v).slice(0, 700));
