---
draft: false
intro: "An iPhone clip or a Mac screen recording saved as MOV often won't play on Windows, in a web form or on a TV. Choose your MOV files and Convy turns them into MP4 with H.264 video and AAC sound, on this device. Title and artist stay; the location is removed."
metaHook: "H.264 video and AAC sound that play nearly anywhere, location removed"
steps:
  - "Choose your MOV clips or screen recordings, or drop them on the page."
  - "MP4 is already selected as the target."
  - "Press Convert, then save each MP4."
limits:
  - "On the browser route, outputs above 50 MB are written to this device's storage instead of memory."
  - "On the FFmpeg route a file is refused before it starts if the estimated output is above 1 GB (500 MB on iPhone and iPad), and a conversion is stopped after 120 seconds plus 2 seconds per input MB."
  - "The FFmpeg fallback downloads once, about 10 MB, and is kept on this device; the browser route needs no download."
faq:
  - q: "Is the GPS location removed from my iPhone video?"
    a: "In our tests, yes. A MOV carrying a QuickTime location and a camera make came out without either, in Chromium, Firefox and WebKit and on both conversion routes. The test file was a short synthetic clip, not a real iPhone recording, so read this as how the converter behaves, not as a check of every phone model."
  - q: "Why does the MP4 show today's date instead of the day I filmed it?"
    a: "When the browser's own encoder does the conversion, it writes the moment of conversion as the creation date and the source date is lost. On the FFmpeg route, which Firefox always uses, no date is written at all. If the filming date matters, keep the original MOV."
  - q: "Will my HEVC (H.265) iPhone video convert?"
    a: "Yes. HEVC is decoded at 8 and 10 bits and comes out as 8-bit H.264. In the Chromium and Firefox builds we tested, HEVC went through FFmpeg; WebKit decoded it itself. Real iPhone HDR footage (HLG, Dolby Vision) was not tested, so we can't say how its colours come out."
  - q: "Is the quality lower than the original?"
    a: "The video is always encoded again, which is lossy. The FFmpeg route writes H.264 at CRF 23 with AAC sound at 160 kbps; the browser route uses a medium quality preset. There is no quality setting in the interface. Keep the MOV for editing and use the MP4 for sharing."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0, extra.1, extra.2]
---
Convy re-encodes the video; it never just copies the streams into a new box. The result is always H.264 video with AAC sound, the pairing that players, editors and websites accept most readily. Re-encoding is lossy, so the MP4 is a new copy, not the original bits.

Which encoder does the work depends on the browser and on the file. Convy first checks whether the browser itself can decode the clip and encode H.264 and AAC at that size. If it can, the browser's own video tools (WebCodecs, through Mediabunny) do the job and nothing extra is downloaded. If not, the FFmpeg engine takes over. Firefox always takes the FFmpeg route, because its WebCodecs has no AAC encoder. Clips below 720 lines that carry no colour tag go to FFmpeg in every browser, so their colours come out as in the source.

HEVC (H.265), which recent iPhones record, is decoded too, at 8 and 10 bits; 10-bit video comes out as 8-bit H.264. In our tests the Chromium and Firefox builds handled HEVC with FFmpeg, while WebKit used its own decoder.

On metadata, title and artist are kept. The location and the camera make are dropped on both routes. The recording date does not survive either: the browser route writes the time of conversion, the FFmpeg route writes no date. We measured all of this with synthetic clips of one to two seconds, not with a real iPhone video. HDR footage (HLG, Dolby Vision) and Google Chrome with hardware HEVC were not tested.
