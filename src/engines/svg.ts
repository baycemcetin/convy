// SVG / SVGZ in: drawn by the browser itself (fonts, CSS, gradients, filters), then handed on as PNG. magick-wasm's own renderer (MSVG)
// has no fonts (any <text> fails the whole file) and goes through the MVG coder, which its security policy blocks; Inkscape/rsvg are
// not in the build. An SVG in <img> runs no script and fetches nothing external. Lazy chunk, main thread (needs Image + canvas); the pixel ceiling comes in from index.ts (an import here would split limits.ts out).
export async function svgToPng(file: Blob, id: string, maxMP: number) {
  const src = id === 'svgz' ? await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).blob() : file;
  const url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => { throw new Error('invalid: svg'); }); // classify → unreadable
    let w = img.naturalWidth, h = img.naturalHeight;
    // no absolute width + height on the root: browsers disagree (Chrome 300 × 150, Firefox 0), so size from the viewBox
    const root = /<svg\b[^>]*>/.exec(await src.slice(0, 64 * 1024).text())?.[0] ?? '';
    const abs = (a: string) => new RegExp(`\\s${a}\\s*=\\s*["']?\\s*[\\d.]+(px)?\\s*["'\\s/>]`).test(root);
    const vb = /viewBox\s*=\s*["']\s*[-\d.e]+[\s,]+[-\d.e]+[\s,]+([\d.e]+)[\s,]+([\d.e]+)/.exec(root);
    if (!(abs('width') && abs('height')) || !w || !h) [w, h] = vb ? [+vb[1], +vb[2]] : w && h ? [w, h] : [300, 150]; // 300 × 150: CSS default object size
    // pixel ceiling as for any image, and 16384 px a side (canvas limit across the three engines)
    const k = Math.min(1, Math.sqrt((maxMP * 1e6) / (w * h)), 16384 / Math.max(w, h));
    w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
    if (!blob) throw new Error('allocation failed: svg canvas'); // classify → memory
    return { blob, w, h, engine: 'magick' as const, file: new File([blob], 'in.png') }; // a RunResult for PNG out, `file` for magick
  } finally { URL.revokeObjectURL(url); }
}
