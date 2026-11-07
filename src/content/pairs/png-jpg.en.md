---
draft: false
intro: "Screenshots and exported graphics usually come out as PNG, which can be heavy to email or post. Choose your PNG files and Convy turns them into JPG on this device, at a fixed quality of 85. Transparent areas are filled with white, since JPG has no transparency."
metaHook: "smaller files for sharing, with transparent areas filled in white"
steps:
  - "Choose your PNG files, or drop them on the page."
  - "JPG is already selected as the target."
  - "Press Convert, then save the JPG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad, instead of exhausting the device's memory."
  - "The first conversion downloads the image engine once, about 5 MB, and keeps it on this device."
faq:
  - q: "What happens to a transparent background?"
    a: "It turns white. JPG cannot store transparency, so every fully or partly transparent pixel is laid over white before the JPG is written; we confirmed this with a transparent test image. If the background has to stay see-through, PNG or WebP can hold it and JPG cannot."
  - q: "Will text in a screenshot stay sharp?"
    a: "Mostly, but not perfectly. JPG is lossy, and Convy writes it at quality 85 with no setting to raise it. Sharp edges such as small type or thin lines can pick up faint smudges, so for screenshots someone will read closely, keeping the PNG is the better choice."
  - q: "Does the conversion strip hidden data from the PNG?"
    a: "It is built to: metadata in a PNG, such as eXIf or XMP chunks, goes through the same removal step as in other images. That path has not been tested with a PNG that actually carries such data, so if it matters, check the JPG in a metadata viewer."
  - q: "How much smaller will the JPG be?"
    a: "It depends on the image. Our 96 KB sample PNG became a 51 KB JPG, a little over half the size, and the result was the same in Chromium, Firefox and WebKit. Convert one file and compare the sizes before you do a whole batch."
factRefs: [lossy, quality, transparency, metadata, path, extra.1, limits.0]
---
JPG has no transparency, so something has to go behind the see-through parts of a PNG. Convy puts white there. A logo on a transparent background becomes a logo on a white rectangle, and a soft shadow fades into white rather than into whatever page the image is later placed on. If the transparency matters, keep the PNG.

The second change is loss. PNG stores pixels exactly; JPG at quality 85 gives up some detail to make the file smaller. Photographs hide this well. Flat colors, thin lines and small text are where it shows, as faint smudges along the edges, so a screenshot full of text may look a little softer than the original.

PNG files can hold metadata too, in eXIf and XMP chunks. They pass through the same removal step as other images, but this has not been tested with a PNG that carries such data. The ICC color profile is kept.

The result does not depend on the browser. Our 96 453-byte sample PNG gave the same 51 298-byte JPG in Chromium, Firefox and WebKit.
