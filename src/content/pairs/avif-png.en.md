---
draft: false
intro: "Need an AVIF in a design tool, editor or slide deck that will not open it? Choose your AVIF images and Convy writes PNG copies on this device. Transparency is kept, nothing further is lost, and EXIF with any GPS position is removed. Expect larger files."
metaHook: "transparency kept and no further loss, for tools that refuse AVIF"
steps:
  - "Choose your AVIF images, or drop them on the page."
  - "PNG is already selected as the target."
  - "Press Convert, then save the PNG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "A PNG of a photo is usually much larger than its source; in our JPG test, 1.2 MB became 11.8 MB."
faq:
  - q: "Does the transparent background stay transparent?"
    a: "Yes. PNG has an alpha channel, so clear and half-clear pixels keep their transparency; we checked this in the PNG output of our self-test. A cut-out AVIF stays a cut-out and can be placed on a background of any color."
  - q: "Is any quality lost?"
    a: "Not in this step. PNG is lossless and has no quality setting, so the PNG holds exactly the pixels Convy decoded from the AVIF. Whatever the AVIF lost when it was first saved stays lost; the PNG simply adds nothing on top."
  - q: "How big will the PNG be?"
    a: "Usually much bigger than the original, because PNG stores every pixel without lossy compression. We have no AVIF measurement yet; in our JPG test, a 12-megapixel photo went from 1.2 MB to 11.8 MB. Convert one file first to see your own ratio."
  - q: "Are camera details and location removed?"
    a: "Yes, the EXIF block is removed, GPS position included. We confirmed it by converting a test image with GPS data to AVIF and then to PNG. The ICC color profile stays in the PNG, and a rotation tag is applied to the pixels before it goes."
factRefs: [lossy, quality, transparency, metadata, path, extra.0, extra.1, limits.0]
---
PNG keeps the two things a JPG would throw away: transparency and the exact pixels. That makes it the safer target when the AVIF is a graphic you still plan to work with.

A cut-out on a clear background stays clear. Every transparent and half-transparent pixel keeps its alpha in the PNG, so logos, stickers and product shots can sit on a colored page without a white box around them.

PNG has no quality setting, and Convy adds none. The pixels decoded from the AVIF are written as they are, so this step adds no loss. The cost is size: PNG does not compress photographs well, and a converted photo is usually much bigger than its source. Try a single file before a whole folder.

Metadata is handled as for every image target. EXIF, including any GPS position, is removed, the ICC color profile is kept, and an orientation tag is turned into real rotation first. One engine runs in every browser, with no browser-specific branch.
