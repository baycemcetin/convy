---
draft: false
intro: "PNG keeps what makes many web images useful: a transparent background and exact pixels. Choose your WebP files and Convy turns them into PNG on this device, ready for editors and slide tools that refuse WebP. An animated WebP gives its first frame as a still PNG."
metaHook: "transparency kept, no further loss, for tools that will not open WebP"
steps:
  - "Choose your WebP images, or drop them on the page."
  - "PNG is already selected as the target."
  - "Press Convert, then save the PNG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "The first conversion downloads the image engine once, about 5 MB, and keeps it on this device for next time."
faq:
  - q: "Will the transparent background survive?"
    a: "Yes. PNG stores transparency, and Convy keeps it: fully and partly transparent pixels come through as they were. That is the main reason to choose PNG over JPG for logos, icons and cut-out images saved from the web."
  - q: "Why is the PNG larger than the WebP?"
    a: "WebP often packs an image into fewer bytes, sometimes by dropping detail. PNG keeps every pixel exactly, so the same picture needs more space, and there is no setting to shrink it. If size matters more than exact pixels and you need no transparency, convert to JPG."
  - q: "What happens to an animated WebP?"
    a: "It becomes one still PNG built from the first frame. The remaining frames are never read, because the output here is a single image. Keep the original WebP if you still need the animation, for example for a chat or a web page."
factRefs: [lossy, quality, transparency, animation, metadata, path, extra.0, extra.1, download]
---
This is the conversion to pick when a WebP has a transparent background. PNG keeps the transparency: a logo, icon or cut-out product saved from a website stays see-through and can be placed on any color in a slide, a document or a design file. We checked this with a transparent test image.

PNG is lossless, so the conversion itself costs nothing in quality, and there is no setting to pick. It cannot undo the compression of a lossy WebP; those pixels are copied as they are, and any softness in the original stays. The file usually grows, sometimes a lot, because PNG does not throw detail away to save space.

An animated WebP becomes a single still image. Only the first frame is read and written; the motion has no place to go in a PNG.

Any EXIF data inside the WebP, location included, is removed. The ICC color profile stays, and if the image carried an orientation tag, the pixels are turned before the tag goes. Every browser runs the same engine, so there is no separate path for Safari or Firefox.
