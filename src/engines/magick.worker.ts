// Image engine (magick-wasm) in its own module worker. Input is the user's File (structured clone, not copied);
// the input format is always passed explicitly so ImageMagick never sniffs a coder (MIMARI §14).
import { initializeImageMagick, ImageMagick, MagickFormat, MagickColor, AlphaAction, ResourceLimits } from '@imagemagick/magick-wasm';
import { loadEngine } from './load-wasm';
import { IMAGE_MAX_MP } from './limits';

const FMT: Record<string, MagickFormat> = {
  jpg: MagickFormat.Jpeg, png: MagickFormat.Png, webp: MagickFormat.WebP, avif: MagickFormat.Avif, heic: MagickFormat.Heic,
  gif: MagickFormat.Gif, bmp: MagickFormat.Bmp, tiff: MagickFormat.Tiff, ico: MagickFormat.Ico, jxl: MagickFormat.Jxl, psd: MagickFormat.Psd,
};
const NO_ALPHA = new Set(['jpg', 'bmp']);

let ready: Promise<void> | null = null;
const init = (id: number) => (ready ??= (async () => {
  const { wasm } = await loadEngine('image', (p) => self.postMessage({ id, type: 'engine', p }));
  // magick-wasm rejects blob: URLs; hand it a compiled module
  await initializeImageMagick(await WebAssembly.compileStreaming(new Response(wasm)));
  // untrusted input: defaults allow 17 Gpx in RAM; disk 0 so over-limit images fail (CacheResourcesExhausted), not spill to MEMFS
  ResourceLimits.area = BigInt(IMAGE_MAX_MP * 1e6); ResourceLimits.disk = 0n;
})().catch((e) => { ready = null; throw e; })); // a failed download must not be cached: Try again fetches again

self.onmessage = async ({ data: { id, file, from, to, quality = 85, maxSide } }) => {
  try {
    await init(id);
    self.postMessage({ id, type: 'progress', p: null });
    const bytes = new Uint8Array(await (file as Blob).arrayBuffer());
    const res = ImageMagick.read(bytes, FMT[from], (img) => {
      img.autoOrient();
      if (maxSide && Math.max(img.width, img.height) > maxSide) img.thumbnail(maxSide, maxSide);
      if (to === 'ico' && Math.max(img.width, img.height) > 256) img.resize(256, 256);
      if (NO_ALPHA.has(to) && img.hasAlpha) { img.backgroundColor = new MagickColor(255, 255, 255); img.alpha(AlphaAction.Remove); }
      img.quality = quality;
      const w = img.width, h = img.height;
      return img.write(FMT[to], (d) => ({ out: d.slice(), w, h })); // data only valid inside the callback
    });
    self.postMessage({ id, type: 'done', ...res }, [res.out.buffer]);
  } catch (e: any) {
    self.postMessage({ id, type: 'error', error: String(e?.message || e) });
  }
};
