// About page license table, built from the installed packages (version + license from node_modules/<pkg>/package.json) so the page
// can't drift from package.json. DocPage puts it where about.{en,tr}.md says `<!-- licenses -->`.
// Rows: every `dependencies` entry (shipped) + astro and svelte. A dependency without a ROLE entry fails the build.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  // the self-hosted typeface (public/fonts/OFL-Inter.txt); version is in the font's name table, not read here
  const ofl = /SIL Open Font License, Version (\d+(?:\.\d+)*)/.exec(read('public/fonts/OFL-Inter.txt'));
  if (!ofl) throw new Error('license-table: public/fonts/OFL-Inter.txt has no OFL version');
  rows.push(['Inter', '', lang === 'tr' ? 'Yazı karakteri' : 'Typeface', `SIL Open Font License ${ofl[1]}`]);
  return rows;
}

const esc = (x: string) => x.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
/** the table as HTML, same shape as a markdown table */
export const licenseTable = (lang: Lang) =>
  `<table><thead><tr>${HEAD[lang].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${licenseRows(lang).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
