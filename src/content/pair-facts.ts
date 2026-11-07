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
const EXIF = f('EXIF metadata is kept in the output, including camera make and GPS location.', 'measured', SELF + ' (EXIF incl. GPS kept)');
const ORIENT = f('Rotation is applied to the pixels (autoOrient) and the orientation tag reset to 1, so the picture stands the right way in every viewer.', 'measured', MW + ':28; ' + SELF);
const ICC = f('ICC colour profile handling not checked.', 'unverified', '-');
const ALPHA_WHITE = f('Transparent areas become white (JPG has no transparency).', 'measured', MW + ':31; ' + SELF + ' (transparency → white)');
const ALPHA_KEEP = f('Transparency is kept.', 'measured', SELF + ' (kept in PNG/WebP)');
const NO_ALPHA_SRC = null;
const PNG_META = f('EXIF inside a PNG source (eXIf chunk) not tested; most PNGs carry none.', 'unverified', '-');
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

// ---- audio/video shared
const FF_LIMIT = f('ffmpeg path: refused before start when the estimated output is above 1 GB (500 MB on iPhone/iPad); estimate = duration × target bit rate.', 'code', 'src/engines/limits.ts:3; src/engines/index.ts:125-137');
const FF_TIMEOUT = f('ffmpeg path: stopped after 120 s + 2 s per input MB (wall clock).', 'code', 'src/engines/limits.ts:10; src/engines/ffmpeg.ts:29');
const MB_LIMIT = f('Mediabunny path: outputs above 50 MB stream to device storage (OPFS), not RAM; files above 2 GB get a warning, still allowed.', 'code', 'src/engines/limits.ts:4,9; src/engines/media.worker.ts:49');
const MP3 = f('MP3 via LAME VBR -q:a 2 (≈190 kbps average); lossy.', 'code', 'src/engines/ffmpeg.ts:11; src/engines/index.ts:135');
const AUDIO_PATH = f('Always ffmpeg, in every browser (audio output never uses WebCodecs).', 'code', 'src/engines/index.ts:114-115');
const AV_META = f('Tags/metadata (ID3, title, cover art) handling not checked.', 'unverified', '-');
const MP3_MIN = (n: number) => f(`ffmpeg 1 GB estimate ≈ ${n} h of MP3 at 190 kbps (1e9×8/190e3 s).`, 'code', 'src/engines/index.ts:135-137 (arithmetic)');
const mp3From = (from: string, extra: Fact[] = []): PairFacts => ({
  from, to: 'mp3', engine: 'ffmpeg', lossy: MP3, quality: f('Fixed: -q:a 2, no setting in the UI.', 'code', 'src/engines/ffmpeg.ts:11'),
  metadata: AV_META, transparency: null, animation: null, limits: [FF_LIMIT, FF_TIMEOUT, MP3_MIN(11.7)], download: AV_DL, path: AUDIO_PATH, offline: OFFLINE, extra,
});
const H264 = f('MP4 output is H.264 + AAC. Mediabunny: bitrate QUALITY_MEDIUM; ffmpeg: libx264 veryfast CRF 23, AAC 160 kbps, faststart.', 'code', 'src/engines/media.worker.ts:10-11,53; src/engines/ffmpeg.ts:8');
const TO_MP4_PATH = f('Mediabunny (WebCodecs) when the browser can decode the source tracks and encode H.264 + AAC at that size; otherwise ffmpeg. Decided per file by a probe.', 'code', 'src/engines/media.worker.ts:35-46; src/engines/index.ts:113-131');
const mp4From = (from: string, extra: Fact[]): PairFacts => ({
  from, to: 'mp4', engine: 'mediabunny-or-ffmpeg', lossy: f('Re-encoded (lossy); no stream copy.', 'code', 'src/engines/media.worker.ts:53; src/engines/ffmpeg.ts:8'),
  quality: H264, metadata: AV_META, transparency: null, animation: null, limits: [MB_LIMIT, FF_LIMIT, FF_TIMEOUT], download: MB_DL, path: TO_MP4_PATH, offline: OFFLINE, extra,
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
  image('heic', 'jpg', { srcAlpha: false, path: IMG_PATH, metadata: f('EXIF incl. GPS kept (HEIC made by macOS sips with EXIF+GPS, then converted).', 'measured', 'scratch run 2026-11-07 (see 05-build/PAIR-FACTS.md)'),
    extra: [f('Sample: 1280×720 HEIC 39 KB → JPG 51 KB.', 'measured', 'test-results/t2/inputs-*.json'), f('HEIC image sequences/Live Photo motion: only the still image.', 'unverified', '-')] }),
  image('heic', 'png', { srcAlpha: false, path: IMG_PATH, metadata: f('EXIF incl. GPS kept (sips-made HEIC).', 'measured', 'scratch run 2026-11-07'),
    extra: [f('Sample: 1280×720 HEIC 39 KB → PNG 136 KB.', 'measured', 'test-results/t2/inputs-*.json')] }),
  image('webp', 'png', { animated: true }),
  image('webp', 'jpg', { animated: true }),
  image('png', 'jpg', { metadata: PNG_META, path: f('Same output in Chromium, Firefox, WebKit (sample.png → 51 298 B JPG).', 'measured', 'test-results/final-e2e-*.json') }),
  image('jpg', 'png', { srcAlpha: false, extra: [f('Browser timing: 15 MP JPG → PNG 4.6–5.6 s, output 37.6 MB.', 'measured', 'test-results/t2/inputs-*.json (big15mp.jpg)')] }),
  mp3From('mp4', [f('Video track dropped (-vn); audio only.', 'code', 'src/engines/ffmpeg.ts:11'), f('Converted in Chromium, Firefox, WebKit (sample.mp4 → 18 868 B MP3, identical).', 'measured', 'test-results/final-e2e-*.json')]),
  mp4From('mov', [f('HEVC (H.265) MOV from iPhone: goes to ffmpeg wherever WebCodecs cannot decode HEVC; whether ffmpeg 0.12.10 core decodes HEVC, and which browsers take which path, not tested (no MOV fixture).', 'unverified', 'MIMARI update note; no fixture in tests/fixtures'),
    f('H.264 MOV path not tested in a browser (no MOV fixture).', 'unverified', '-')]),
  pdfTo('jpg'),
  pdfTo('png'),
  { from: 'mp4', to: 'gif', engine: 'ffmpeg', lossy: f('GIF is 256 colours per frame (palettegen + paletteuse).', 'code', 'src/engines/ffmpeg.ts:10'),
    quality: f('Fixed: 12 fps, 480 px wide (height by aspect), lanczos scaling; no setting in the UI.', 'code', 'src/engines/ffmpeg.ts:10'),
    metadata: null, transparency: null, animation: f('The whole clip becomes an animated GIF; sound is dropped (-an).', 'code', 'src/engines/ffmpeg.ts:10'),
    limits: [FF_LIMIT, FF_TIMEOUT, f('ffmpeg 1 GB estimate ≈ 44 min at the 3000 kbps GIF estimate.', 'code', 'src/engines/index.ts:135-137 (arithmetic)')],
    download: AV_DL, path: f('Always ffmpeg, every browser (GIF is not a Mediabunny output). Same bytes in Chromium, Firefox, WebKit (sample.mp4 → 875 487 B).', 'measured', 'src/engines/media.worker.ts:6-9,41; test-results/final-e2e-*.json'),
    offline: OFFLINE, extra: [] },
  mp4From('webm', [f('Firefox: whether it can encode H.264/AAC via WebCodecs decides the path; not tested (no WebM fixture).', 'unverified', '-')]),
  image('avif', 'jpg', { metadata: f('EXIF incl. GPS kept through AVIF input.', 'measured', SELF + ' (EXIF kept through webp/avif input)') }),
  image('avif', 'png', { metadata: f('EXIF incl. GPS kept through AVIF input.', 'measured', SELF) }),
  mp3From('wav', [f('Converted in Chromium, Firefox, WebKit (sample.wav → 6 755 B MP3, identical).', 'measured', 'test-results/final-e2e-*.json')]),
  mp3From('m4a', [f('M4A/AAC input not tested in a browser (no M4A fixture); FLAC → M4A is tested the other way.', 'unverified', 'tests/e2e.mjs:7-9')]),
  image('png', 'webp', { metadata: PNG_META }),
  image('jpg', 'webp', { srcAlpha: false, extra: [f('Browser timing: 15 MP JPG → WebP 7.0–8.2 s, output 6.6 MB.', 'measured', 'test-results/t2/inputs-*.json (big15mp.jpg)')] }),
];

export const pairFacts = (from: string, to: string) => PAIR_FACTS.find((p) => p.from === from && p.to === to);
