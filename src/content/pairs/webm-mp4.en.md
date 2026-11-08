---
draft: false
intro: "Screen recorders and browser tools often save video as WebM, which iPhone apps, video editors and messaging apps tend to refuse. Choose your WebM files and Convy turns each one into an MP4 with H.264 video and AAC sound, on this device."
metaHook: "VP9 or VP8 video becomes H.264 with AAC sound, for places that want an MP4"
steps:
  - "Choose your WebM recordings, or drop them on the page."
  - "MP4 is already selected as the target."
  - "Press Convert, then save the MP4 files."
limits:
  - "Outputs above 50 MB are built in this device's storage rather than in memory when the browser route is used."
  - "On the FFmpeg route, a recording whose estimated output passes 1 GB (500 MB on iPhone and iPad) is not started, and a running conversion is cut off after 120 seconds plus 2 seconds per MB of the WebM."
  - "The FFmpeg route downloads its engine once, about 10 MB, and keeps it; the browser route asks for no download."
faq:
  - q: "Why does Firefox download an engine first?"
    a: "Firefox's built-in video tools cannot encode the AAC sound an MP4 needs, so Convy uses the FFmpeg engine there for every WebM. It downloads once, about 10 MB, and stays on this device. Chromium and WebKit can use their own tools for tagged or 720p and larger video, with nothing to download."
  - q: "Do the colours change?"
    a: "Small WebM recordings below 720 lines that carry no colour tag go to FFmpeg in every browser. On the browser route such files came out with visibly shifted colours, red drifting toward orange; through FFmpeg they match the source. Tagged video and 720p or larger stay on the browser route where it is available."
  - q: "Is the screen recording's quality kept?"
    a: "Some detail is lost, because the picture is encoded again. FFmpeg writes H.264 at CRF 23 and the sound as 160 kbps AAC; the browser route uses a medium bit rate preset. The interface has no quality control. Keep the WebM if you might need the original recording again."
  - q: "Do the title and other details carry over?"
    a: "Title and artist are kept, location and camera make are dropped, and the browser route writes the moment of conversion in place of the creation date while the FFmpeg route writes none. We measured this with MOV files. Our WebM samples had no tags, so for WebM it follows from the shared conversion step, not from a direct test."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0, extra.1]
---
WebM and MP4 hold different codecs, so nothing can simply be copied across. The VP9 or VP8 video is decoded and encoded again as H.264, and the Opus or Vorbis audio becomes AAC. The MP4 plays in the places a WebM doesn't, but it is a lossy new copy, not the original bits.

The route through the converter depends on your browser. Firefox uses the FFmpeg engine for every WebM, since its built-in video tools (WebCodecs) cannot encode AAC. Chromium and WebKit use their own WebCodecs through Mediabunny when the video carries a colour tag or is 720p or larger, and that route downloads nothing. A small untagged recording, say from a webcam or an older tool, goes to FFmpeg in every browser so its colours stay true to the source.

We converted a VP9 and a VP8 test clip in Chromium, Firefox and WebKit. All three gave H.264 with AAC, and the length stayed within two hundredths of a second of the source. The clips were short and synthetic, and a WebM with AV1 video inside was not part of the test.
