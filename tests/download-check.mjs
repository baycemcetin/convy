// Converts one fixture through the UI and saves the result: node tests/download-check.mjs <browser> <fixture> <TARGET> <outPath>
import { firefox, webkit, chromium } from 'playwright-core';
const [bn, file, to, out] = process.argv.slice(2);
const b = await ({ firefox, webkit, chromium })[bn].launch(); const p = await b.newPage({ acceptDownloads: true });
await p.goto('http://127.0.0.1:4321/'); await p.waitForFunction(() => window.__convyReady);
await p.setInputFiles('[data-testid=pick]', 'tests/fixtures/' + file);
await p.locator('.stage .tpick .chip', { hasText: new RegExp('^' + to + '$') }).click(); await p.waitForTimeout(300);
await p.click('#sg-act'); await p.locator('.stage .pill').waitFor({ timeout: 60000 }); await p.waitForTimeout(800);
await p.screenshot({ path: `test-results/wave3-${bn}-${file}-${to}.png` });
const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#sg-act')]); await dl.saveAs(out); await b.close();
