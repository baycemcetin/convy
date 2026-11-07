# Wave 1 · hi-fi tool screen port · progress log
(zeze-frontend; resume from the last line)

- [start] read design sources (ekranlar.js, bilesen.js, veri.js, HAREKET §2–§11), core queue, Base.astro. Plan: one island `App.svelte` (header tools + panel + main) with howband/wordmark as Astro slots; Footer.astro static.
- [1] Components: App.svelte (header tools, subject rule, dwell/count mode, live diff, DnD, focus helper), Stage.svelte (all stage() states, persistent #sg-act, keyed 80/120 swap layers with pin()), Log.svelte (rows, engine line, Volt budget, ZIP, T6 inline Retry/Remove), DevicePanel.svelte (T2 sheet/popover, inert, theme, lang), Readout, Picker (chips + native select "More formats"), Arrow, atoms. HowBand.astro + Footer.astro static. lib/fmt.ts, lib/motion.ts (§11.4 tokens + easeTurn), lib/live.ts (T3), lib/view.ts, styles/product.css. Converter.svelte removed. Core change: none yet.
- [2] Copy passed as island prop (islandCopy, content-page sections excluded) → island 36.7 KB br (budget 35; @ffmpeg/ffmpeg class in main chunk, engines untouched).
- [3] Build clean; tests/shots.mjs screenshots EN/TR 390/1440 → test-results/wave1/. Fixed Svelte whitespace trimming in log lines.
- [4] Core: cancelled counts as ready (queue.svelte.ts ready()). e2e rewritten to drive the real UI (chip → #sg-act Convert → readout Result → #sg-act Save download): PNG→JPG, MP4→WEBM, MP4→GIF pass in chromium, firefox, webkit (test-results/wave1/e2e-*.json).
- [5] Behaviour probe (tests/behaviour.mjs): T5 'Images to' legend + applyToKind, count mode (ruler) in a 6-file batch, live: adds → 'Converting.' → '6 of 6 converted.', T1 Enter on row name keeps focus (aria-current), #sg-act same node through Convert→Stop→Save, panel keyboard open focuses Close, Esc returns to chip. Hover grep: all :hover inside (hover:hover) and (pointer:fine) (R-2026-23).
- [6] Final: build clean, e2e green in 3 browsers after last edit. Island JS 36.7 KB br (over 35 budget by 1.7 KB: @ffmpeg/ffmpeg wrapper is in the main chunk via engines/index → fix = dynamic import in engines, tech lead's call).

## Status per handoff item
- T1 done (persistent #sg-act, row name buttons, focus helper after Remove; probe passes). Manual screen-reader pass still open.
- T2 done (matchMedia sheet/popover, inert + aria-modal, no handle, 88dvh from hifi.css, Esc/close → chip). Close has no exit fade (instant) — open.
- T3 done with copy gaps: live.added/done/failed/batch are example sentences, not templates → composed from approved keys (see report). 1200 ms coalescing, 5 s summary cap, 3 s error grouping, clear-then-write.
- T4 done (header + long-queue ZIP, finished only, zipOnly note).
- T5 smallest version: stage picker legend becomes batch.target ("Images to") when ≥ 2 images can take a target; choice → applyToKind. Images only (copy exists only for images). DESIGN DECISION for Cem.
- T6 done (row inline Try again on failed, Remove on blocked).
- T7 OPEN: it.saved → data-saved only; no copy/visual for "Saved" exists.
- T8 structure done (Dim.svelte hides "×" from SR) but needs copy key sr.by; until then "×" stays readable.
- T9 already in hifi.css (forced-colors block); ebar now transform-based, still Highlight fill.
- T10 kept (Base.astro).
- T11 done: engine line/panel use q.sizes (ceil transfer / raw size), unknown → "—" or omitted.
- Motion: tokens lib/motion.ts; swap 80/120 with pinned outgoing layer; keyboard staging instant; completing hold fill+done (0 reduced); t-show 150; rows fly/fade/flip + stagger; ebar/arrow bridge var(--d-data). Not done: arrow fade-out on failed/cancel, panel exit fade, visibilitychange handling.
