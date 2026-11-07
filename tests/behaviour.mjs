// Wave 1 behaviour probe: live region sequence, count mode, T1 focus (Tab → Enter → Shift+Tab), panel focus return.
import { chromium } from 'playwright-core';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); const out = { live: [], errs: [] };
p.on('pageerror', (e) => out.errs.push(String(e)));
await p.goto(process.env.URL0 || 'http://127.0.0.1:4321/'); await p.waitForFunction(() => window.__convyReady);
await p.evaluate(() => { const r = document.getElementById('live'); new MutationObserver(() => r.textContent && window.__live.push(r.textContent)).observe(r, { childList: true, characterData: true, subtree: true }); window.__live = []; });
await p.setInputFiles('[data-testid=pick]', Array(6).fill('tests/fixtures/sample.png'));
await p.locator('.stage .tpick .chip', { hasText: /^JPG$/ }).click(); await p.waitForTimeout(300);
out.legend = await p.locator('.stage .tpick legend').innerText();
out.readyRows = await p.locator('[data-st=ready]').count();
await p.click('#sg-act'); out.labelAfterClick = await p.locator('#sg-act').innerText();
let sawCount = false; for (let i = 0; i < 60; i++) { if (await p.locator('.stage .ruler').count()) sawCount = true; if ((await p.locator('[data-st=done]').count()) === 6) break; await p.waitForTimeout(100); }
out.sawCount = sawCount; await p.waitForTimeout(3500);
await p.screenshot({ path: 'test-results/wave1/batch-done-1440-en.png', fullPage: true });
out.live = await p.evaluate(() => window.__live);
// T1: focus a row name, Enter stages it, Shift+Tab goes back sanely
await p.locator('.nm-b').nth(2).focus(); await p.keyboard.press('Enter');
out.afterEnter = await p.evaluate(() => document.activeElement?.className + ' ' + document.activeElement?.getAttribute('aria-current'));
await p.keyboard.press('Shift+Tab'); out.afterShiftTab = await p.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
await p.locator('#sg-act').focus(); out.slotId0 = await p.evaluate(() => { window.__slot = document.getElementById('sg-act'); return true; });
await p.keyboard.press('Enter'); await p.waitForTimeout(200);
out.slotSameNode = await p.evaluate(() => window.__slot === document.getElementById('sg-act') && document.activeElement === window.__slot);
await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab'); out.backOnSlot = await p.evaluate(() => document.activeElement?.id);
// panel: keyboard open → focus close; Esc → back on chip
await p.locator('.chip-dev').focus(); await p.keyboard.press('Enter'); out.panelFocus = await p.evaluate(() => document.activeElement?.getAttribute('aria-label'));
await p.keyboard.press('Escape'); out.panelReturn = await p.evaluate(() => document.activeElement?.className);
console.log(JSON.stringify(out, null, 1)); await b.close();
