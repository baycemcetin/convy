---
draft: false
intro: "Sometimes the video is only a carrier: a recorded talk, a lecture, a song someone sent as a clip. Choose your MP4 files and Convy keeps the sound as an MP3, on this device. The picture is left out and only the audio track is encoded."
metaHook: "the sound track only, saved as a standard MP3 averaging about 190 kbps"
steps:
  - "Choose your MP4 videos, or drop them on the page."
  - "MP3 is already selected as the target."
  - "Press Convert, then save the MP3 files."
limits:
  - "Before starting, Convy estimates the output from the length and the bit rate; above 1 GB (500 MB on iPhone and iPad) the file is refused. At 190 kbps that is about 11.7 hours of audio."
  - "A conversion is stopped after 120 seconds plus 2 seconds for every MB of the input."
  - "The first conversion downloads the audio and video engine once, about 10 MB, and keeps it on this device for next time."
faq:
  - q: "Is the video kept anywhere in the MP3?"
    a: "No. The video track is set aside before the audio is encoded, so the MP3 holds sound only. A cover picture attached to the MP4 does not come through either. Keep the MP4 if you will need the picture again."
  - q: "Can I choose a higher bit rate?"
    a: "No. The encoder runs at one fixed variable-bit-rate setting that averages about 190 kbps, and the interface has no control for it. Quiet passages get fewer bits and dense ones more, so the exact rate differs from file to file."
  - q: "Will the song title and artist show up in my music player?"
    a: "Title, artist and album are copied into the MP3 as ID3 tags, which music players read. We checked this with tagged WAV and M4A files in Chromium, Firefox and WebKit. Album art is the exception: it is not carried over, so add it again in your player if you want it."
  - q: "Does it work in Safari?"
    a: "Our sample converted in WebKit, the engine behind Safari, as well as in Chromium and Firefox, and all three produced the same MP3. Audio output uses the same FFmpeg engine in every browser. We tested Playwright's browser builds, not Google Chrome and not an iPhone."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0, extra.1]
---
Only the audio track goes into the MP3. Convy drops the video stream before encoding, so what you get is the sound of the clip and nothing else. The audio is encoded with LAME in variable bit rate mode at quality 2, which averages around 190 kbps. There is no quality setting in the interface.

The sound inside an MP4 is usually compressed already, most often as AAC. Turning it into MP3 adds a second lossy step on top of the first, and that step cannot be undone. If you may want the original sound later, keep the MP4.

Title, artist and album are written into the MP3 as ID3 tags. We measured this with tagged WAV and M4A files rather than with an MP4, but one conversion step handles all three. Cover art does not come along. The file also gains an encoder tag and the container brand tags of the source.

Every browser takes the same route here: the audio and video engine, FFmpeg compiled to WebAssembly. Our sample MP4 became an 18 868-byte MP3 in Chromium, Firefox and WebKit, identical each time.
