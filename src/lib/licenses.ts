// About page license table, built from the installed packages (version + license from node_modules/<pkg>/package.json) so the page
// can't drift from package.json. DocPage puts it where about.{en,tr}.md says `<!-- licenses -->`.
// Rows: every `dependencies` entry (shipped) + astro and svelte. A dependency without a ROLE entry fails the build.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import type { Lang } from '../i18n';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8'); // build and tests run from the repo root (this module is bundled, import.meta.url moves)
const json = (p: string) => JSON.parse(read(p));
const HEAD: Record<Lang, string[]> = { en: ['Component', 'Version', 'What it does here', 'License'], tr: ['Bileşen', 'Sürüm', 'Burada ne yapar', 'Lisans'] };
const ROLE: Record<string, [string | Record<Lang, string>, string, string]> = {
  '@imagemagick/magick-wasm': ['ImageMagick (magick-wasm)', 'Images', 'Görseller'],
  '@ffmpeg/core': [{ en: 'ffmpeg.wasm core', tr: 'ffmpeg.wasm çekirdeği' }, 'Audio, video fallback, video to GIF', 'Ses, video yedeği, videodan GIF'],
  '@ffmpeg/ffmpeg': ['ffmpeg.wasm', 'Runs the ffmpeg core', 'ffmpeg çekirdeğini çalıştırır'],
  mediabunny: ['Mediabunny', 'Video through WebCodecs', 'WebCodecs ile video'],
  'pandoc-wasm': ['Pandoc (pandoc-wasm)', 'Documents', 'Belgeler'],
  '@bjorn3/browser_wasi_shim': ['browser_wasi_shim', 'Runs Pandoc in the browser (WASI)', "Pandoc'u tarayıcıda çalıştırır (WASI)"],
  'pdfjs-dist': ['pdf.js (pdfjs-dist)', 'PDF pages to images and text', 'PDF sayfalarından görsel ve metin'],
  fflate: ['fflate', 'ZIP files, compression inside PDFs', 'ZIP dosyaları, PDF içindeki sıkıştırma'],
  astro: ['Astro', 'Builds the site', 'Siteyi üretir'],
  svelte: ['Svelte', 'The converter interface', 'Dönüştürücü arayüzü'],
};
const extraVersion: Record<string, () => string> = { 'pandoc-wasm': () => ` (Pandoc ${read('node_modules/pandoc-wasm/pandoc-version.txt').trim()})` };

export function licenseRows(lang: Lang): string[][] {
  const pkgs = [...Object.keys(json('package.json').dependencies), 'astro', 'svelte'];
  for (const p of pkgs) if (!ROLE[p]) throw new Error(`license-table: no ROLE entry for dependency ${p}`);
  const rows = Object.keys(ROLE).filter((p) => pkgs.includes(p)).map((p) => { // ROLE order; a removed dependency drops out
    const r = ROLE[p];
    const m = json(`node_modules/${p}/package.json`);
    if (!m.license) throw new Error(`license-table: ${p} has no license field`);
    return [typeof r[0] === 'string' ? r[0] : r[0][lang], m.version + (extraVersion[p]?.() ?? ''), lang === 'tr' ? r[2] : r[1], m.license];
  });
  // the self-hosted typeface (public/fonts/OFL-Inter.txt); version from the shipped font's own name table
  const ofl = /SIL Open Font License, Version (\d+(?:\.\d+)*)/.exec(read('public/fonts/OFL-Inter.txt'));
  if (!ofl) throw new Error('license-table: public/fonts/OFL-Inter.txt has no OFL version');
  rows.push(['Inter', fontVersion('public/fonts/convy-ui.woff2'), lang === 'tr' ? 'Yazı karakteri' : 'Typeface', `SIL Open Font License ${ofl[1]}`]);
  return rows;
}

/** "Version 4.001;git-…" (name ID 5) of a WOFF2 file → "4.001". Minimal WOFF2 reader: table directory, one brotli stream, name table. */
export function fontVersion(path: string) {
  const b = readFileSync(join(process.cwd(), path)); let o = 48;
  const u128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const x = b[o++]; v = v * 128 + (x & 127); if (!(x & 128)) return v; } throw new Error('woff2: bad UIntBase128'); };
  const tabs: { tag: number; len: number }[] = [];
  for (let i = 0, n = b.readUInt16BE(12); i < n; i++) {
    const f = b[o++], tag = f & 63; if (tag === 63) o += 4; // arbitrary tag: never 'name'
    const orig = u128(), v = f >> 6, transformed = tag === 10 || tag === 11 ? v === 0 : v !== 0; // glyf/loca: version 0 = transformed
    tabs.push({ tag, len: transformed ? u128() : orig });
  }
  const data = brotliDecompressSync(b.subarray(o, o + b.readUInt32BE(20)));
  let at = 0; for (const t of tabs) { if (t.tag === 5) break; at += t.len; } // known-tag index 5 = 'name'
  const nm = data.subarray(at), str = at + nm.readUInt16BE(4);
  for (let r = 6, n = nm.readUInt16BE(2); r < 6 + n * 12; r += 12)
    if (nm.readUInt16BE(r + 6) === 5 && nm.readUInt16BE(r) === 3) {
      const raw = data.subarray(str + nm.readUInt16BE(r + 10), str + nm.readUInt16BE(r + 10) + nm.readUInt16BE(r + 8));
      const v = /Version (\d+\.\d+)/.exec(String.fromCharCode(...Array.from({ length: raw.length / 2 }, (_, i) => raw.readUInt16BE(i * 2))));
      if (v) return v[1];
    }
  throw new Error(`license-table: ${path} has no name ID 5 version`);
}

const esc = (x: string) => x.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
/** the table as HTML, same shape as a markdown table; data-l = column head, shown per cell when rows stack below 768 px */
export const licenseTable = (lang: Lang) =>
  `<table><thead><tr>${HEAD[lang].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${licenseRows(lang).map((r) => `<tr>${r.map((c, i) => `<td data-l="${esc(HEAD[lang][i])}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
