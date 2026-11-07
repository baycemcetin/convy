# Fix round 2 · QA build-tur2 findings · progress log
(zeze-frontend; resume from the last line)

- [1] P1-1/P1-2: index.ts call() now also listens to `messageerror` and drops (terminate + null) a worker that errored; magick `ready` and load-wasm `manifest()` no longer cache a rejected Promise (doc/pdf already reset `ready`, the stuck part was the cached manifest).
- [2] P2 offline wiring: q.online follows online/offline events; av job failing while offline with no saved engine → st 'offline' (copy exists for the video engine only); back online → item returns to ready. live.offline spoken.
- [3] Magic bytes: formats.ts sniff() + async detect() (content first; ext only for md/html/tex or as tie-break inside a container family); add() is async, `before` callback sets row stagger.
- [4] Scanned PDF → TXT: index.ts throws EngineError('noText'); Stage shows err.noText (EN/TR) in the existing failed view.
- [5] P2/P3 rest: single blocked file → Remove in the slot (also ends "Convert 0 files"); "Remove saved engines" only when something is saved and re-checks blocks after removal; failure announcement window 3 s → 1200 ms; Try again says "Converting."; Stop says "{name} stopped." (new live.stopped); "1 kilobyte" singular; Stop all returns focus to #sg-act.
- [6] Verified (build clean; e2e 11/11 chromium, firefox, webkit, 0 errors; qa2-device all 3 browsers; qa2-fix2.mjs new, PASS 3 browsers). sniff.ts is a lazy chunk (warmed after 2 s, extension fallback if offline); WebKit caches a failed dynamic import, so setTarget warms ./ffmpeg for audio/video.
- [7] Open: first-load island 37.34 KB br by my method vs 36.82 before this round (+0.5 KB, over budget); qa2-t6 results pending/see t6-*.log; "Lower resolution" action not built; 0-byte file still convertible; blocked-file stale after quota growth (no picker in block view).
- [8] Final: e2e 11/11 x3, device x3, t6 x3 (engine-fail retry recovers in image/doc/pdf/av), qa2-fix2 x3. Committed, mirrored.
