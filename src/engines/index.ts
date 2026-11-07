// Engine registry (MIMARI §3): picks the engine per job and runs it. Image → magick worker; audio/video → Mediabunny
// worker when WebCodecs can decode+encode the tracks, otherwise ffmpeg ST (HEVC MOV, GIF, MP3, old containers, no WebCodecs).
import { FFMPEG_MEMFS_MAX_OUT } from './limits';
import type { Format } from './formats';

export interface RunResult { blob: Blob; w?: number | null; h?: number | null; duration?: number | null; engine: 'magick' | 'mediabunny' | 'ffmpeg'; }
export interface RunHooks { engine?: (p: number) => void; progress?: (p: number | null) => void; }
export class EngineError extends Error { constructor(public code: 'tooBig' | 'unsupported' | 'failed' | 'timeout', msg = code) { super(msg); } }

let seq = 0;
function call(worker: Worker, msg: any, hooks: RunHooks, signal: AbortSignal, transfer: Transferable[] = []) {
  const id = ++seq;
  return new Promise<any>((res, rej) => {
    const on = ({ data }: MessageEvent) => {
      if (data.id !== id) return;
      if (data.type === 'engine') hooks.engine?.(data.p);
      else if (data.type === 'progress') hooks.progress?.(data.p);
      else { worker.removeEventListener('message', on); data.type === 'done' ? res(data) : rej(new EngineError('failed', data.error)); }
    };
    worker.addEventListener('message', on);
    signal.addEventListener('abort', () => { worker.removeEventListener('message', on); rej(new DOMException('cancelled', 'AbortError')); }, { once: true });
    worker.postMessage({ id, ...msg }, transfer);
  });
}

// shortcut: one magick worker (MIMARI §4 says min(cores-1,3)); upgrade when batch throughput is measured.
let magick: Worker | null = null;
const magickW = () => (magick ??= new Worker(new URL('./magick.worker.ts', import.meta.url), { type: 'module' }));
let media: Worker | null = null;
const mediaW = () => (media ??= new Worker(new URL('./media.worker.ts', import.meta.url), { type: 'module' }));

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
  const pr = await probeAV(file, to);
  if (pr.ok) {
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

const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', bmp: 'image/bmp', tiff: 'image/tiff', ico: 'image/x-icon', jxl: 'image/jxl', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg', opus: 'audio/ogg', mp4: 'video/mp4', webm: 'video/webm' };
export const mime = (to: string) => MIME[to] || 'application/octet-stream';
