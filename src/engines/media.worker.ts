// Mediabunny (WebCodecs) worker: video/audio conversion with progress and cancel.
// Large outputs stream to OPFS via createSyncAccessHandle (worker-only), so memory stays flat (spike-2).
import * as mb from 'mediabunny';
import { OPFS_OUT_MIN } from './limits';

const FORMAT: Record<string, () => mb.OutputFormat> = {
  mp4: () => new mb.Mp4OutputFormat({ fastStart: false }), m4a: () => new mb.Mp4OutputFormat({ fastStart: false }),
  webm: () => new mb.WebMOutputFormat(), mkv: () => new mb.MkvOutputFormat(),
};
const VCODEC: Record<string, mb.VideoCodec> = { mp4: 'avc', webm: 'vp9', mkv: 'avc' };
const ACODEC: Record<string, mb.AudioCodec> = { mp4: 'aac', m4a: 'aac', webm: 'opus', mkv: 'aac' };
const running = new Map<number, mb.Conversion>();

async function opfsWriter(name: string) {
  const dir = await navigator.storage.getDirectory();
  const fh = await dir.getFileHandle(name, { create: true });
  const ah = await (fh as any).createSyncAccessHandle();
  ah.truncate(0);
  return {
    fh, ah,
    stream: new WritableStream<{ data: Uint8Array; position: number }>({
      write(c) { ah.write(c.data, { at: c.position }); },
      close() { ah.flush(); ah.close(); },
      abort() { ah.close(); },
    }),
  };
}

const ops: Record<string, (a: any, id: number) => Promise<any>> = {
  // Can this browser do it with WebCodecs? Decides Mediabunny vs ffmpeg before the job starts (HEVC MOV etc.).
  async probe({ file, to }) {
    const input = new mb.Input({ formats: mb.ALL_FORMATS, source: new mb.BlobSource(file) });
    const v = await input.getPrimaryVideoTrack(), a = await input.getPrimaryAudioTrack();
    const duration = await input.computeDuration().catch(() => null);
    const info = { duration, w: v?.displayWidth ?? null, h: v?.displayHeight ?? null };
    // Firefox: WebCodecs VP9 is ~4x slower than ffmpeg VP8 (spike, MIMARI §8 / R12) → WebM goes to ffmpeg there
    if (!FORMAT[to] || (to === 'webm' && / Firefox\//.test(navigator.userAgent))) return { ok: false, ...info };
    const wantVideo = to !== 'm4a' && !!v;
    const ok = (!wantVideo || ((await v!.canDecode()) && (await mb.canEncodeVideo(VCODEC[to], { width: v!.displayWidth, height: v!.displayHeight }))))
      && (!a || ((await a.canDecode()) && (await mb.canEncodeAudio(ACODEC[to]))));
    return { ok: ok && (wantVideo || !!a), ...info };
  },
  async convert({ file, to, name }, id) {
    const input = new mb.Input({ formats: mb.ALL_FORMATS, source: new mb.BlobSource(file) });
    const w = file.size > OPFS_OUT_MIN ? await opfsWriter(name) : null;
    const target = w ? new mb.StreamTarget(w.stream, { chunked: true }) : new mb.BufferTarget();
    const opts: any = { input, output: new mb.Output({ format: FORMAT[to](), target }) };
    if (to === 'm4a') opts.video = { discard: true };
    else opts.video = { codec: VCODEC[to], bitrate: mb.QUALITY_MEDIUM }; // Mediabunny default bitrate is ~4x ffmpeg's (MIMARI §8)
    opts.audio = { codec: ACODEC[to] };
    const conv = await mb.Conversion.init(opts);
    if (!conv.isValid) { w?.ah.close(); throw new Error('invalid: ' + conv.discardedTracks.map((t) => t.reason).join(',')); }
    conv.onProgress = (p) => self.postMessage({ id, type: 'progress', p });
    running.set(id, conv);
    try { await conv.execute(); } finally { running.delete(id); }
    if (w) return { file: await w.fh.getFile() };
    return { out: new Uint8Array((target as mb.BufferTarget).buffer!) };
  },
  async cancel({ job }) { await running.get(job)?.cancel(); return {}; },
};

self.onmessage = async ({ data: { id, op, ...args } }) => {
  try {
    const r = await ops[op](args, id);
    self.postMessage({ id, type: 'done', ...r }, r.out ? [r.out.buffer] : []);
  } catch (e: any) {
    self.postMessage({ id, type: 'error', error: String(e?.message || e) });
  }
};
