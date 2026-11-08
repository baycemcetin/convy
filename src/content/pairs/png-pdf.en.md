---
draft: false
intro: "When a form or an office asks for a PDF, a PNG screenshot or scan will not do. Choose your PNG files and Convy places each one on its own PDF page, on this device. The pixels go in losslessly and transparent areas stay transparent."
metaHook: "lossless pixels, transparency kept, one image per page"
steps:
  - "Choose your PNG images, or drop them on the page."
  - "PDF is already selected as the target."
  - "Press Convert, then save one PDF for each image."
limits:
  - "One PNG makes one single-page PDF; several images are not combined into one document."
  - "16-bit PNGs are reduced to 8 bits per channel in the PDF."
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
faq:
  - q: "Can I put several PNGs into one PDF?"
    a: "Not in Convy. Every PNG turns into a PDF of its own with a single page, so ten images mean ten files. If a form insists on one file, join the PDFs afterwards in a PDF app of your choice."
  - q: "Is the PNG blurred or compressed inside the PDF?"
    a: "No. The pixels are stored with lossless Flate compression, and when we unpacked the image from the finished PDF it matched the source pixel for pixel. The one change is depth: a 16-bit PNG is reduced to 8 bits per channel."
  - q: "What happens to a transparent background?"
    a: "It stays transparent. The alpha channel goes into the PDF as a soft mask, so the page shows through the clear areas; rendered with PDF.js in our test, they appeared over the white page. A logo keeps its own outline instead of sitting in a box."
  - q: "What size is the page?"
    a: "It follows the image rather than a paper size: Convy sets the page at 150 pixels per inch. A 1920 × 1080 screenshot gives a page of about 33 × 18 cm. To print on A4 or Letter, use the fit-to-page option in the print dialog."
factRefs: [lossy, quality, transparency, metadata, path, limits.0, extra.0, extra.1]
---
Inside the PDF, the PNG keeps every pixel. Convy writes them with lossless Flate compression, and when we unpacked the image from the finished PDF it matched the source exactly. The one reduction is depth: a 16-bit PNG becomes 8 bits per channel.

Transparency is kept as a soft mask. A logo or signature on a clear background lets the page show through, and when we rendered the result with PDF.js the clear areas showed the white page beneath.

The PDF ends up close to the PNG's own size: our 96 453-byte sample became a 105 947-byte PDF. Each image gets its own page, sized from its pixels at 150 dpi, so a 1920 × 1080 screenshot makes a page of roughly 33 × 18 cm. A side longer than the PDF limit of 14 400 points is scaled down to it.

Metadata is removed, the ICC color profile becomes the PDF's color space, and an orientation tag is applied before it goes. Chromium, Firefox and WebKit all wrote the same PDF, down to the byte.
