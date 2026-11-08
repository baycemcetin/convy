---
draft: false
intro: "Need a page of a PDF as a picture, to post it, paste it into a slide or send it in a chat? Choose your PDF and Convy renders every page as a JPG on this device. A document with several pages comes back as a ZIP of numbered images."
metaHook: "every page becomes a JPG; several pages come back as one ZIP"
steps:
  - "Choose your PDF files, or drop them on the page."
  - "JPG is already selected as the target."
  - "Press Convert, then save the JPG, or the ZIP for a document with several pages."
limits:
  - "Password-protected PDFs stop with a password message; opening them with the password is not offered."
  - "Each file has a time limit of 120 seconds plus 2 seconds per megabyte of PDF."
  - "Pages come out at about 144 dpi, with the longest side capped at 4 000 pixels; there is no resolution setting."
faq:
  - q: "Will the text be sharp enough to read?"
    a: "Each page is drawn at twice PDF.js's base scale, about 144 dpi, and the longest side is capped at 4 000 pixels. Whether small print reads well depends on the PDF's own type size; there is no setting for a higher resolution. If edges must stay free of compression, choose PNG."
  - q: "I chose a 20-page PDF. What do I get?"
    a: "One ZIP file holding 20 numbered JPG images, one for each page. A PDF with a single page gives a single JPG, with no ZIP around it. Every page of the document is converted; none is skipped."
  - q: "Is the PDF's metadata copied into the images?"
    a: "No. The images are made from the rendered page, so document details such as the title or author are not carried into the JPGs. The page background is white, as PDF.js draws it, so the images have no transparent areas."
  - q: "Why does the same PDF give a slightly different JPG in another browser?"
    a: "Each browser draws the page on its own canvas, and the browser's own encoder writes the JPG at quality 0.9. So pixels and file size can differ a little between Chromium, Firefox and WebKit, even for the same document."
factRefs: [lossy, quality, metadata, transparency, path, limits.0, limits.1, extra.0]
---
Convy hands the PDF to PDF.js, which draws each page onto a canvas at twice its base scale, about 144 dpi. The longest side of a page is capped at 4 000 pixels, so very large drawings or posters are scaled down to fit. Wherever the page has no fill of its own, the background is white.

The canvas is then saved as JPG at quality 0.9 by the browser's own encoder. That makes the JPG lossy, and it means the result can vary slightly between browsers, since the pixels each one draws are not identical.

A one-page PDF gives one JPG. Anything longer gives a ZIP with one numbered image per page, and no page is left out. The PDF's own metadata does not go into the images, and the text in them can no longer be selected or searched. A password-protected PDF stops with a message rather than asking for the password, and each file has a time limit of 120 seconds plus 2 seconds per megabyte.
