---
draft: false
title: "FAQ: Formats, Limits, Offline, iPhone | Convy"
h1: "Questions, answered with their conditions"
description: "Short answers about supported formats, file size limits, offline use, iPhone and Safari, and how Convy works under the hood."
---
Each answer gives its condition. The details behind them are on [How it works](/how-it-works/).

## What can Convy convert?

Images (PNG, JPG, WebP, AVIF, HEIC, GIF, BMP, TIFF, ICO, JPEG XL and flattened PSD), audio (MP3, WAV, M4A, OGG, FLAC and others), video (MP4, MOV, WebM, MKV, AVI, plus video to GIF or MP3), documents through Pandoc (DOCX, ODT, EPUB, Markdown, HTML, with plain text as an output) and PDF pages into images or text. Images can also become PDFs. Conversions with a page of their own are listed on [All conversions](/convert/).

## Is there a file size limit?

Yes, a few, set so the tab doesn't run out of memory halfway: images up to 250 megapixels (100 on iPhone and iPad), and ffmpeg results up to an estimated 1 GB (500 MB on iPhone and iPad). When a file is likely to be too much, Convy tells you before it starts.

## Where are my files converted?

In this browser tab, on this device. The engine runs in a background worker of the tab, the page shows the result first, and nothing is saved until you press Save. To see what the page requests while it works, open the Network tab in your browser's developer tools.

## Why does the first conversion take longer?

The engine for that kind of file downloads once: about 5 MB for images, 10 MB for audio and the video fallback, 16 MB for documents and 0.5 MB for PDF. The browser keeps it, so the next conversion of that kind starts straight away, unless the browser has removed it to free up space.

## Does it work offline?

Yes, once the engine you need is saved. The converter page is stored in this browser after your first visit, so it opens without a connection too; other pages need one. To prepare, save all engines from the This device panel on the converter; it shows the download size first.

## Does it work on iPhone and in Safari?

Convy is tested in Chromium, Firefox and WebKit, the engine behind Safari. On iPhone and iPad it uses lower limits for images and ffmpeg results. If you pick a photo from the Photos library, iOS may hand the browser a JPG copy instead of the HEIC; to convert the original, choose it from the Files app.

## Will the result lose quality?

It depends on the target. JPG, WebP, MP3 and re-encoded MP4 are lossy: each conversion drops a little detail, so keep your original. PNG and WAV are lossless. A JPG placed in a PDF goes in exactly as it is. There is no quality setting; each format is written at one fixed quality, JPG at 85.

## Can I convert many files at once?

Yes. Add several files, choose the target once, and save the results one by one or together as a ZIP. If one file fails, the others carry on.

## Why does Convy treat my .jpg file as something else?

Convy recognizes a file by its contents, not by the letters after the dot. A HEIC renamed to .jpg is still a HEIC, and Convy converts it as one. If the contents match no format it supports, it says so before starting.

## Is it free? Do I need an account?

Convy is free, has no ads and asks for no account. It is open source under GPL-3.0; see [About](/about/#licenses) for every engine and its license.

## How is Convy different from VERT?

VERT is another open-source converter that runs engines like ffmpeg and ImageMagick in the browser through WebAssembly, and so does Convy. The differences: Convy is written from scratch under GPL-3.0, with no code taken from VERT. Convy converts video only in the browser; a video job either runs on this device or isn't offered. And Convy is designed to show you what loads, how the job is going and what you got.
