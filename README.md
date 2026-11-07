# Convy

File converter that runs in your browser. Files never leave the device. GPL-3.0-or-later.

```sh
npm install
npm run dev        # prepares engines (public/engines), Astro dev server
npm run build      # engines + static build + dist/_headers (CSP hashes)
npm run preview    # dist/ with dist/_headers applied, like Cloudflare
node tests/e2e.mjs chromium|firefox|webkit   # smoke: image + video, against :4321
```

Architecture: `05-build/MIMARI.md` in the project folder (ADR-001). Engines: magick-wasm (image), Mediabunny (WebCodecs video/audio, worker), ffmpeg.wasm single-thread (fallback).
