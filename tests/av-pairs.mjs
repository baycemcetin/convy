// AV pairs: mp4/wav/m4a->mp3, mov/webm->mp4, mp4->gif in a real browser. Per run: engine path (Mediabunny vs ffmpeg fallback,
// from requests to the ffmpeg core), output checked with ffprobe (codec, duration +-0.1 s, audio track, tags), console errors.
// Usage (serve dist on :4321 after `npm run build`; run browsers one after another, never in parallel):
//   OUT=<dir> node tests/av-pairs.mjs [chromium|firefox|webkit] ; ONLY=<substring> to filter. Fixtures: tests/make-av-fixtures.sh
import { launch, open, run } from './qa2-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
const name = process.argv[2] || 'chromium', OUT = process.env.OUT || 'test-results/av-pairs'; mkdirSync(OUT, { recursive: true });
// [fixture, target, expect video codec|null, expect audio codec|null]
const cases = [
  ['sample.mp4', 'MP3', null, 'mp3'], ['sample.wav', 'MP3', null, 'mp3'], ['av-tagged.wav', 'MP3', null, 'mp3'], ['av-tagged.m4a', 'MP3', null, 'mp3'],
  ['sample.mp4', 'GIF', 'gif', null],
  ['av-h264.mov', 'MP4', 'h264', 'aac'], ['av-gps.mov', 'MP4', 'h264', 'aac'], ['av-h264-720p.mov', 'MP4', 'h264', 'aac'], ['av-h264-sd-tagged.mov', 'MP4', 'h264', 'aac'], ['av-hevc.mov', 'MP4', 'h264', 'aac'], ['av-hevc10.mov', 'MP4', 'h264', 'aac'],
  ['av-vp9.webm', 'MP4', 'h264', 'aac'], ['av-vp8.webm', 'MP4', 'h264', 'aac'],
].filter((c) => !process.env.ONLY || c.slice(0, 2).join(' ').includes(process.env.ONLY));
const probe = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', f]));
const dur = (j) => Number(j.format.duration);
const b = await launch(name); const res = [];
for (const [file, to, ev, ea] of cases) {
  const ctx = await b.newContext({ acceptDownloads: true }); // fresh context = empty engine cache, so an ffmpeg download is visible
  const reqs = []; ctx.on('request', (r) => /ffmpeg-core/.test(r.url()) && reqs.push(r.url().split('/').pop()));
  const r = { file, to }; let p = { errs: [] };
  try {
    for (let t = 1; ; t++) try { p = await open(ctx); break; } catch (e) { if (t >= 2) throw e; r.openRetries = t; } // page-ready timeout (30 s) seen 3x in ~60 opens under load; a retry is recorded, not hidden
    const s = await run(p, file, to, { save: true, timeout: 280000 }); const buf = s.buf; delete s.buf; Object.assign(r, s);
    r.path = reqs.length ? 'ffmpeg' : 'mediabunny'; r.ffReqs = [...new Set(reqs)];
    const inp = probe(`tests/fixtures/${file}`);
    r.in = { dur: dur(inp), v: inp.streams.filter((x) => x.codec_type === 'video').map((x) => `${x.codec_name}/${x.pix_fmt}`), a: inp.streams.filter((x) => x.codec_type === 'audio').map((x) => x.codec_name), tags: inp.format.tags || {} };
    if (buf) {
      const f = `${OUT}/${name}-${file}.${to.toLowerCase()}`; writeFileSync(f, buf); r.outFile = f;
      const o = probe(f); const vs = o.streams.filter((x) => x.codec_type === 'video' && !x.disposition?.attached_pic), as = o.streams.filter((x) => x.codec_type === 'audio');
      r.out = { bytes: buf.length, dur: dur(o), dDur: +(dur(o) - r.in.dur).toFixed(3), v: vs.map((x) => `${x.codec_name}/${x.pix_fmt}/${x.width}x${x.height}`), a: as.map((x) => `${x.codec_name}/${x.channels}ch`), cover: o.streams.some((x) => x.disposition?.attached_pic), tags: o.format.tags || {}, brand: o.format.format_name };
      if (to === 'MP4') { // colour check in RGB, matrix as a player picks it: tagged value, else bt709 for height >= 720, bt470bg below
        const mx = (st) => (['bt709', 'bt470bg', 'smpte170m'].includes(st.color_space) ? st.color_space : st.height >= 720 ? 'bt709' : 'bt470bg');
        const iv = inp.streams.find((x) => x.codec_type === 'video'), ov = o.streams.find((x) => x.codec_type === 'video');
        const m = spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-i', `tests/fixtures/${file}`, '-lavfi', `[0:v]scale=320:240:in_color_matrix=${mx(ov)}:flags=bicubic,format=rgb24[a];[1:v]scale=320:240:in_color_matrix=${mx(iv)}:flags=bicubic,format=rgb24[b];[a][b]psnr`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
        r.psnr = Number(/average:([\d.]+)/.exec(m)?.[1]); r.color = r.psnr >= 30; r.outColor = { space: ov.color_space || null, range: ov.color_range || null, profile: ov.profile };
      }
      if (to === 'MP4' && r.path === 'mediabunny' && !inp.streams.find((x) => x.codec_type === 'video').color_space && inp.streams.find((x) => x.codec_type === 'video').height < 720) r.untaggedSdOnMediabunny = true; // colour-shift guard, media.worker.ts probe
      r.ok = !!vs.length === !!ev && (!ev || vs[0].codec_name === ev) && !!as.length === !!ea && (!ea || as[0].codec_name === ea) && Math.abs(r.out.dDur) <= 0.1 && !r.untaggedSdOnMediabunny && r.color !== false;
    } else r.ok = false;
  } catch (e) { r.exc = String(e).slice(0, 200); r.ok = false; }
  r.errs = p.errs; res.push(r);
  console.error(name, file, '->', to, r.ok ? 'OK' : 'FAIL', r.path, r.psnr ? `psnr=${r.psnr}${r.color ? '' : ' COLOUR-SHIFT'}` : '', r.out ? `dDur=${r.out.dDur}` : '', r.exc || (r.ok ? '' : r.say?.replace(/\n/g, ' | ')), r.ms + 'ms', r.errs.length ? 'errs=' + r.errs.length : '');
  await ctx.close();
}
writeFileSync(`${OUT}/av-${name}.json`, JSON.stringify(res, null, 1)); await b.close();
process.exit(res.every((r) => r.ok) ? 0 : 1);
