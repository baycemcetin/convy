// Engine registry (MIMARI §3): picks the engine per job and runs it. Image → magick worker; audio/video → Mediabunny
// worker when WebCodecs can decode+encode the tracks, otherwise ffmpeg ST (HEVC MOV, GIF, MP3, old containers, no WebCodecs).
import { FFMPEG_MEMFS_MAX_OUT, PREVIEW_DOWNSCALE_MP, JOB_TIMEOUT_MS } from './limits';
import type { Format } from './formats';

export interface RunResult { blob: Blob; w?: number | null; h?: number | null; duration?: number | null; engine: 'magick' | 'mediabunny' | 'ffmpeg' | 'pandoc' | 'pdfjs'; name?: string; }
export interface RunHooks { engine?: (p: number) => void; progress?: (p: number | null) => void; }
export class EngineError extends Error { constructor(public code: 'tooBig' | 'unsupported' | 'failed' | 'timeout' | 'noText', msg = code) { super(msg); } }

let seq = 0;
function call(worker: Worker, msg: any, hooks: RunHooks, signal: AbortSignal, transfer: Transferable[] = []) {
  const id = ++seq;
  return new Promise<any>((res, rej) => {
    const end = (settle: () => void) => { worker.removeEventListener('message', on); worker.removeEventListener('error', err); worker.removeEventListener('messageerror', err); settle(); };
    const on = ({ data }: MessageEvent) => {
      if (data.id !== id) return;
      if (data.type === 'engine') hooks.engine?.(data.p);
      else if (data.type === 'progress') hooks.progress?.(data.p);
      else end(() => (data.type === 'done' ? res(data) : rej(new EngineError('failed', data.error))));
    };
    // an error outside the worker's try (module failed to load, async wasm abort) would otherwise leave the job running forever
    // (offline + chunk never fetched). The worker is dead after that, so drop it: the next job builds a fresh one
    const err = (e: Event) => end(() => { drop(worker); rej(new EngineError('failed', (e as ErrorEvent).message || e.type)); });
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

/** Cheap pre-check for audio/video: which engine will run and what we know about the input. */
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
  // audio in or audio out always goes through ffmpeg ST (MIMARI §16): WebKit's AudioDecoder claims FLAC and then fails (wave 3 e2e)
  const audio = from.kind === 'audio' || ['mp3', 'm4a', 'wav', 'flac', 'ogg', 'opus'].includes(to);
  if (pr.ok && !audio) {
    const jid = seq + 1; // the id call() takes synchronously below
    const stop = () => mediaW().postMessage({ id: ++seq, op: 'cancel', job: jid });
    const r = await call(mediaW(), { op: 'convert', file, to, name: outName }, hooks, signal).catch((e) => { if (e.name === 'AbortError') stop(); throw e; });
    return { blob: r.file ?? new Blob([r.out], { type: mime(to) }), w: pr.w, h: pr.h, duration: pr.duration, engine: 'mediabunny' };
  }
  // ffmpeg MEMFS output grows RAM linearly and >~1 GB fails (spike-2): estimate before starting
  const est = estimateOut(file.size, to, pr.duration);
  if (est > FFMPEG_MEMFS_MAX_OUT) throw new EngineError('tooBig');
  hooks.progress?.(0);
  const { ffmpegConvert } = await import('./ffmpeg'); // fallback engine: keep @ffmpeg/ffmpeg out of the island chunk
  const out = await ffmpegConvert(file, to, outName, { engine: hooks.engine, progress: hooks.progress }, signal)
    .catch((e) => { throw e.name === 'AbortError' ? e : new EngineError(e.message === 'timeout' ? 'timeout' : 'failed', e.message); });
  return { blob: new Blob([out as BlobPart], { type: mime(to) }), w: pr.w, h: pr.h, duration: pr.duration, engine: 'ffmpeg' };
}

/** Output size estimate where it can be computed (duration × target bit rate); null otherwise. */
const KBPS: Record<string, number> = { mp3: 190, m4a: 192, ogg: 160, opus: 128, flac: 900, wav: 1411, mp4: 2600, webm: 1700, gif: 3000 };
export function estimateOut(inBytes: number, to: string, duration: number | null) {
  return duration ? (duration * KBPS[to] * 1000) / 8 : inBytes;
}

const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', bmp: 'image/bmp', tiff: 'image/tiff', ico: 'image/x-icon', jxl: 'image/jxl', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg', opus: 'audio/ogg', mp4: 'video/mp4', webm: 'video/webm', txt: 'text/plain;charset=utf-8', md: 'text/markdown;charset=utf-8', html: 'text/html;charset=utf-8', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', odt: 'application/vnd.oasis.opendocument.text', epub: 'application/epub+zip' };
export const mime = (to: string) => MIME[to] || 'application/octet-stream';

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
  if (to === 'md' || to === 'txt') return { kind: 'text', text: new TextDecoder().decode(await r.blob.slice(0, 64 * 1024).arrayBuffer()) };
  return null;
}
