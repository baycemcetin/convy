---
draft: false
intro: "PNG saves each rendered page without lossy compression, which suits pages of text, diagrams and slides. Choose your PDF and Convy draws every page as a PNG image on this device. Several pages come back as one ZIP, with an image for each page."
metaHook: "lossless page images for text and diagrams; several pages arrive as a ZIP"
steps:
  - "Choose your PDF files, or drop them on the page."
  - "PNG is already selected as the target."
  - "Press Convert, then save the PNG, or the ZIP when the document has several pages."
limits:
  - "Password-protected PDFs stop with a password message; there is no way to enter the password."
  - "Each file has a time limit of 120 seconds plus 2 seconds per megabyte of PDF."
faq:
  - q: "PNG or JPG for a PDF page?"
    a: "PNG when the page is mostly text, lines or flat color: it is lossless, so compression does not smear the edges. JPG, written at quality 0.9, is lossy, an option for pages that are mostly photographs. Both are drawn at the same scale, about 144 dpi."
  - q: "Why is the ZIP a different size in another browser?"
    a: "Each browser draws the page on its own canvas, so the pixels come out slightly different. Our sample PDF gave a ZIP of PNGs of 116 KB in Chromium, 105 KB in WebKit and 44 KB in Firefox. The engine is the same everywhere; the drawing is not."
  - q: "Does Convy download anything for PDFs?"
    a: "Once, yes: the PDF engine is about 0.5 MB and is saved for next time. Some PDFs also need extra font data, up to 3.4 MB in all, which is fetched only when a document calls for it."
  - q: "Can it open a password-protected PDF?"
    a: "No. A PDF that needs a password stops with a message saying so, and there is no field to type the password into. Remove the protection in a PDF app you trust, then convert the unlocked copy."
factRefs: [lossy, quality, metadata, transparency, path, limits.0, limits.1, extra.0, download]
---
PDF.js draws every page at twice its base scale, about 144 dpi, and Convy saves the result as PNG. Because PNG is lossless, the image is exactly what was drawn: thin lines, small type and flat color keep their edges, with no compression blocks around them. The longest side of a page is capped at 4 000 pixels.

The drawing is done by the browser's canvas, and that part is not identical everywhere. Converting the same sample PDF to PNG gave a 116 KB ZIP in Chromium, 105 KB in WebKit and 44 KB in Firefox. Expect small pixel differences between browsers.

Pages have a white background, so the PNGs contain no transparency even though the format could hold it. A single page gives a single PNG; a longer document gives a ZIP with one numbered image per page. Document details such as the title or author stay in the PDF and are not copied into the images.
