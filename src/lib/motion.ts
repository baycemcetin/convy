// Motion tokens, HAREKET §11.4 JS mapping. Single JS source; hifi.css :root holds the same values by hand (JS never reads CSS).
import { prefersReducedMotion } from 'svelte/motion';

export const T = { swapOut: 80, swapIn: 120, sheet: 240, sheetOut: 200, exit: 120, enter: 200, fill: 200, done: 480, data: 240, stagger: 30, dwell: 1200, tTick: 250, tShow: 150 };

/** duration honouring reduced motion. tShow and dwell are thresholds, not motion: never zeroed (HAREKET §5) */
export const d = (ms: number) => (prefersReducedMotion.current ? 0 : ms);

/** cubic-bezier(0, .55, .45, 1) = --ease-turn (Newton + bisection, x → t → y) */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t, Y = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) { const e = X(t) - x, s = dX(t); if (Math.abs(e) < 1e-5) return Y(t); if (Math.abs(s) < 1e-6) break; t -= e / s; }
    let lo = 0, hi = 1; t = x;
    while (hi - lo > 1e-5) { if (X(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return Y(t);
  };
}
export const easeTurn = bezier(0, 0.55, 0.45, 1);

/** outgoing swap layer leaves the flow where it stands, so the incoming layer never stacks under it (HAREKET §11.1) */
export function pin(e: Event) {
  const n = e.currentTarget as HTMLElement;
  if (getComputedStyle(n).position === 'absolute') return;
  Object.assign(n.style, { position: 'absolute', top: n.offsetTop + 'px', left: n.offsetLeft + 'px', width: n.offsetWidth + 'px', margin: '0', pointerEvents: 'none' });
}

/** svelte/animate flip without the zoom/transform-origin parsing: rows have no transform and a centred origin (smaller than the library one) */
export const flip = (_n: Element, { from, to }: { from: DOMRect; to: DOMRect }, p: { duration: number; easing: (t: number) => number }) => {
  const dx = from.left + from.width / 2 - to.left - to.width / 2, dy = from.top + from.height / 2 - to.top - to.height / 2;
  const sx = from.width / to.width, sy = from.height / to.height;
  return { duration: p.duration, easing: p.easing, css: (t: number, u: number) => `transform:translate(${u * dx}px,${u * dy}px) scale(${t + u * sx},${t + u * sy})` };
};

type Tr = { duration: number; delay?: number; easing?: (t: number) => number; y?: number };
/** svelte/transition fade and fly (y only) without unit parsing; elements here carry no transform of their own */
export const fade = (n: Element, p: Tr) => { const o = +getComputedStyle(n).opacity; return { delay: p.delay, duration: p.duration, easing: p.easing, css: (t: number) => `opacity:${t * o}` }; };
export const fly = (n: Element, p: Tr) => { const o = +getComputedStyle(n).opacity; return { delay: p.delay, duration: p.duration, easing: p.easing, css: (t: number, u: number) => `transform:translateY(${u * p.y!}px);opacity:${t * o}` }; };
