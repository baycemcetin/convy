---
draft: false
title: "Privacy | Convy"
h1: "Privacy"
description: "Convy converts files on your device. No account, no cookies, no ads, no analytics. What your browser keeps, how to remove it, and what the host sees."
---
Convy converts files in your browser, on this device. Files stay on your device. There is no account, no cookies, no ads and no analytics. Below: what your browser keeps for Convy, how to remove it, and what the service that delivers the site can see.

## Your files

The page reads a file you add and converts it in the background of this tab. Convy has no part that receives files: on the server side Convy is static files only (pages, scripts and engines) and runs no code there, and the page's security policy lets it connect only to Convy's own address. A result stays in the tab until you save it.

Results larger than 50 MB are written to this browser's storage for the site while they wait. Convy deletes each one about a minute after you save it, when you remove it from the list, or when you close the tab, and clears anything left behind on your next visit. On a phone, if you share a result, it goes to the app you pick in the share sheet.

## What Convy doesn't collect

- **No account.** Nothing to sign up for or sign in to.
- **No cookies.** Convy sets none.
- **No analytics, ads or third-party content.** Every script, font and image on the page comes from Convy's own address.
- **No camera, microphone or location.** The page's permissions policy switches them off.

## What your browser keeps

These stay in this browser, for useconvy.com only. None of them is sent back to the server.

- **Engines.** An engine you use is saved in Cache Storage so it doesn't download again: about 5 MB for images, 10 MB for audio and video, 16 MB for documents, 0.5 MB for PDF.
- **The converter page.** After your first visit, a service worker stores the converter page with its scripts, font and icons, so it opens without a connection.
- **Large results.** Results over 50 MB, for a short time, as described above (in the Origin Private File System).
- **Your theme.** If you choose light or dark with the theme button, the choice is saved in localStorage as `convy-theme`. Nothing else is kept there.

## How to remove it

- **Saved engines:** open the This device panel on the converter and press Remove saved engines. The button shows how much room it frees.
- **Everything,** including the stored page and your theme: clear the site data for useconvy.com in your browser's settings. Convy then behaves as on a first visit.
- Browsers can also remove this data on their own when storage runs low, and Safari may remove it after 7 days without a visit.

## What the host sees

Convy is delivered by Cloudflare. When your browser asks for a page, a script or an engine file, the request goes through Cloudflare, as it does for any site Cloudflare serves, and carries what every web request carries: your IP address, the address requested, the time and your browser's user agent. Cloudflare may keep standard logs of these requests; how it handles them is set out in [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/). None of these requests carries your files, their names or their contents.

## Links to other sites

Links to other sites, such as the source code on GitHub, take you off Convy, and those sites have their own policies. Convy tells them only its own address as the page you came from.

## Check it yourself

Read the source code (linked on [About](/about/#source)), or open the Network tab in your browser's developer tools while a file converts and watch what the page requests. [How it works](/how-it-works/#check) has the details.

Last updated 8 November 2026.
