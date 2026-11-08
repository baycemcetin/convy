---
draft: false
intro: "Turning PNG graphics into WebP is a common step before putting them on a website. Choose your PNG files and Convy writes WebP copies on this device, transparency included. Note that the WebP is always lossy, at quality 85; there is no lossless option."
metaHook: "transparency kept; always lossy at quality 85, no lossless option"
steps:
  - "Choose your PNG files, or drop them on the page."
  - "WebP is already selected as the target."
  - "Press Convert, then save the WebP files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "WebP output is always lossy (quality 85); for pixel-exact copies, keep the PNG."
faq:
  - q: "Will the transparent background survive?"
    a: "Yes. WebP can carry transparency, and Convy writes the alpha channel; we checked it in our self-test output. A logo or icon with a clear background stays clear, so it can sit on any color on your page."
  - q: "Can I get a lossless WebP?"
    a: "Not with Convy. Every WebP it writes uses the lossy VP8 method at quality 85, even when the source is a PNG, and there is no switch for lossless. For screenshots or pixel art where every edge must stay crisp, keep the PNG."
  - q: "Will the WebP be smaller than the PNG?"
    a: "We have not measured PNG to WebP sizes, so there is no number here. The result depends on the picture: photographs and flat graphics compress differently. Convert one file and compare the two sizes before doing a whole folder."
  - q: "Is metadata in the PNG removed?"
    a: "Yes. eXIf, XMP and text comments are removed, and an orientation tag is applied first. We tested this with a PNG that carries all three, including a GPS location. The ICC color profile is kept."
factRefs: [lossy, quality, transparency, metadata, path, extra.1, limits.0]
---
Two questions decide how a PNG fares as WebP: what happens to transparency, and what happens to detail.

Transparency survives. WebP has an alpha channel and Convy writes it, so icons, logos and cut-outs keep their clear background. That is the main difference from converting the same PNG to JPG, where the clear areas are filled with white.

Detail is compressed. Convy writes WebP only in its lossy form, VP8 at quality 85, even when the source is a lossless PNG. Sharp text, thin lines and pixel art may pick up soft edges. There is no lossless WebP option, so keep the PNG if exact pixels matter.

Size is not measured for this pair. Whether the file shrinks, and by how much, depends on the picture, so convert one file and compare before you do a batch.

Metadata in a PNG, stored in eXIf or XMP chunks, is removed, as in other images; we tested it with a PNG that carries such data. The ICC color profile is kept. One engine runs in every browser.
