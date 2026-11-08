---
draft: false
intro: "A finished recording, a voice take from an audio interface or an exported mix is usually a WAV: complete, but heavy to send. Choose your WAV files and Convy encodes each one as an MP3 on this device, at a variable bit rate averaging about 190 kbps."
metaHook: "an MP3 averaging 190 kbps, with title and artist carried as ID3 tags"
steps:
  - "Choose your WAV recordings, or drop them on the page."
  - "MP3 is already selected as the target."
  - "Press Convert, then save the MP3 files."
limits:
  - "The output is estimated before starting; above 1 GB (500 MB on iPhone and iPad) the file is refused, which at 190 kbps is about 11.7 hours of audio."
  - "Each conversion is stopped after 120 seconds plus 2 seconds per MB of the WAV."
  - "The first conversion downloads the audio and video engine once, about 10 MB, and keeps it on this device."
faq:
  - q: "Can I pick 320 kbps?"
    a: "No. The bit rate is not a setting: LAME's variable mode at quality 2 decides it moment by moment and averages about 190 kbps. There is no control for it in the interface, and no constant bit rate option either."
  - q: "Are the title and artist kept?"
    a: "Yes, when the WAV has them. In our test a WAV tagged with a title and an artist produced an MP3 carrying both as ID3 tags, in Chromium, Firefox and WebKit. Many WAV files have no tags at all; then there is nothing to copy, and you can add tags in a music app afterwards."
  - q: "Does the length change?"
    a: "Not in our test: the sample WAV and its MP3 had the same duration in all three browsers. Our test files were short. With long recordings the MP3 encoder's padding could add a fraction of a second, which we have not measured."
  - q: "Can I convert without an internet connection?"
    a: "Yes, once the audio and video engine is saved on this device. Conversions keep working offline while this page stays open. If you close it, open the Convy home page instead: unlike this page, it is stored in your browser after your first visit and opens without a connection."
factRefs: [lossy, quality, metadata, path, download, offline, limits.0, limits.1, limits.2, extra.0]
---
WAV keeps every sample; MP3 discards what the ear is least likely to notice. This step is where the loss happens, and it happens once. Convy encodes with LAME at variable bit rate, quality setting 2, which lands around 190 kbps on average: simple passages get fewer bits, busy ones more. The setting is fixed, and the interface has no quality control.

Because a WAV is usually uncompressed, this is a single lossy step rather than a copy of a copy. Keep the WAV as your master if you will edit, mix or export the sound again.

Tags travel. In a WAV that carried a title and an artist, both showed up in the MP3 as ID3 tags, in Chromium, Firefox and WebKit alike. The MP3 also receives an encoder tag. Cover art, where a file has it, is not carried.

Every browser uses the same engine for this job, FFmpeg in WebAssembly; the browser's built-in audio tools are not involved. Our sample WAV became a 6 755-byte MP3 of unchanged length in all three browsers.
