// ffmpeg.wasm 0.12 single-thread core (no MT in v1, MIMARI Ek C). Fresh instance per job (heap never shrinks),
// input via WORKERFS (not copied into wasm memory), wall-clock timeout + terminate() (the promise can hang, R11).
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { loadEngine, ENGINES } from './load-wasm';
import { JOB_TIMEOUT_MS } from './limits';

const ARGS: Record<string, string[]> = {
  mp4: ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart'],
  webm: ['-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '1.5M', '-c:a', 'libopus'], // VP9 encode is broken in 0.12.10
  gif: ['-vf', 'fps=12,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse', '-an'],
  mp3: ['-vn', '-c:a', 'libmp3lame', '-q:a', '2'], m4a: ['-vn', '-c:a', 'aac', '-b:a', '192k'],
  wav: ['-vn', '-c:a', 'pcm_s16le'], flac: ['-vn', '-c:a', 'flac'], ogg: ['-vn', '-c:a', 'libvorbis', '-q:a', '5'],
  opus: ['-vn', '-c:a', 'libopus', '-b:a', '128k'],
};

export async function ffmpegConvert(file: File, to: string, outName: string, on: { engine?: (p: number) => void; progress?: (p: number) => void }, signal: AbortSignal): Promise<Uint8Array> {
  const { wasm } = await loadEngine('av', on.engine);
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  const ff = new FFmpeg();
  // core JS by URL (CSP script-src 'self' forbids blob: modules; versioned path, immutable); wasm as blob from the split parts
  const urls = [new URL(`/engines/${ENGINES.av}/ffmpeg-core.js`, location.origin).href, URL.createObjectURL(wasm)];
  const kill = () => ff.terminate();
  signal.addEventListener('abort', kill);
  try {
    await ff.load({ coreURL: urls[0], wasmURL: urls[1] });
    await ff.createDir('/in');
    await ff.mount('WORKERFS' as any, { files: [file] }, '/in');
    ff.on('progress', ({ progress }) => on.progress?.(Math.max(0, Math.min(1, progress))));
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), JOB_TIMEOUT_MS(file.size)));
    const code = await Promise.race([ff.exec(['-hide_banner', '-loglevel', 'error', '-i', `/in/${file.name}`, ...ARGS[to], '-y', outName]), timeout]);
    if (code !== 0) throw new Error(`ffmpeg exit ${code}`);
    return (await ff.readFile(outName)) as Uint8Array;
  } catch (e) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    throw e;
  } finally {
    signal.removeEventListener('abort', kill);
    ff.terminate();
    URL.revokeObjectURL(urls[1]);
  }
}
