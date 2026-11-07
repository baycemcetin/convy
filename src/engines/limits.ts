// Thresholds (TEYIT-ui-tur1 Ek D). Provisional until real-device measurement (iPhone, R3).
const iOS = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);
export const FFMPEG_MEMFS_MAX_OUT = (iOS ? 500 : 1000) * 1e6; // bytes; estimated output above this never goes to ffmpeg
export const MEDIABUNNY_TESTED_MAX = 2 * 1024 ** 3;           // above: warn, still allowed
export const IMAGE_WARN_MP: number | null = null;             // empty until measured → no image warning
export const PREVIEW_DOWNSCALE_MP = 12;
export const OPFS_OUT_MIN = 50e6;                             // outputs above this stream to OPFS, not RAM
export const FFMPEG_TIMEOUT_MS = (inBytes: number) => 120_000 + inBytes / 1e6 * 2_000; // wall clock, then terminate()
