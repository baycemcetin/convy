---
draft: false
title: "How Convy Works: Engines, Limits, Offline | Convy"
h1: "How Convy works"
description: "Which engine converts which file, what is downloaded the first time, where the limits are, and how to check the network yourself."
---
Convy converts files with open-source engines that run inside your browser tab. Opening the page loads no engine. An engine downloads when you press Convert on a file that needs it, and the browser keeps it for next time. Below: which engine does what, where the limits are, and what still works without a connection.

<h2 id="engines">Engines</h2>

**Images: ImageMagick** (magick-wasm 0.0.46), about 5 MB to download. It reads and writes PNG, JPG, WebP, AVIF, GIF, BMP, TIFF, ICO and JPEG XL, and also reads HEIC and flattened PSD files. The same engine runs in every browser, with no browser-specific path.

**Images to PDF: Convy's own PDF writer**, part of the site's code. A JPG goes into the PDF as it is, without being compressed again; other images go in losslessly. One image becomes one page.

**Audio: ffmpeg** (ffmpeg.wasm 0.12.10, single-threaded), about 10 MB. Every audio result is made by ffmpeg, in every browser.

**Video: Mediabunny first, ffmpeg as the fallback.** For each file, Convy checks whether your browser can decode it and encode H.264 video with AAC audio itself, through WebCodecs. If it can, Mediabunny does the job; it is part of the site's code, so nothing extra downloads. If it can't, the job goes to ffmpeg. Video to GIF always uses ffmpeg.

**Documents: Pandoc** (pandoc-wasm 1.1.0, Pandoc 3.10), about 16 MB, the largest engine. It converts documents such as DOCX, ODT, EPUB, Markdown and HTML, and can also write plain text.

**PDF: pdf.js** (6.5.438), about 0.5 MB, the PDF renderer that also runs inside Firefox. It turns each page into an image at about 144 dpi, longest side up to 4000 px, or takes out the selectable text. Fonts a PDF needs are fetched only when that PDF needs them.

<h2 id="where">Where the work happens</h2>

The engine runs in a background worker of this tab. The page shows real progress, then the result and its numbers: format, size before and after, dimensions. Nothing is saved until you press Save. Convy recognizes a file by its contents, not by the letters after the dot, so a renamed file is read for what it is. Results larger than 50 MB are written to this browser's storage for the site instead of being held in memory.

<h2 id="limits">Limits</h2>

Convy's limits follow the memory and storage your browser gives this tab. They are there so a job doesn't fail halfway, and Convy checks them before it starts:

- **Images** above 250 megapixels are refused, 100 megapixels on iPhone and iPad, so the tab doesn't run out of memory halfway.
- **ffmpeg jobs** are refused before they start when the estimated result is larger than 1 GB, 500 MB on iPhone and iPad. A job that runs past 2 minutes plus 2 seconds for each MB of input is stopped.
- **Video through Mediabunny** streams large results to storage. Files over 2 GB get a warning, because Convy hasn't been tested above that; you can still try.
- **Storage:** before a job, Convy compares the engine and the expected result with the room this browser reports. If there isn't enough, it says so first.
- **PDFs** with a password can't be opened. A scanned PDF has no selectable text, so turning it into text gives nothing; turn its pages into PNG or JPG instead.
- **Quality** has no setting: each format is written at one fixed quality, for example JPG at 85 and MP3 at about 190 kbps.
- **Documents to PDF** isn't available. It needs a PDF typesetting engine that doesn't run in the browser today.

When a job fails anyway, the message says why and what to try, and your original file stays untouched.

<h2 id="offline">Offline</h2>

Once an engine is saved, conversions that use it keep working without a connection, as long as the Convy page is already open. The page itself isn't stored for offline use, so it can't be opened without a connection.

To prepare before going offline, open the This device panel on the converter and save all engines; it shows the download size first. Browsers can remove saved engines when storage runs low, and Safari may remove them after seven days without a visit. A removed engine downloads again the next time a file needs it.

<h2 id="check">Check it yourself</h2>

While a file converts, open the Network tab in your browser's developer tools and watch what the page requests.

Convy is made by Zeze Workshop. Its source code is open under GPL-3.0, and every engine, version and license is listed on the [About page](/about/#licenses).
