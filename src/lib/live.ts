// T3 · one polite live region (#live in Base.astro), HAREKET §5.1. Written from event handlers (never rAF-bound, §4):
// clear → next frame-ish tick → write; same-tick messages join; completions coalesce in a 1200 ms window (≥ 2 → one summary,
// at most every 5 s, final summary at once); failures group in a 1200 ms window.
import { T } from './motion';

export function announcer() {
  const el = () => document.getElementById('live');
  let pending: string[] = [];
  let flushT = 0;
  function say(msg: string) {
    if (!msg) return;
    pending.push(msg);
    if (flushT) return;
    flushT = window.setTimeout(() => {
      const r = el(); const text = pending.join(' ');
      pending = []; flushT = 0;
      if (!r) return;
      r.textContent = '';
      setTimeout(() => { r.textContent = text; }, 60); // clear-then-write: the same text twice is still spoken
    }, 0);
  }

  // completions
  let win: { msg: string }[] = [];
  let winT = 0, lastSummary = 0;
  function done(detail: string, progress: () => string, running: () => number, batchOver: boolean) {
    win.push({ msg: detail });
    const flush = () => {
      winT = 0;
      const n = win.length; const one = win[0]?.msg;
      win = [];
      if (!n) return;
      if (n === 1 && running() <= 2) { say(one); return; }
      const now = Date.now();
      if (now - lastSummary >= 5000) { lastSummary = now; say(progress()); }
    };
    if (batchOver) { // last job finished: say it now, no wait
      clearTimeout(winT); winT = 0;
      const n = win.length; const one = win[0]?.msg; win = [];
      say(n === 1 && lastSummary === 0 ? one : progress());
      lastSummary = 0;
      return;
    }
    if (!winT) winT = window.setTimeout(flush, T.dwell);
  }

  // failures
  let fails: string[] = [];
  let failT = 0;
  function failed(name: string, one: (n: string) => string, many: (f: number, names: string) => string) {
    fails.push(name);
    if (!failT) failT = window.setTimeout(() => {
      failT = 0; const f = fails; fails = [];
      say(f.length === 1 ? one(f[0]) : many(f.length, f.join(', ')));
    }, T.dwell);
  }
  return { say, done, failed };
}
