// PDF engine (pdf.js 6.5.438) in its own module worker: pages → PNG/JPG on OffscreenCanvas, or text. pdf.js is loaded from the
// versioned engine path (CSP script-src 'self' forbids blob: modules), its parser runs in this same worker.
// MIMARI §14: isEvalSupported false. Fonts are drawn as glyph paths (disableFontFace): a worker has no document.fonts.
import { loadEngine, ENGINES } from './load-wasm';

const base = new URL(`/engines/${ENGINES.pdf}/`, self.location.origin).href;
let lib: Promise<any> | null = null;
// pdf.js creates canvases through ownerDocument.createElement('canvas'); a worker has OffscreenCanvas instead
const offDoc = { createElement: () => new OffscreenCanvas(1, 1), createElementNS: () => { throw new Error('no DOM in worker'); } };

self.onmessage = async ({ data: { id, file, to, scale = 2, quality = 0.9 } }) => {
  let task: any;
  try {
    lib ??= loadEngine('pdf', (p) => self.postMessage({ id, type: 'engine', p })).then(async () => {
      // we already are a worker: pdf.js' parser runs here (its "fake worker"), no nested worker to spawn and fail over
      (self as any).pdfjsWorker = await import(/* @vite-ignore */ base + 'pdf.worker.min.mjs');
      const m = await import(/* @vite-ignore */ base + 'pdf.min.mjs');
      m.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs';
      return m;
    });
    const pdfjs = await lib.catch((e) => { lib = null; throw e; });
    task = pdfjs.getDocument({
      data: new Uint8Array(await (file as Blob).arrayBuffer()), isEvalSupported: false, disableFontFace: true, useSystemFonts: false,
      useWorkerFetch: true, ownerDocument: offDoc, disableWorkerRendering: true,
      verbosity: pdfjs.VerbosityLevel.ERRORS, // the in-worker parser is pdf.js' "fake worker", which warns on first use by design
      wasmUrl: base + 'wasm/', cMapUrl: base + 'cmaps/', cMapPacked: true, standardFontDataUrl: base + 'standard_fonts/', iccUrl: base + 'iccs/',
    });
    const doc = await task.promise;
    const n = doc.numPages;
    if (to === 'txt') {
      let s = '';
      for (let i = 1; i <= n; i++) {
        s += (await (await doc.getPage(i)).getTextContent()).items.map((it: any) => it.str + (it.hasEOL ? '\n' : '')).join('') + '\n\n';
        self.postMessage({ id, type: 'progress', p: i / n });
      }
      const buf = new TextEncoder().encode(s).buffer;
      self.postMessage({ id, type: 'done', pages: [buf], n }, [buf]);
      return;
    }
    const pages: ArrayBuffer[] = [];
    let w = 0, h = 0;
    for (let i = 1; i <= n; i++) {
      const page = await doc.getPage(i);
      // cap the canvas at 4000 px a side (iOS canvas area limit is 4096²): poster-size pages would fail or exhaust memory
      const one = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: Math.min(scale, 4000 / Math.max(one.width, one.height)) });
      const canvas = new OffscreenCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
      const ctx = canvas.getContext('2d')!;
      if (to === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      await page.render({ canvasContext: ctx, canvas, viewport: vp }).promise;
      if (i === 1) { w = canvas.width; h = canvas.height; }
      pages.push(await (await canvas.convertToBlob({ type: to === 'jpg' ? 'image/jpeg' : 'image/png', quality })).arrayBuffer());
      page.cleanup();
      self.postMessage({ id, type: 'progress', p: i / n });
    }
    self.postMessage({ id, type: 'done', pages, n, w, h }, pages);
  } catch (e: any) {
    self.postMessage({ id, type: 'error', error: String(e?.message || e) });
  } finally {
    task?.destroy();
  }
};
