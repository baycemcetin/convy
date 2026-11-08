---
draft: false
intro: "Websites and page-speed tools often ask for images in WebP. Choose your JPG photos and Convy re-encodes them as WebP on this device, at quality 85. Camera details and the GPS location are removed, and the color profile stays."
metaHook: "re-encoded at quality 85 for the web; GPS and camera details removed"
steps:
  - "Choose your JPG photos, or drop them on the page."
  - "WebP is already selected as the target."
  - "Press Convert, then save the WebP files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "Each JPG is compressed a second time; keep the original if you may need to edit it later."
faq:
  - q: "Will my WebP be smaller than the JPG?"
    a: "That depends on the photo, and we have not measured a JPG and its WebP side by side, so there is no ratio here. Our one data point: a 15-megapixel JPG became a 6.6 MB WebP. Convert one photo and compare the two sizes before doing all of them."
  - q: "Do I lose quality?"
    a: "A little. The JPG is already lossy; Convy decodes it and compresses it again as lossy WebP at quality 85, with no setting to change that. Each round of lossy compression costs some detail, so keep the JPG as your original."
  - q: "Is the GPS location removed?"
    a: "Yes. Our test JPG carried a camera make, a GPS position, XMP, IPTC data and a comment, and none of them reached the output. A photo stored sideways is turned upright first. The ICC color profile is the one thing kept."
  - q: "How long does it take?"
    a: "Expect several seconds for a large photo: a 15-megapixel JPG needed 7.0 to 8.2 seconds across our browser test runs. Speed depends on the device. Before the first file, the image engine, about 5 MB, downloads once and is then kept."
factRefs: [lossy, quality, metadata, path, extra.0, extra.1, extra.2, limits.0, download]
---
JPG to WebP is a lossy-to-lossy conversion. Convy decodes the JPG into pixels and compresses them again as WebP at quality 85, a fixed value. Nothing from the original compression is reused, so the WebP carries the JPG's artifacts plus its own. Keep the JPG as the archive copy.

Size and time are where a large photo shows. In our browser tests a 15-megapixel JPG took 7.0 to 8.2 seconds and produced a 6.6 MB WebP. Whether that is smaller than your JPG depends on how the JPG was saved, so compare one file before converting a batch.

Metadata is removed on the way. EXIF with the camera model, date and GPS position goes, as do XMP, IPTC and comments. An orientation tag is applied to the pixels first, so the WebP stands upright in any viewer. The ICC color profile is kept, and the same engine runs in every browser.
