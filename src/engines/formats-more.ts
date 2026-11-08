// Format Dilim 1 (FORMAT-GENISLETME, DECISIONS 2026-11-08): the long tail. Bundled into the lazy sniff chunk and registered by
// detect() in formats.ts, so none of it weighs on the island. Labels lower-case to the id (queue.svelte.ts reads targets that way);
// ext[0] is the output file extension (outName).
import type { Format, Kind } from './formats';
// same helper as formats.ts, repeated: importing it would split formats.ts out of the island into a shared chunk (+1 KB br)
const F = (id: string, kind: Kind, mime: string, ext = [id], label = id.toUpperCase()): Format => ({ id, label, kind, ext, mime });

export const MORE: Format[] = [
  // image (magick-wasm; SVG/SVGZ are drawn by the browser first, see svg.ts)
  F('svg', 'image', 'image/svg+xml'), F('svgz', 'image', 'image/svg+xml'), F('qoi', 'image', 'image/qoi'),
  F('jp2', 'image', 'image/jp2', ['jp2', 'j2k', 'j2c', 'jpf']), F('tga', 'image', 'image/x-tga'), F('exr', 'image', 'image/x-exr'),
  F('hdr', 'image', 'image/vnd.radiance'), F('dds', 'image', 'image/vnd.ms-dds'), F('pcx', 'image', 'image/x-pcx'),
  F('pbm', 'image', 'image/x-portable-bitmap'), F('pgm', 'image', 'image/x-portable-graymap'), F('ppm', 'image', 'image/x-portable-pixmap'),
  F('pnm', 'image', 'image/x-portable-anymap'), F('pam', 'image', 'image/x-portable-arbitrarymap'), F('cur', 'image', 'image/x-icon'),
  F('xpm', 'image', 'image/x-xpixmap'), F('xbm', 'image', 'image/x-xbitmap'),
  { ...F('apng', 'image', 'image/apng'), outOnly: true }, // video → animated PNG (ffmpeg); an .apng in is read as PNG, first frame
  // audio (ffmpeg ST; ALAC arrives as M4A or CAF and is decoded there)
  F('aac', 'audio', 'audio/aac', ['aac', 'adts']), F('aiff', 'audio', 'audio/aiff', ['aiff', 'aif', 'aifc']), F('wma', 'audio', 'audio/x-ms-wma'),
  F('ac3', 'audio', 'audio/ac3'), F('caf', 'audio', 'audio/x-caf'), F('mp2', 'audio', 'audio/mpeg'), F('au', 'audio', 'audio/basic', ['au', 'snd']),
  F('m4b', 'audio', 'audio/mp4'), F('tta', 'audio', 'audio/x-tta'), F('voc', 'audio', 'audio/x-voc'), F('amr', 'audio', 'audio/amr'),
  // video (Mediabunny when WebCodecs can, else ffmpeg)
  F('mpg', 'video', 'video/mpeg', ['mpg', 'mpeg']), F('ts', 'video', 'video/mp2t', ['ts', 'mts', 'm2ts', 'm2t']), F('flv', 'video', 'video/x-flv'),
  F('wmv', 'video', 'video/x-ms-wmv', ['wmv', 'asf']), F('3gp', 'video', 'video/3gpp', ['3gp', '3g2']), F('ogv', 'video', 'video/ogg'),
  F('vob', 'video', 'video/mpeg'), F('mxf', 'video', 'application/mxf'),
  // documents (pandoc). .xml is claimed by DocBook and JATS but only taken when the bytes say which (sniff.ts NEED_SIG)
  F('rst', 'document', 'text/x-rst'), F('docbook', 'document', 'application/docbook+xml', ['dbk', 'docbook', 'xml'], 'DocBook'),
  F('ipynb', 'document', 'application/x-ipynb+json'), F('typst', 'document', 'text/x-typst', ['typ'], 'Typst'),
  F('opml', 'document', 'text/x-opml'), F('org', 'document', 'text/org', ['org'], 'Org'), F('fb2', 'document', 'application/x-fictionbook+xml'),
  F('jats', 'document', 'application/jats+xml', ['xml', 'jats', 'nxml']), F('man', 'document', 'text/troff', ['man', '1', '2', '3', '4', '5', '6', '7', '8', '9'], 'man'),
  F('asciidoc', 'document', 'text/asciidoc', ['adoc', 'asciidoc'], 'AsciiDoc'), F('csv', 'document', 'text/csv'), F('tsv', 'document', 'text/tab-separated-values'),
];

// Appended after the curated outputs (the first three stay the hi-fi chips). Input-only, with the reason in DECISIONS: SVG/SVGZ (output
// would be a raster inside an SVG), JP2 codestream, PNM/PAM, CUR, XBM, CAF, MP2, AU, TTA, VOC, AMR, all new video containers, CSV/TSV.
export const MORE_OUT: Partial<Record<Kind, string[]>> = {
  image: ['dds', 'exr', 'hdr', 'jp2', 'pbm', 'pcx', 'pgm', 'ppm', 'qoi', 'tga', 'xpm'],
  audio: ['aac', 'ac3', 'aiff', 'm4b', 'wma'],
  video: ['apng', 'webp'],
  document: ['asciidoc', 'docbook', 'fb2', 'ipynb', 'jats', 'man', 'opml', 'org', 'rst', 'typst'],
};
