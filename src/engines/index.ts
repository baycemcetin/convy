// Engine registry (MIMARI §3): shared types, errors, OPFS session and estimates. The job runner (workers, run, preview) is ./jobs,
// a lazy chunk outside the island budget (loaded at idle and on first use).
import { byId } from './formats';

export interface RunResult { blob: Blob; w?: number | null; h?: number | null; duration?: number | null; engine: 'magick' | 'mediabunny' | 'ffmpeg' | 'pandoc' | 'pdfjs'; name?: string; }
export interface RunHooks { engine?: (p: number) => void; progress?: (p: number | null) => void; }
export type ErrCode = 'tooBig' | 'unsupported' | 'failed' | 'timeout' | 'noText' | 'pixels' | 'password' | 'unreadable' | 'codec' | 'memory' | 'quota' | 'storage' | 'engine';
// wname: the worker's error name (PasswordException, QuotaExceededError…); with code 'failed' the reason is read lazily by classify.ts
export class EngineError extends Error { constructor(public code: ErrCode, msg: string = code, public wname = '') { super(msg); } }

// Outputs above OPFS_OUT_MIN are OPFS files (media worker), in one folder per tab session. Once it has one, the page holds a
// Web Lock named after the folder, so a later session sweeps folders whose tab is gone (closed, crashed) and never touches
// another open tab's results. Nothing here leaves the device.
export const SID = 'convy-' + Date.now().toString(36) + Math.random().toString(36).slice(2); // not randomUUID: that throws outside secure contexts
export const opfsName = new WeakMap<Blob, string>();
let locked: Promise<void> | null = null;
export const lockSession = () => (locked ??= new Promise<void>((res) => { if (!navigator.locks) return res(); navigator.locks.request(SID, () => { res(); return new Promise(() => {}); }); }));
const opfsRoot = () => navigator.storage.getDirectory();
/** Delete a result's OPFS file; true if it had one (in-memory results: false). The Blob is unreadable afterwards. */
export function release(b: Blob | null) {
  const name = b && opfsName.get(b); if (!name) return false;
  opfsName.delete(b!);
  opfsRoot().then((r) => r.getDirectoryHandle(SID)).then((d) => d.removeEntry(name)).catch(() => {});
  return true;
}
/** New session: remove every OPFS entry no open tab holds (earlier sessions, crashed tabs, files written before session folders). */
export async function sweepOpfs() {
  try {
    const root = await opfsRoot();
    const held = new Set(((await navigator.locks?.query())?.held ?? []).map((l) => l.name));
    const names: string[] = [];
    for await (const name of (root as any).keys() as AsyncIterable<string>) names.push(name); // list first: removing while iterating can skip entries
    for (const name of names) if (name !== SID && !held.has(name)) await root.removeEntry(name, { recursive: true }).catch(() => {});
  } catch {} // no OPFS (private mode, old browser): nothing was written either
}
/** pagehide that is not bfcache: best effort, the page may be gone before it ends; the next session's sweep catches the rest. */
export function dropSession() { opfsRoot().then((r) => r.removeEntry(SID, { recursive: true })).catch(() => {}); }

/** Output size estimate where it can be computed (duration × target bit rate); null otherwise. */
const KBPS: Record<string, number> = { mp3: 190, m4a: 192, ogg: 160, opus: 128, flac: 900, wav: 1411, mp4: 2600, webm: 1700, gif: 3000, aiff: 1411, apng: 8000, webp: 1500 };
export function estimateOut(inBytes: number, to: string, duration: number | null) {
  return duration ? (duration * (KBPS[to] ?? 192) * 1000) / 8 : inBytes; // 192: AAC, AC-3, WMA, M4B (ffmpeg.ts bit rates)
}

// FORMATS holds each MIME; only the output-specific ones differ (charset, Opus in Ogg)
const MIME: Record<string, string> = { opus: 'audio/ogg', txt: 'text/plain;charset=utf-8', md: 'text/markdown;charset=utf-8', html: 'text/html;charset=utf-8' };
export const mime = (to: string) => MIME[to] || byId(to)?.mime || 'application/octet-stream';

/** Result-card preview (MIMARI Ek B): img for browser-native images (magick downscale above PREVIEW_DOWNSCALE_MP), magick PNG for
 *  TIFF/JXL, audio/video only when canPlayType says yes, first 64 KB of MD/TXT as text. Everything else: no preview. */
export type Preview = { kind: 'img' | 'audio' | 'video'; url: string } | { kind: 'text'; text: string } | null;
