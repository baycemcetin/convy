---
draft: false
intro: "PNG keeps every pixel of an iPhone HEIC exactly as decoded, which matters if you plan to edit, crop or annotate the photo. Choose your HEIC files and Convy writes lossless PNG copies on this device. Location and camera data are left out; the color profile is kept."
metaHook: "lossless copies ready for editing, without location or camera data"
steps:
  - "Choose your HEIC files, or drop them on the page."
  - "PNG is already selected as the target."
  - "Press Convert, then save the PNG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad, so the device does not run out of memory."
  - "PNG copies of full-size photos take far more space than the HEIC originals; convert one file first before a whole album."
faq:
  - q: "PNG or JPG: which should I pick for an iPhone photo?"
    a: "Pick PNG if you will keep editing the photo or need it untouched, because it is lossless. Pick JPG for sharing, where a smaller file matters more. From the same 39 KB HEIC, our sample gave a 51 KB JPG and a 136 KB PNG."
  - q: "Does the PNG reveal where the photo was taken?"
    a: "No. The GPS position goes together with the rest of the EXIF block; we confirmed it with a location-tagged HEIC in all three browser engines. Only the ICC color profile is kept, so the colors look the way they did in the original."
  - q: "Is there a quality or compression setting?"
    a: "No. PNG is lossless, so there is no quality to choose: each pixel is stored exactly, and the interface has no other setting. If the file is too large to send, convert the HEIC to JPG, which is fixed at quality 85."
factRefs: [lossy, quality, metadata, path, extra.0, extra.1, extra.2, limits.0]
---
PNG is lossless, so the conversion adds no loss of its own: what you get is the HEIC as it was decoded, pixel for pixel. There is no quality setting because there is nothing to tune. That makes PNG the better target when the photo is a starting point rather than the final file, for example before retouching, cropping or adding text, where a JPG would lose a little more each time it is saved again.

The price is size. The same 1280 × 720 sample that became a 51 KB JPG became a 136 KB PNG, about three and a half times the 39 KB HEIC. Larger photos make larger files, so check the free space before converting a whole album.

Metadata is handled the same way in every browser we tried. EXIF, including the GPS position, is removed, and the ICC color profile stays inside the PNG. Rotation is written into the pixels first, so a photo taken in portrait opens in portrait. The PNG bytes were identical in Chromium, Firefox and WebKit.
