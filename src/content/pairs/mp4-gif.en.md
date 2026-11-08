---
draft: false
intro: "A short clip often has to play where video can't: a chat, an issue tracker, a slide or an email. Choose your MP4 files and Convy turns each into an animated GIF on this device, at 12 frames per second and 480 pixels wide, without sound."
metaHook: "an animated GIF at 12 fps and 480 px wide, with the sound removed"
steps:
  - "Choose a short MP4 clip, or drop it on the page."
  - "GIF is already selected as the target."
  - "Press Convert, then save the GIF."
limits:
  - "Before starting, Convy estimates the GIF at 3000 kbps and refuses a clip whose estimate passes 1 GB (500 MB on iPhone and iPad), which is about 44 minutes of video."
  - "A conversion is stopped after 120 seconds plus 2 seconds per MB of the input."
  - "The first conversion downloads the audio and video engine once, about 10 MB, and keeps it for next time."
faq:
  - q: "Can I change the frame rate or the size?"
    a: "No. Every GIF is made at 12 frames per second and 480 pixels wide; the height follows the clip's proportions, so a 16:9 video gives 480 × 270. The interface has no setting for either value."
  - q: "Where did the sound go?"
    a: "GIF is an image format and has no place for sound, so the audio track is left out during conversion. The picture plays silently. If the sound matters, share the MP4 itself instead of a GIF."
  - q: "Why does the GIF look grainy?"
    a: "GIF allows only 256 colours per frame. Convy builds a palette from the clip itself before converting, which helps, but gradients, skies and skin can still show bands or dots. Screen recordings and flat graphics usually fare better than camera footage."
  - q: "Is the GIF the same in every browser?"
    a: "For our sample, yes: Chromium, Firefox and WebKit produced the identical GIF, byte for byte, because all three run the same FFmpeg engine; the browser's own video tools are not used for GIF. We tested Playwright's browser builds, not Google Chrome or an iPhone."
factRefs: [lossy, quality, animation, path, download, limits.0, limits.1, limits.2, extra.0]
---
The whole clip becomes one animated GIF; Convy does not trim it or pick a section. The settings are fixed, with no control for them in the interface: 12 frames per second, 480 pixels wide, and a height that follows the clip's proportions. Scaling uses the Lanczos filter. A 640 × 360 test video came out as a 480 × 270 GIF.

GIF stores at most 256 colours per frame. Convy first builds a palette from the clip itself and then maps the frames to it, which keeps the colours as close to the source as 256 allow. Smooth gradients, skies and skin tones can still look banded or grainy.

The sound is removed, because a GIF cannot hold audio. If the clip needs its sound, keep it as a video.

This conversion goes through the FFmpeg engine in every browser. Our sample MP4 became an 875 487-byte GIF, byte for byte the same in Chromium, Firefox and WebKit, and its length changed by a hundredth of a second. The engine downloads the first time, about 10 MB, and stays on this device.
