---
draft: false
title: "About Convy: Open Source, Licenses, Makers | Convy"
h1: "About Convy"
description: "What Convy is, who made it (Zeze Workshop), the open-source engines inside it, their versions and licenses, and the source code."
---
Convy is a file converter that runs in your browser. It converts images, audio, video, documents and PDF pages on this device, with open-source engines compiled to WebAssembly. There are no ads and no account. Convy is made by Zeze Workshop and is itself open source.

## Who made it

Zeze Workshop designed and built Convy: the product, the identity, the words and the code. The studio's name appears in the footer and on this page, and nowhere in the converter itself.

<h2 id="licenses">Licenses</h2>

Convy is licensed under the GNU General Public License, version 3 or later (GPL-3.0-or-later). The engines and libraries inside it keep their own licenses:

| Component | Version | What it does here | License |
|---|---|---|---|
| ImageMagick (magick-wasm) | 0.0.46 | Images | Apache-2.0 and the ImageMagick License |
| ffmpeg.wasm core | 0.12.10 | Audio, video fallback, video to GIF | GPL-2.0-or-later |
| ffmpeg.wasm | 0.12.15 | Runs the ffmpeg core | MIT |
| Mediabunny | 1.65.2 | Video through WebCodecs | MPL-2.0 |
| Pandoc (pandoc-wasm) | 1.1.0 (Pandoc 3.10) | Documents | GPL-2.0-or-later |
| pdf.js (pdfjs-dist) | 6.5.438 | PDF pages to images and text | Apache-2.0 |
| fflate | 0.8.3 | ZIP files, compression inside PDFs | MIT |
| Astro | 7.4.2 | Builds the site | MIT |
| Svelte | 5.57.2 | The converter interface | MIT |
| Inter | | Typeface | SIL Open Font License 1.1 |

The ImageMagick build includes further libraries, among them libheif and libde265 for HEIC (LGPL-3.0).

<h2 id="source">Source code</h2>

Convy's source code is under GPL-3.0-or-later. You may run it, study it, change it and share it. If you share a changed version, it stays under the same license and comes with its source. Convy's own code is written from scratch.
