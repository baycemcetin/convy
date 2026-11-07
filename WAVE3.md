# Wave 3 · document + PDF engines, audio, previews · progress log
(zeze-frontend; resume from the last line)

- [1] Pins: pandoc-wasm 1.1.0, pdfjs-dist 6.5.438, @bjorn3/browser_wasi_shim 0.4.2 (core.js imports it). prep-engines: pandoc@1.1.0 (3 × .N.wasm, raw 58.6 MB, transfer 16.2 MB), pdfjs@6.5.438 (pdf.min.mjs + pdf.worker.min.mjs as side files: raw 1.7 MB, transfer 0.5 MB; wasm/cmaps/standard_fonts/iccs copied, listed under manifest.lazy, not counted).
- [2] Workers: src/engines/pandoc.worker.ts (core.js createPandocInstance + our split cached loader), src/engines/pdf.worker.ts (pdf.js loaded from the engine path, OffscreenCanvas via ownerDocument shim, disableFontFace, isEvalSupported false; multi-page → ZIP of pages in index.ts, 1 page → single file; TXT via getTextContent). ENGINES + q.sizes/q.saved get doc and pdf; one runner per engine key.
- [3] formats.ts: document in DOCX ODT MD HTML EPUB RTF LaTeX, out DOCX MD EPUB ODT HTML TXT (TXT out-only); PDF out PNG JPG TXT. Chip order = veri.js TARGETS.
- [4] Preview table (engines/index.ts preview()): native img; > 12 MP and TIFF/JXL → magick PNG 1600 px; audio/video only if canPlayType; MD/TXT first 64 KB as <pre> text; others none. Blob URL revoked on remove. Item.url → item.pv, item.outN (ZIP name).
- [5] live.batch boundary = jobs of one Convert press + jobs joining while it runs; sums over that set only. sr.approx added (EN about / TR yaklaşık), "≈" aria-hidden in stage figure, readout, rows, ZIP sum.
- [6] Fixtures: sample.md, sample.docx (textutil), sample.pdf (2 pages, Chromium page.pdf), sample.wav/.mp3/.flac (ffmpeg CLI).
- [7] Fixes found by e2e: scripts/serve.mjs served .mjs without a MIME type (nosniff blocked pdf.js) → `.mjs: text/javascript` (Cloudflare Pages already does this). pdf.js nested worker failed and fell back with a warning → we preload pdf.worker.min.mjs as `pdfjsWorker` (parser runs in our worker; pdf.js still logs one "fake worker" warning, not an error). WebKit AudioDecoder claims FLAC then fails → audio in or audio out now always routes to ffmpeg ST (as MIMARI §16 says; Mediabunny keeps video→video). Sizes < 1 KB read "1 KB" (visible + spoken), never "0 KB". "Video engine ready." spoken once per session (ffmpeg reloads from cache per job).
- [8] e2e (tests/e2e.mjs, 11 cases incl. MD→DOCX, DOCX→MD, PDF→PNG (2 pages → sample.zip), PDF→TXT, WAV→MP3, MP3→WAV, FLAC→M4A, MP4→MP3) green in chromium, firefox, webkit, 0 console errors, CSP enforced, no COEP. No CSP violation from pdf.js in WebKit (no DOM in our worker → no runtime stylesheet), so no hash added. Outputs checked by eye: PDF pages render with Turkish glyphs, PDF→TXT and DOCX→MD text correct (fixture regenerated as UTF-8).
- [9] tests/batch-live.mjs: after 1 earlier conversion, a 2-file batch says "2 files converted. 91 kilobytes to 95 kilobytes." (was 3). First-load island JS 36.6 KB br; pandoc/pdf workers, fflate, ffmpeg wrapper lazy.
- [10] Final: build clean; e2e 11/11 in chromium, firefox, webkit, 0 console errors; wave-1 behaviour probe still green. Not committed.

## Open
- PDF engine (pdfjs, 0.5 MB) is not a row in the device panel (copy has 3 engine rows); it is counted in "Remove saved engines" and in storage. Engine line / readout call it the document engine (engName has no PDF word).
- pdf.js logs one console warning per load ("Setting up fake worker"): intended, parser runs in our worker.
- Not tested: > 12 MP downscale preview with a real large photo, JXL preview, LaTeX/RTF/ODT/EPUB inputs, real Word/Google Docs DOCX, scanned PDF (TXT empty, no OCR).
- Text preview (<pre> in the result tile) is the Ek B rule drawn in the existing tile; hi-fi never drew it.
