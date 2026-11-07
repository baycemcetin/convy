---
draft: false
intro: "HEIC is what an iPhone saves by default, and plenty of programs and web forms still cannot open it. Choose your HEIC photos and Convy turns them into JPG on this device. Camera details and the GPS location are left out of the copy; the color profile stays."
metaHook: "location and camera data removed, color profile kept, upright in every viewer"
steps:
  - "Choose your HEIC photos, or drop them on the page."
  - "JPG is already selected as the target."
  - "Press Convert, then save the JPG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad, rather than running the device out of memory."
  - "The first conversion downloads the image engine once, about 5 MB, and keeps it on this device for next time."
faq:
  - q: "Is the location removed from the JPG?"
    a: "Yes. The whole EXIF block, GPS position included, is left out of the JPG. We checked this with an HEIC that carried a location, separately in Chromium, Firefox and WebKit. The color profile is the one piece of embedded data that stays, because it decides how the colors look."
  - q: "Why is the JPG bigger than the HEIC?"
    a: "HEIC fits the same picture into fewer bytes. In our test a 39 KB HEIC of 1280 × 720 pixels became a 51 KB JPG at quality 85. The ratio changes from photo to photo, so read that as one example, not a promise."
  - q: "Can I choose a higher JPG quality?"
    a: "No. Quality is fixed at 85 and the interface has no setting for it. If you need every pixel exactly as decoded, convert the HEIC to PNG instead: it is lossless, at the cost of a much larger file."
  - q: "Will Chrome, Firefox and Safari give me the same file?"
    a: "For our sample, yes: the JPG was byte for byte identical in Chromium, Firefox and WebKit, because the same image engine runs in each of them. That was measured on one file, so it describes how the engine behaves rather than a check of every photo."
factRefs: [lossy, quality, metadata, path, extra.0, extra.1, extra.2, limits.0, download]
---
JPG is lossy, and Convy writes it at quality 85, a fixed value with no setting in the interface. That is one more round of compression on top of what HEIC already discarded, and it cannot be undone. Keep the HEIC if you may want the original pixels later.

The JPG does not carry the photo's EXIF block. We tested with an HEIC made on a Mac that held the camera make, a date and a GPS position; in Chromium, Firefox and WebKit the JPG came out without any of them. The ICC color profile stays, so a Display P3 photo keeps its wider colors instead of looking flat.

Rotation is written into the pixels before the EXIF block goes. Phones often store the pixels in one direction and keep a tag that says how to turn them. Convy turns them first, so the JPG stands upright even in viewers that never read the tag.

In our sample, a 1280 × 720 HEIC of 39 KB became a 51 KB JPG, and the bytes were identical in all three browsers. Your own photos will be far larger than that sample, since a phone camera records several times as many pixels.
