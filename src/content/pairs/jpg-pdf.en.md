---
draft: false
intro: "Offices and online forms often ask for a PDF when all you have is a photo or a scan saved as JPG. Choose your JPG files and Convy wraps each one in a single-page PDF on this device. The JPEG data go in untouched, so there is no quality loss."
metaHook: "the JPEG goes in untouched, one page per photo, no quality loss"
steps:
  - "Choose your JPG photos or scans, or drop them on the page."
  - "PDF is already selected as the target."
  - "Press Convert, then save one PDF per image."
limits:
  - "One JPG makes one single-page PDF; several photos are not merged into one document."
  - "12-bit, lossless and arithmetic-coded JPEGs are not copied as they are; they go through the image engine and are stored losslessly instead."
  - "A standard JPG needs no engine download. Only the rare types above fetch the image engine first, about 5 MB, kept for next time."
faq:
  - q: "Does the photo lose quality inside the PDF?"
    a: "No. The JPEG data are embedded without being decoded and compressed again, and the image bytes in the PDF match the source exactly. Rare JPEG types are the exception: 12-bit, lossless or arithmetic-coded files go through the image engine and are stored losslessly."
  - q: "Can I combine several photos into one PDF?"
    a: "No. Each JPG becomes its own single-page PDF, so choosing five photos gives you five PDFs. Merging them into one document is not offered; if a form wants a single file, a PDF editor can join them afterwards."
  - q: "Why is the page so large when I open or print it?"
    a: "The page is sized from the pixels at 150 dpi, not to a paper format. A 12-megapixel photo gives a page of about 69 × 52 cm. Choose the fit-to-page option in the print dialog and it fills an A4 or Letter sheet."
  - q: "Is the GPS location removed?"
    a: "Yes. EXIF with the GPS position, XMP, IPTC and comments are cut out of the embedded JPEG without touching the image data; we checked this in Chromium, Firefox and WebKit. The ICC color profile is kept as the PDF's color space."
factRefs: [lossy, quality, metadata, path, download, limits.0, extra.0, extra.1]
---
Convy does not re-compress the JPG when it builds the PDF. The JPEG data are copied into the file as they are, and when we compared the image bytes inside the PDF with the source, they were identical. The PDF is therefore about the size of the JPG: a 1 339-byte test image became a 1 651-byte PDF, the difference being the PDF structure around it.

Each JPG becomes one page. The page size follows the pixels at 150 dpi, so a 12-megapixel photo of 4080 × 3072 pixels gives a page of roughly 69 × 52 cm, not A4 or Letter. Every pixel is kept, and a print dialog can scale the page to the paper. A side longer than the PDF limit of 14 400 points is scaled down to that limit.

What gets cut is metadata: EXIF with any GPS position, XMP, IPTC, comments, and the extra images some cameras attach after the main one. Cutting them leaves the image data untouched. The color profile becomes the PDF's color space. A photo stored sideways with an orientation tag is turned by the page itself, so it opens upright without re-encoding. The same PDF came out byte for byte in Chromium, Firefox and WebKit.
