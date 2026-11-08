// Engine registry (MIMARI §3): picks the engine per job and runs it. Image → magick worker; audio/video → Mediabunny
// worker when WebCodecs can decode+encode the tracks, otherwise ffmpeg ST (HEVC MOV, GIF, MP3, old containers, no WebCodecs).
import { FFMPEG_MEMFS_MAX_OUT, PREVIEW_DOWNSCALE_MP, JOB_TIMEOUT_MS, OPFS_OUT_MIN } from './limits';
import { byId, type Format } from './formats';

export interface RunResult { blob: Blob; w?: number | null; h?: number | null; duration?: number | null; engine: 'magick' | 'mediabunny' | 'ffmpeg' | 'pandoc' | 'pdfjs'; name?: string; }
export interface RunHooks { engine?: (p: number) => void; progress?: (p: number | null) => void; }
export type ErrCode = 'tooBig' | 'unsupported' | 'failed' | 'timeout' | 'noText' | 'pixels' | 'password' | 'unreadable' | 'codec' | 'memory' | 'quota' | 'storage' | 'engine';
// wname: the worker's error name (PasswordException, QuotaExceededError…); with code 'failed' the reason is read lazily by classify.ts
export class EngineError extends Error { constructor(public code: ErrCode, msg: string = code, public wname = '') { super(msg); } }

let seq = 0;
function call(worker: Worker, msg: any, hooks: RunHooks, signal: AbortSignal, transfer: Transferable[] = []) {
  const id = ++seq;
  return new Promise<any>((res, rej) => {
    let started = false; // a progress message means the engine is up: a worker crash after that is the job (memory), before it the engine
    const end = (settle: () => void) => { worker.removeEventListener('message', on); worker.removeEventListener('error', err); worker.removeEventListener('messageerror', err); settle(); };
    const on = ({ data }: MessageEvent) => {
      if (data.id !== id) return;
      if (data.type === 'engine') hooks.engine?.(data.p);
      else if (data.type === 'progress') { started = true; hooks.progress?.(data.p); }
      else end(() => (data.type === 'done' ? res(data) : rej(new EngineError('failed', data.error, data.name))));
    };
    // an error outside the worker's try (module failed to load, async wasm abort) would otherwise leave the job running forever
    // (offline + chunk never fetched). The worker is dead after that, so drop it: the next job builds a fresh one
    const err = (e: Event) => end(() => { drop(worker); rej(new EngineError(started ? 'memory' : 'engine', (e as ErrorEvent).message || e.type)); });
    worker.addEventListener('message', on);
    worker.addEventListener('error', err);
    worker.addEventListener('messageerror', err);
    signal.addEventListener('abort', () => end(() => rej(new DOMException('cancelled', 'AbortError'))), { once: true });
    worker.postMessage({ id, ...msg }, transfer);
  });
}

// shortcut: one magick worker (MIMARI §4 says min(cores-1,3)); upgrade when batch throughput is measured.
let magick: Worker | null = null;
const magickW = () => (magick ??= new Worker(new URL('./magick.worker.ts', import.meta.url), { type: 'module' }));
let pandoc: Worker | null = null;
const pandocW = () => (pandoc ??= new Worker(new URL('./pandoc.worker.ts', import.meta.url), { type: 'module' }));
let pdf: Worker | null = null;
const pdfW = () => (pdf ??= new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' }));
let media: Worker | null = null;
const mediaW = () => (media ??= new Worker(new URL('./media.worker.ts', import.meta.url), { type: 'module' }));
function drop(w: Worker) { w.terminate(); if (magick === w) magick = null; if (pandoc === w) pandoc = null; if (pdf === w) pdf = null; if (media === w) media = null; }

// pandoc and pdf.js work synchronously inside their worker, so a hostile file can spin it forever
// (40 KB of nested Markdown brackets kept pandoc busy > 2 min, review [11]): stop it on a wall clock
function deadline<T>(p: Promise<T>, ms: number, kill: () => void) {
  let t: ReturnType<typeof setTimeout>;
  return Promise.race([p, new Promise<never>((_, rej) => { t = setTimeout(() => { kill(); rej(new EngineError('timeout')); }, ms); })]).finally(() => clearTimeout(t));
}

// Outputs above OPFS_OUT_MIN are OPFS files (media worker), in one folder per tab session. Once it has one, the page holds a
// Web Lock named after the folder, so a later session sweeps folders whose tab is gone (closed, crashed) and never touches
// another open tab's results. Nothing here leaves the device.
const SID = 'convy-' + Date.now().toString(36) + Math.random().toString(36).slice(2); // not randomUUID: that throws outside secure contexts
const opfsName = new WeakMap<Blob, string>();
let locked: Promise<void> | null = null;
const lockSession = () => (locked ??= new Promise<void>((res) => { if (!navigator.locks) return res(); navigator.locks.request(SID, () => { res(); return new Promise(() => {}); }); }));
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

/** Cheap pre-check for audio/video: which engine will run and what we know about the input. */
/** audio in or audio out always goes through ffmpeg ST (MIMARI §16): WebKit's AudioDecoder claims FLAC and then fails (wave 3 e2e) */
export const viaMediabunny = (kind: string, to: string, probeOk: boolean) => probeOk && kind !== 'audio' && !['mp3', 'm4a', 'wav', 'flac', 'ogg', 'opus'].includes(to);

export async function probeAV(file: File, to: string) {
  const s = new AbortController().signal;
  try { return await call(mediaW(), { op: 'probe', file, to }, {}, s); }
  catch { return { ok: false, duration: null, w: null, h: null }; }
}

export async function run(file: File, from: Format, to: string, outName: string, hooks: RunHooks, signal: AbortSignal): Promise<RunResult> {
  if (from.kind === 'image') {
    const w = magickW();
    signal.addEventListener('abort', () => { w.terminate(); magick = null; }, { once: true }); // only reliable stop
    const r = await call(w, { file, from: from.id, to }, hooks, signal);
    return { blob: new Blob([r.out], { type: mime(to) }), w: r.w, h: r.h, engine: 'magick' };
  }
  if (from.kind === 'document') {
    const w = pandocW(), kill = () => { w.terminate(); pandoc = null; };
    signal.addEventListener('abort', kill, { once: true });
    const r = await deadline(call(w, { file, from: from.id, to, title: outName.replace(/\.[^.]+$/, '') }, hooks, signal), JOB_TIMEOUT_MS(file.size), kill);
    return { blob: new Blob([r.out], { type: mime(to) }), engine: 'pandoc' };
  }
  if (from.kind === 'pdf') {
    const w = pdfW(), kill = () => { w.terminate(); pdf = null; };
    signal.addEventListener('abort', kill, { once: true });
    const r = await deadline(call(w, { file, to }, hooks, signal), JOB_TIMEOUT_MS(file.size), kill);
    if (to === 'txt' && !new TextDecoder().decode(r.pages[0]).trim()) throw new EngineError('noText'); // scanned PDF: pages are pictures, there is no OCR
    if (r.pages.length === 1) return { blob: new Blob([r.pages[0]], { type: mime(to) }), w: r.w || null, h: r.h || null, engine: 'pdfjs' };
    // one image per page → a ZIP of pages (stored: PNG/JPG are already compressed)
    const { zipSync } = await import('fflate');
    const stem = outName.replace(/\.[^.]+$/, ''), pad = String(r.n).length;
    const zip = zipSync(Object.fromEntries(r.pages.map((b: ArrayBuffer, i: number) => [`${stem}-${String(i + 1).padStart(pad, '0')}.${to}`, [new Uint8Array(b), { level: 0 }]])));
    return { blob: new Blob([zip as BlobPart], { type: 'application/zip' }), w: r.w, h: r.h, engine: 'pdfjs', name: `${stem}.zip` };
  }
  const pr = await probeAV(file, to);
  if (viaMediabunny(from.kind, to, pr.ok)) {
    const jid = seq + 1; // the id call() takes synchronously below
    const stop = () => mediaW().postMessage({ id: ++seq, op: 'cancel', job: jid });
    if (file.size > OPFS_OUT_MIN) await lockSession(); // same test as the worker's: this output goes to OPFS
    const r = await call(mediaW(), { op: 'convert', file, to, name: outName, sid: SID }, hooks, signal).catch((e) => { if (e.name === 'AbortError') stop(); throw e; });
    if (r.file) opfsName.set(r.file, r.opfs);
    return { blob: r.file ?? new Blob([r.out], { type: mime(to) }), w: pr.w, h: pr.h, duration: pr.duration, engine: 'mediabunny' };
  }
  // ffmpeg MEMFS output grows RAM linearly and >~1 GB fails (spike-2): estimate before starting
  const est = estimateOut(file.size, to, pr.duration);
  if (est > FFMPEG_MEMFS_MAX_OUT) throw new EngineError('tooBig');
  hooks.progress?.(0);
  const { ffmpegConvert } = await import('./ffmpeg'); // fallback engine: keep @ffmpeg/ffmpeg out of the island chunk
  const out = await ffmpegConvert(file, to, outName, { engine: hooks.engine, progress: hooks.progress }, signal)
    .catch((e) => { throw e.name === 'AbortError' ? e : new EngineError(e.message === 'timeout' ? 'timeout' : 'failed', e.message, e.name); });
  return { blob: new Blob([out as BlobPart], { type: mime(to) }), w: pr.w, h: pr.h, duration: pr.duration, engine: 'ffmpeg' };
}

/** Output size estimate where it can be computed (duration × target bit rate); null otherwise. */
const KBPS: Record<string, number> = { mp3: 190, m4a: 192, ogg: 160, opus: 128, flac: 900, wav: 1411, mp4: 2600, webm: 1700, gif: 3000 };
export function estimateOut(inBytes: number, to: string, duration: number | null) {
  return duration ? (duration * KBPS[to] * 1000) / 8 : inBytes;
}

// FORMATS holds each MIME; only the output-specific ones differ (charset, Opus in Ogg)
const MIME: Record<string, string> = { opus: 'audio/ogg', txt: 'text/plain;charset=utf-8', md: 'text/markdown;charset=utf-8', html: 'text/html;charset=utf-8' };
export const mime = (to: string) => MIME[to] || byId(to)?.mime || 'application/octet-stream';

/** Result-card preview (MIMARI Ek B): img for browser-native images (magick downscale above PREVIEW_DOWNSCALE_MP), magick PNG for
 *  TIFF/JXL, audio/video only when canPlayType says yes, first 64 KB of MD/TXT as text. Everything else: no preview. */
export type Preview = { kind: 'img' | 'audio' | 'video'; url: string } | { kind: 'text'; text: string } | null;
const NATIVE_IMG = new Set(['png', 'jpg', 'webp', 'gif', 'bmp', 'ico', 'avif']);
export async function preview(r: RunResult, to: string, signal: AbortSignal): Promise<Preview> {
  if (r.name) return null; // ZIP of pages
  const big = (r.w ?? 0) * (r.h ?? 0) > PREVIEW_DOWNSCALE_MP * 1e6;
  if (NATIVE_IMG.has(to) && !big) return { kind: 'img', url: URL.createObjectURL(r.blob) };
  if (NATIVE_IMG.has(to) || to === 'tiff' || to === 'jxl') {
    // the job's signal: Stop/remove during this downscale terminates magick (run's abort hook); without it this call never settles and the image runner stalls
    const p = await call(magickW(), { file: r.blob, from: to, to: 'png', maxSide: 1600 }, {}, signal).catch(() => null);
    return p ? { kind: 'img', url: URL.createObjectURL(new Blob([p.out], { type: 'image/png' })) } : null;
  }
  const av = r.blob.type.split('/')[0];
  if ((av === 'audio' || av === 'video') && document.createElement(av).canPlayType(r.blob.type)) return { kind: av, url: URL.createObjectURL(r.blob) };
  // MD pictures are data URIs (pandoc worker): show their head only, not 64 KB of base64
  if (to === 'md' || to === 'txt') return { kind: 'text', text: new TextDecoder().decode(await r.blob.slice(0, 64 * 1024).arrayBuffer()).replace(/(data:[\w/+.-]+;base64,)[\w+/=]{16,}/g, '$1…') };
  return null;
}
