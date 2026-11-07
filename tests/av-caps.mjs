// WebCodecs capability probe per browser (explains the Mediabunny/ffmpeg path choice). Usage: node tests/av-caps.mjs [browser]
import { launch, open } from './qa2-lib.mjs';
const name = process.argv[2] || 'chromium'; const b = await launch(name); const p = await open(await b.newContext());
console.log(name, JSON.stringify(await p.evaluate(async () => {
  const r = { ua: navigator.userAgent.match(/(Chrome|Firefox|Version)\/[\d.]+/)?.[0], VideoDecoder: typeof VideoDecoder, VideoEncoder: typeof VideoEncoder, AudioEncoder: typeof AudioEncoder };
  const sup = async (K, c) => { try { return (await K.isConfigSupported(c)).supported; } catch (e) { return 'err'; } };
  if (typeof VideoDecoder !== 'undefined') for (const [k, codec] of [['dec_h264', 'avc1.64001f'], ['dec_hevc', 'hvc1.1.6.L93.B0'], ['dec_hevc10', 'hvc1.2.4.L93.B0'], ['dec_vp8', 'vp8'], ['dec_vp9', 'vp09.00.10.08']]) r[k] = await sup(VideoDecoder, { codec, codedWidth: 320, codedHeight: 240 });
  if (typeof VideoEncoder !== 'undefined') r.enc_h264 = await sup(VideoEncoder, { codec: 'avc1.640028', width: 320, height: 240 });
  if (typeof AudioEncoder !== 'undefined') r.enc_aac = await sup(AudioEncoder, { codec: 'mp4a.40.2', sampleRate: 44100, numberOfChannels: 2 });
  if (typeof AudioDecoder !== 'undefined') { r.dec_aac = await sup(AudioDecoder, { codec: 'mp4a.40.2', sampleRate: 44100, numberOfChannels: 2 }); r.dec_opus = await sup(AudioDecoder, { codec: 'opus', sampleRate: 48000, numberOfChannels: 2 }); }
  return r; })));
await b.close();
