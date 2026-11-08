---
draft: false
intro: "iPhone voice memos and iTunes Store songs come as M4A, which some car stereos, older players and web forms still won't take. Choose your M4A files and Convy turns them into MP3 on this device. Title, artist and album come along; the cover art doesn't."
metaHook: "title, artist and album carried over as ID3 tags; cover art left out"
steps:
  - "Choose your M4A files, or drop them on the page."
  - "MP3 is already selected as the target."
  - "Press Convert, then save the MP3s."
limits:
  - "Convy estimates the MP3's size before it starts and refuses the file above 1 GB (500 MB on iPhone and iPad), roughly 11.7 hours of audio at 190 kbps."
  - "A conversion that runs longer than 120 seconds plus 2 seconds per MB of the M4A is stopped."
  - "The audio and video engine downloads on the first conversion, about 10 MB, and is kept on this device."
faq:
  - q: "Why is the album art missing?"
    a: "Cover art is not carried into the MP3; only the audio stream is converted. In our tagged test file the title, artist and album came through, the picture didn't. You can add the artwork again in a music app or tag editor after converting."
  - q: "Will the MP3 sound worse than the M4A?"
    a: "It cannot sound better, because the AAC is decoded and encoded again as MP3, a second lossy pass. The encoder averages about 190 kbps and the interface has no quality setting. Keep the M4A as your original and use the MP3 where M4A isn't accepted."
  - q: "Do iPhone voice memos convert?"
    a: "Voice memos are saved as M4A with AAC audio, the same kind of file we tested in Chromium, Firefox and WebKit. Our test file was made on a computer, not recorded on an iPhone, so treat it as a close match rather than a test of the recording app itself."
  - q: "Why is something downloaded the first time?"
    a: "MP3 is always made by the FFmpeg engine, in every browser; Convy does not use the browser's built-in audio tools for MP3. The engine is about 10 MB, downloads once and then stays on this device, so later conversions start without fetching it again."
factRefs: [lossy, quality, metadata, path, download, limits.0, limits.1, limits.2, extra.0]
---
An M4A usually holds AAC, which is lossy already. Converting it to MP3 decodes that AAC and compresses the sound a second time, with LAME at variable bit rate, quality 2, around 190 kbps on average. A second lossy pass cannot restore what the first one removed, and it is not reversible, so keep the M4A if you have it.

The tags come with it. We converted an M4A tagged with a title, an artist, an album and a cover picture. In Chromium, Firefox and WebKit the MP3 kept the title, artist and album as ID3 tags, but not the cover. The MP3 also picks up the source's container brand tags and an encoder tag.

The three browsers produced MP3s of the same size, 10 845 bytes, about two hundredths of a second longer than the source. All of them used the same FFmpeg engine, which each browser downloads the first time.

We tested AAC only. M4A files with Apple Lossless (ALAC) inside were not part of the test.
