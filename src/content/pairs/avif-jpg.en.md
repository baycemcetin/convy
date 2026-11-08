---
draft: false
intro: "AVIF keeps images small, but many photo apps, editors and websites still refuse it. Choose your AVIF images and Convy turns them into JPG on this device, a format nearly every app and form accepts. Transparent areas become white, and EXIF with any GPS position is removed."
metaHook: "for apps and sites that refuse AVIF; transparent areas turn white"
steps:
  - "Choose your AVIF images, or drop them on the page."
  - "JPG is already selected as the target."
  - "Press Convert, then save the JPG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "The first conversion downloads the image engine once, about 5 MB, and keeps it on this device."
faq:
  - q: "Why does a transparent AVIF get a white background?"
    a: "JPG has no channel for transparency. Before the file is written, Convy sets every clear or partly clear pixel on white, and we confirmed that result with a transparent test image. If the background has to stay see-through, pick PNG as the target."
  - q: "Will the JPG look worse than the AVIF?"
    a: "It can lose a little detail. JPG is lossy, and Convy writes it at quality 85, a fixed value with no setting. If the AVIF was saved lossy as well, the picture is compressed a second time and fine detail may soften. Keep the AVIF as your original."
  - q: "Is the location removed from my picture?"
    a: "Yes. We took a test image carrying a GPS position, converted it to AVIF and then to JPG, and the EXIF block, GPS included, was gone. The ICC color profile stays. This was checked with a test file, not with an AVIF from a real camera."
  - q: "Will a rotated AVIF come out upright?"
    a: "Yes, when the file records its rotation in an EXIF orientation tag. Convy turns the pixels first and removes the tag afterwards, so the JPG stands the right way even in viewers that ignore such tags. We checked this with a rotated test image."
factRefs: [lossy, quality, transparency, metadata, path, extra.0, extra.1, limits.0, download]
---
AVIF is the newer format and JPG the older one, so this conversion goes from more features to fewer. Three things change, each in a fixed way, with no option to adjust them.

Transparency is filled with white. An AVIF logo or cut-out on a clear background ends up inside a white rectangle, because JPG cannot store transparency. On a white page that goes unnoticed; on a colored one, the box shows.

The picture is compressed again. Convy writes the JPG at quality 85. If the AVIF was itself lossy, its artifacts stay and the JPG adds its own on top, so keep the AVIF as the copy you return to for later edits.

Metadata is cleared. In our test, EXIF with a GPS position did not survive the trip through AVIF to JPG. An orientation tag is applied to the pixels before it is dropped, and the ICC color profile is kept. Every browser runs the same ImageMagick engine for this pair, with no browser-specific code path.
