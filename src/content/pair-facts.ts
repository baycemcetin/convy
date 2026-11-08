// Product behaviour facts for the launch pairs (SEO-SAYFALAR §1.2 "A", §3.2 field 10 pairNote). Owner: tech-lead.
// Copy (pairNote, limits, FAQ) may only state what is here; a fact marked 'unverified' must not be written as a claim.
// status: 'measured' = observed in a test or script run (source names it) · 'code' = read from the code path, not run for this pair
//         · 'unverified' = not checked; say nothing, or say it conditionally after a test.
// Download sizes are a 2026-11-07 snapshot; pages read the live numbers from public/engines/*/manifest.json at build (§3.2 field 6).
export type Status = 'measured' | 'code' | 'unverified';
export interface Fact { claim: string; status: Status; source: string }
export type Engine = 'magick' | 'pdfjs' | 'ffmpeg' | 'mediabunny-or-ffmpeg';
export interface PairFacts {
  from: string; to: string; engine: Engine;
  lossy: Fact; quality: Fact; metadata: Fact | null; transparency: Fact | null; animation: Fact | null;
  limits: Fact[]; download: Fact; path: Fact; offline: Fact; extra: Fact[];
}

const MW = 'src/engines/magick.worker.ts';
const SELF = 'tests/pair-facts.mjs';
const f = (claim: string, status: Status, source: string): Fact => ({ claim, status, source });

// ---- shared facts
const IMG_DL = f('Image engine (magick-wasm 0.0.46): ≤5.4 MB download (gzip upper bound), 15.5 MB on the device; downloaded once, kept in Cache Storage.', 'code', 'public/engines/magick@0.0.46/manifest.json; src/engines/load-wasm.ts:1-2');
const AV_DL = f('Audio & video engine (ffmpeg.wasm 0.12.10, single-thread): ≤10.3 MB download (gzip upper bound), 32.3 MB on the device; kept in Cache Storage.', 'code', 'public/engines/ffmpeg-st@0.12.10/manifest.json');
const MB_DL = f('Mediabunny path: no engine download, it is part of the site JS (media worker chunk ≈154 KB gzip). The ffmpeg fallback is ≤10.3 MB download, 32.3 MB on the device.', 'measured', 'dist/_astro/media.worker-*.js (gzip -c | wc -c, 2026-11-07); public/engines/ffmpeg-st@0.12.10/manifest.json');
const PDF_DL = f('PDF engine (pdf.js 6.5.438): ≤0.52 MB download (gzip upper bound), 1.7 MB on the device; fonts/cmaps (3.4 MB raw) are fetched only when a PDF needs them.', 'code', 'public/engines/pdfjs@6.5.438/manifest.json; src/engines/pdf.worker.ts:26');
const OFFLINE = f('Works offline once its engine is saved and the page is already open. The page itself cannot be opened offline (no service worker).', 'measured', 'tests/qa3-offline.mjs (case B, reload); WAVE3.md:37-38 (offline for all four engines, 3 browsers)');
const OFFLINE_PDF_FONTS = f('Fonts/cmaps a PDF needs are fetched on first use outside Cache Storage; offline behaviour for such PDFs not checked.', 'unverified', 'src/engines/pdf.worker.ts:26');
const IMG_PATH = f('Same engine and same output in every browser: byte-identical output in Chromium, Firefox, WebKit and Node.', 'measured', 'test-results/t2/inputs-{chromium,firefox,webkit}.json (heic→jpg 50 654 B, heic→png 135 556 B); ' + SELF);
const IMG_PATH_CODE = f('Same engine (magick-wasm) in every browser; no browser-specific branch.', 'code', 'src/engines/index.ts:89-93');
const IMG_LIMIT = f('Images above 250 megapixels are refused (100 MP on iPhone/iPad) instead of exhausting memory.', 'code', 'src/engines/limits.ts:8; ' + MW + ':19');
const IMGPDF = 'tests/img-pdf.mjs (test-results/w3-img-pdf-{chromium,firefox,webkit}.json)';
const EXIF = f('Metadata is removed from the output: EXIF (camera make/model, date, GPS location), XMP, IPTC and comments.', 'measured', MW + ':13-18,38; ' + SELF + ' (EXIF/GPS, XMP, IPTC, comment removed; tests/fixtures/meta.jpg)');
const ORIENT = f('Rotation is applied to the pixels (autoOrient) before the EXIF block is removed, so the picture stands the right way in every viewer.', 'measured', MW + ':37; ' + SELF + '; ' + IMGPDF);
const ICC = f('The ICC colour profile is kept (Display P3 fixture: profile present in JPG, PNG, WebP, AVIF, TIFF, JXL output).', 'measured', MW + ':15; ' + SELF);
const ALPHA_WHITE = f('Transparent areas become white (JPG has no transparency).', 'measured', MW + ':31; ' + SELF + ' (transparency → white)');
const ALPHA_KEEP = f('Transparency is kept.', 'measured', SELF + ' (kept in PNG/WebP)');
const NO_ALPHA_SRC = null;
const PNG_META = f('Metadata in a PNG source (eXIf, XMP, text comments) is removed, orientation applied.', 'measured', 'tests/pair-facts.mjs (PNG with eXIf + iTXt XMP + tEXt; positive and negative control)');
const FIRST_FRAME = f('Animated input: only the first frame is converted.', 'measured', MW + ':27 (ImageMagick.read = one image); ' + SELF);
const Q85 = (fmt: string) => f(`${fmt} quality 85 (fixed, no setting in the UI).`, 'code', MW + ':22,32');
const LOSSLESS_PNG = f('PNG is lossless: no further quality loss; the file is usually much larger (12 MP JPG 1.2 MB → PNG 11.8 MB).', 'measured', 'scratch run 2026-11-07, photo12mp.jpg (see 05-build/PAIR-FACTS.md)');
const LOSSY_JPG = f('JPG is lossy (quality 85).', 'code', MW + ':32');
const LOSSY_WEBP = f('WebP output is lossy (VP8) even from PNG; there is no lossless option.', 'measured', SELF + ' (lossy VP8 even from PNG)');
const NA_Q = f('No quality setting: lossless output.', 'code', MW + ':32 (quality ignored by PNG)');

const image = (from: string, to: string, o: Partial<PairFacts> & { animated?: boolean; srcAlpha?: boolean }): PairFacts => ({
  from, to, engine: 'magick', download: IMG_DL, offline: OFFLINE, limits: [IMG_LIMIT],
  path: o.path ?? IMG_PATH_CODE,
  lossy: to === 'png' ? LOSSLESS_PNG : to === 'webp' ? LOSSY_WEBP : LOSSY_JPG,
  quality: to === 'png' ? NA_Q : Q85(to.toUpperCase()),
  metadata: o.metadata ?? EXIF,
  transparency: o.srcAlpha === false ? NO_ALPHA_SRC : to === 'jpg' ? ALPHA_WHITE : ALPHA_KEEP,
  animation: o.animated ? FIRST_FRAME : null,
  extra: [ORIENT, ICC, ...(o.extra ?? [])],
});

// ---- image → PDF shared (src/engines/pdf-write.ts)
const PW = 'src/engines/pdf-write.ts';
const PDF_PAGE = f('One image → one single-page PDF. Page size from the pixels at 150 dpi (12 MP 4080×3072 → 1958×1475 pt ≈ 69×52 cm); a side above 14 400 pt (PDF limit) is scaled down to it. No setting in the UI. Several images into one PDF: not offered.', 'measured', PW + ':6-7,20-21; ' + SELF);
const PDF_PATH = f('Same bytes in Chromium, Firefox, WebKit; each PDF reopened with pdf.js (1 page, size, rendered orientation checked).', 'measured', IMGPDF);
const toPdf = (from: string, o: Partial<PairFacts> & { lossy: Fact }): PairFacts => ({
  from, to: 'pdf', engine: 'magick', download: IMG_DL, offline: OFFLINE, path: PDF_PATH, quality: PDF_PAGE, animation: null, transparency: null,
  limits: [], extra: [], metadata: null, ...o,
});

// ---- audio/video shared
const FF_LIMIT = f('ffmpeg path: refused before start when the estimated output is above 1 GB (500 MB on iPhone/iPad); estimate = duration × target bit rate.', 'code', 'src/engines/limits.ts:3; src/engines/index.ts:125-137');
const FF_TIMEOUT = f('ffmpeg path: stopped after 120 s + 2 s per input MB (wall clock).', 'code', 'src/engines/limits.ts:10; src/engines/ffmpeg.ts:29');
const MB_LIMIT = f('Mediabunny path: outputs above 50 MB stream to device storage (OPFS), not RAM; files above 2 GB get a "not tested at this size" warning and can still be converted. The ffmpeg path has no warning: it has its own 1 GB output stop.', 'measured', 'tests/opfs.mjs (66 MB H.264 → OPFS); tests/size-warn.mjs (2.2 GB MOV: warning in Chromium + WebKit, none on Firefox\'s ffmpeg path); src/engines/limits.ts:4,9; src/lib/queue.svelte.ts setTarget');
const MP3 = f('MP3 via LAME VBR -q:a 2 (≈190 kbps average); lossy.', 'code', 'src/engines/ffmpeg.ts:11; src/engines/index.ts:135');
const AUDIO_PATH = f('Always ffmpeg, in every browser (audio output never uses WebCodecs).', 'code', 'src/engines/media.worker.ts probe (audio in/out → ok false); src/engines/index.ts run');
const AVP = 'tests/av-pairs.mjs; DOC 06-qa/av-pairs-tur2/av-{chromium,firefox,webkit}.json';
const AVP1 = 'DOC 06-qa/av-pairs/json/av-{chromium,firefox,webkit}.json (before the untagged-SD guard)';
const MP3_META = f('Title, artist and album go into the MP3 as ID3 tags; cover art is not carried (-vn). The MP3 also gets an encoder tag (Lavf59.27.100) and, from MP4/M4A input, the container brand tags. Measured with tagged WAV and M4A input, same in Chromium, Firefox, WebKit.', 'measured', AVP + '; src/engines/ffmpeg.ts:11');
const MP4_META_CLAIM = 'Title and artist are kept. Location (com.apple.quicktime.location.ISO6709) and camera make are dropped on both paths. Recording date: the Mediabunny path writes the conversion time instead of the source date; the ffmpeg path writes no date. Synthetic MOV fixtures, not a real iPhone file.';
const MP4_META = f(MP4_META_CLAIM + ' Same in Chromium, Firefox, WebKit.', 'measured', AVP + ' (av-h264.mov, av-gps.mov, av-h264-720p.mov); ' + AVP1);
const SD_GUARD = f('Untagged video below 720 lines always goes to ffmpeg, so players show the source colours (on the Mediabunny path such output was tagged BT.709 and shifted visibly, RGB PSNR ≈25 dB; now 36–44 dB). Tagged SD and 720p+ stay on Mediabunny where the browser can.', 'measured', 'src/engines/media.worker.ts (probe); ' + AVP + '; ' + AVP1);
const MP3_MIN = (n: number) => f(`ffmpeg 1 GB estimate ≈ ${n} h of MP3 at 190 kbps (1e9×8/190e3 s).`, 'code', 'src/engines/index.ts:135-137 (arithmetic)');
const mp3From = (from: string, extra: Fact[] = []): PairFacts => ({
  from, to: 'mp3', engine: 'ffmpeg', lossy: MP3, quality: f('Fixed: -q:a 2, no setting in the UI.', 'code', 'src/engines/ffmpeg.ts:11'),
  metadata: MP3_META, transparency: null, animation: null, limits: [FF_LIMIT, FF_TIMEOUT, MP3_MIN(11.7)], download: AV_DL, path: AUDIO_PATH, offline: OFFLINE, extra,
});
const H264 = f('MP4 output is H.264 + AAC. Mediabunny: bitrate QUALITY_MEDIUM; ffmpeg: libx264 veryfast CRF 23, AAC 160 kbps, faststart.', 'code', 'src/engines/media.worker.ts:10-11,53; src/engines/ffmpeg.ts:8');
const TO_MP4_PATH = f('Mediabunny (WebCodecs) when the browser can decode the source tracks and encode H.264 + AAC at that size; otherwise ffmpeg. Decided per file by a probe.', 'code', 'src/engines/media.worker.ts:35-46; src/engines/index.ts:113-131');
const mp4From = (from: string, extra: Fact[], metadata: Fact = MP4_META): PairFacts => ({
  from, to: 'mp4', engine: 'mediabunny-or-ffmpeg', lossy: f('Re-encoded (lossy); no stream copy.', 'code', 'src/engines/media.worker.ts:53; src/engines/ffmpeg.ts:8'),
  quality: H264, metadata, transparency: null, animation: null, limits: [MB_LIMIT, FF_LIMIT, FF_TIMEOUT], download: MB_DL, path: TO_MP4_PATH, offline: OFFLINE, extra: [...extra, SD_GUARD],
});

// ---- PDF shared
const PDF_RENDER = f('Every page becomes one image at 2× scale (≈144 dpi), longest side capped at 4000 px; more than one page → a ZIP of numbered images.', 'code', 'src/engines/pdf.worker.ts:11,44-46; src/engines/index.ts:106-111');
const PDF_BG = f('Page background is white (pdf.js default), so the image has no transparency.', 'code', 'node_modules/pdfjs-dist/types/src/display/api.d.ts:1371-1376; src/engines/pdf.worker.ts:49');
const PDF_PW = f('Password-protected PDFs fail with a "password" reason; opening with a password is not offered.', 'code', 'src/engines/index.ts:8-9 (ErrCode password)');
const pdfTo = (to: 'jpg' | 'png'): PairFacts => ({
  from: 'pdf', to, engine: 'pdfjs',
  lossy: to === 'jpg' ? f('JPG quality 0.9 (browser encoder).', 'code', 'src/engines/pdf.worker.ts:11,52') : f('PNG, lossless raster of the page.', 'code', 'src/engines/pdf.worker.ts:52'),
  quality: f('Fixed scale 2 and quality 0.9; no setting in the UI.', 'code', 'src/engines/pdf.worker.ts:11'),
  metadata: f('PDF metadata is not carried into the images.', 'code', 'src/engines/pdf.worker.ts:47-52 (canvas → blob)'),
  transparency: PDF_BG, animation: null,
  limits: [f('Stopped after 120 s + 2 s per input MB.', 'code', 'src/engines/limits.ts:10; src/engines/index.ts:104'), PDF_PW],
  download: PDF_DL, path: f('Same engine in every browser; rendered on OffscreenCanvas, so pixels may differ slightly between browsers (sample.pdf→PNG ZIP: 116 KB Chromium, 44 KB Firefox, 105 KB WebKit).', 'measured', 'test-results/final-e2e-{chromium,firefox,webkit}.json'),
  offline: OFFLINE, extra: [PDF_RENDER, OFFLINE_PDF_FONTS],
});

export const PAIR_FACTS: PairFacts[] = [
  image('heic', 'jpg', { srcAlpha: false, path: IMG_PATH, metadata: f('EXIF incl. GPS removed, ICC kept (tests/fixtures/meta.heic, made by macOS sips with EXIF+GPS+Display P3), in Chromium, Firefox, WebKit.', 'measured', IMGPDF + '; ' + SELF),
    extra: [f('Sample: 1280×720 HEIC 39 KB → JPG 51 KB.', 'measured', 'test-results/t2/inputs-*.json'), f('HEIC image sequences/Live Photo motion: only the still image.', 'unverified', '-')] }),
  image('heic', 'png', { srcAlpha: false, path: IMG_PATH, metadata: f('EXIF incl. GPS removed, ICC kept (meta.heic), in Chromium, Firefox, WebKit.', 'measured', IMGPDF + '; ' + SELF),
    extra: [f('Sample: 1280×720 HEIC 39 KB → PNG 136 KB.', 'measured', 'test-results/t2/inputs-*.json')] }),
  image('webp', 'png', { animated: true }),
  image('webp', 'jpg', { animated: true }),
  image('png', 'jpg', { metadata: PNG_META, path: f('Same output in Chromium, Firefox, WebKit (sample.png → 51 298 B JPG).', 'measured', 'test-results/final-e2e-*.json') }),
  image('jpg', 'png', { srcAlpha: false, extra: [f('Browser timing: 15 MP JPG → PNG 4.6–5.6 s, output 37.6 MB.', 'measured', 'test-results/t2/inputs-*.json (big15mp.jpg)')] }),
  mp3From('mp4', [f('Video track dropped (-vn); audio only.', 'code', 'src/engines/ffmpeg.ts:11'), f('Converted in Chromium, Firefox, WebKit (sample.mp4 → 18 868 B MP3, identical).', 'measured', 'test-results/final-e2e-*.json')]),
  mp4From('mov', [f('HEVC (H.265) MOV: the ffmpeg 0.12.10 core decodes it, 8 and 10 bit (output H.264 8 bit; 10 bit → 8 bit, RGB PSNR ≈33 dB). Playwright Chromium 156 and Firefox 157 have no WebCodecs HEVC decoder → ffmpeg; WebKit decodes HEVC with WebCodecs (Mediabunny path, 43.7 dB 8 bit / 31.4 dB 10 bit). Google Chrome with hardware HEVC, and real iPhone HEVC/HDR (HLG, Dolby Vision), not tested.', 'measured', AVP + ' (av-hevc.mov, av-hevc10.mov); ' + AVP1 + '; DOC 06-qa/av-pairs/json/caps.txt'),
    f('H.264 MOV: Chromium and WebKit → Mediabunny (tagged SD, 720p), Firefox → ffmpeg (its WebCodecs has no AAC encoder); output H.264 + AAC, duration within 0.02 s. 1–2 s synthetic clips, not a real iPhone file.', 'measured', AVP + ' (av-h264*.mov); DOC 06-qa/av-pairs/json/caps.txt')]),
  pdfTo('jpg'),
  pdfTo('png'),
  { from: 'mp4', to: 'gif', engine: 'ffmpeg', lossy: f('GIF is 256 colours per frame (palettegen + paletteuse).', 'code', 'src/engines/ffmpeg.ts:10'),
    quality: f('Fixed: 12 fps, 480 px wide (height by aspect), lanczos scaling; no setting in the UI.', 'code', 'src/engines/ffmpeg.ts:10'),
    metadata: null, transparency: null, animation: f('The whole clip becomes an animated GIF; sound is dropped (-an).', 'code', 'src/engines/ffmpeg.ts:10'),
    limits: [FF_LIMIT, FF_TIMEOUT, f('ffmpeg 1 GB estimate ≈ 44 min at the 3000 kbps GIF estimate.', 'code', 'src/engines/index.ts:135-137 (arithmetic)')],
    download: AV_DL, path: f('Always ffmpeg, every browser (GIF is not a Mediabunny output). Same bytes in Chromium, Firefox, WebKit (sample.mp4 → 875 487 B).', 'measured', 'src/engines/media.worker.ts:6-9,41; test-results/final-e2e-*.json'),
    offline: OFFLINE, extra: [f('Sample: 640×360 MP4 → 480×270 GIF, no audio, duration +0.01 s, same in Chromium, Firefox, WebKit.', 'measured', AVP + ' (sample.mp4)')] },
  mp4From('webm', [f('VP9 and VP8 WebM: Firefox → ffmpeg (its WebCodecs has no AAC encoder); Chromium and WebKit → Mediabunny when the video is tagged or 720p+. Output H.264 + AAC, duration −0.001/+0.018 s, same in Chromium, Firefox, WebKit.', 'measured', AVP + ' (av-vp9.webm, av-vp8.webm); DOC 06-qa/av-pairs/json/caps.txt')],
    f('Same conversion step as MOV → MP4, measured only with MOV input (the WebM fixtures carry no tags): ' + MP4_META_CLAIM, 'code', AVP + ' (MOV); src/engines/media.worker.ts:47-55; src/engines/ffmpeg.ts:8')),
  image('avif', 'jpg', { metadata: f('EXIF incl. GPS removed through AVIF input.', 'measured', SELF + ' (EXIF removed through webp/avif input)') }),
  image('avif', 'png', { metadata: f('EXIF incl. GPS removed through AVIF input.', 'measured', SELF) }),
  mp3From('wav', [f('Converted in Chromium, Firefox, WebKit (sample.wav → 6 755 B MP3, identical, duration unchanged).', 'measured', 'test-results/final-e2e-*.json; ' + AVP)]),
  mp3From('m4a', [f('M4A (AAC) input converted in Chromium, Firefox, WebKit: same 10 845 B MP3, duration +0.02 s.', 'measured', AVP + ' (av-tagged.m4a)')]),
  image('png', 'webp', { metadata: PNG_META }),
  toPdf('jpg', {
    download: f('No engine download for ordinary JPEGs; 12-bit, lossless or arithmetic-coded JPEGs fetch the image engine (≤5.4 MB).', 'measured', IMGPDF + ' (fresh context: 0 magick*.wasm requests, 3 browsers)'),
    lossy: f('No quality loss: the JPEG data go into the PDF as they are (DCTDecode), not re-encoded; the scan bytes in the PDF are identical to the source.', 'measured', PW + ' jpegPdf; ' + SELF + '; ' + IMGPDF),
    metadata: f('EXIF (incl. GPS), XMP, IPTC, comments and the MPF/extra images after the first image are cut from the embedded JPEG without re-encoding; the ICC profile goes in as the PDF colour space (ICCBased).', 'measured', PW + ' jpegPdf; ' + SELF + '; ' + IMGPDF + ' (tests/fixtures/meta.jpg)'),
    limits: [f('JPEGs that are 12-bit, lossless or arithmetic-coded are not embedded directly; they go through the image engine and in losslessly (Flate) instead.', 'code', PW + ' jpegPdf (SOF check)')],
    extra: [f('EXIF orientation is applied through the page matrix, without re-encoding: orientation 6 → portrait page, rendered upright.', 'measured', PW + ':10-12; ' + IMGPDF),
      f('Output ≈ input size: meta.jpg 1 339 B → PDF 1 651 B.', 'measured', IMGPDF)],
  }),
  toPdf('png', {
    lossy: f('Lossless: 8-bit RGB pixels, Flate-compressed; the stream inflates to exactly the source pixels. 16-bit PNG is reduced to 8 bits per channel.', 'measured', PW + ' pixelsPdf; ' + MW + ':45-46; ' + SELF + ' (pixels identical)'),
    metadata: f('Metadata removed (same step as image outputs), ICC profile kept as the PDF colour space.', 'measured', MW + ':38; ' + SELF + ' (heic → pdf with meta.heic; same pixel path)'),
    transparency: f('Transparency is kept as a soft mask (SMask).', 'measured', PW + ' pixelsPdf; ' + SELF + ' (half-transparent PNG) ; ' + IMGPDF + ' (alpha.webp, rendered over white)'),
    limits: [IMG_LIMIT],
    extra: [ORIENT, f('Output ≈ PNG size: sample.png 96 453 B → PDF 105 947 B.', 'measured', IMGPDF)],
  }),
  image('jpg', 'webp', { srcAlpha: false, extra: [f('Browser timing: 15 MP JPG → WebP 7.0–8.2 s, output 6.6 MB.', 'measured', 'test-results/t2/inputs-*.json (big15mp.jpg)')] }),
];

export const pairFacts = (from: string, to: string) => PAIR_FACTS.find((p) => p.from === from && p.to === to);
