// Single source of truth for formats (MIMARI §2, §16). Wave 1 wires image (magick) and audio/video
// (Mediabunny → ffmpeg ST). Document (pandoc) and PDF (pdf.js) are added in wave 3.
export type Kind = 'image' | 'audio' | 'video' | 'document' | 'pdf';
export type EngineKey = 'image' | 'av' | 'doc';

export interface Format { id: string; label: string; kind: Kind; ext: string[]; mime: string; }

const F = (id: string, kind: Kind, mime: string, ext = [id], label = id.toUpperCase()): Format => ({ id, label, kind, ext, mime });

export const FORMATS: Format[] = [
  F('jpg', 'image', 'image/jpeg', ['jpg', 'jpeg', 'jfif']), F('png', 'image', 'image/png'), F('webp', 'image', 'image/webp'),
  F('avif', 'image', 'image/avif'), F('heic', 'image', 'image/heic', ['heic', 'heif']), F('gif', 'image', 'image/gif'),
  F('bmp', 'image', 'image/bmp'), F('tiff', 'image', 'image/tiff', ['tif', 'tiff']), F('ico', 'image', 'image/x-icon'),
  F('jxl', 'image', 'image/jxl'), F('psd', 'image', 'image/vnd.adobe.photoshop'),
  F('mp3', 'audio', 'audio/mpeg'), F('wav', 'audio', 'audio/wav'), F('m4a', 'audio', 'audio/mp4', ['m4a', 'aac']),
  F('ogg', 'audio', 'audio/ogg'), F('opus', 'audio', 'audio/opus'), F('flac', 'audio', 'audio/flac'),
  F('mp4', 'video', 'video/mp4', ['mp4', 'm4v']), F('mov', 'video', 'video/quicktime'), F('webm', 'video', 'video/webm'),
  F('mkv', 'video', 'video/x-matroska'), F('avi', 'video', 'video/x-msvideo'),
];
export const byId = (id: string) => FORMATS.find((f) => f.id === id);

// Outputs per input kind (MIMARI §16). Order of the first three = hi-fi target chips (veri.js TARGETS, design assumption D8).
const OUT: Record<Kind, string[]> = {
  image: ['jpg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'ico', 'jxl'],
  audio: ['mp3', 'm4a', 'flac', 'wav', 'ogg', 'opus'],
  video: ['mp4', 'webm', 'gif', 'mp3', 'm4a'],
  document: [], pdf: [],
};
export const targets = (f: Format) => OUT[f.kind].filter((t) => t !== f.id || f.kind === 'video');
export const engineOf = (f: Format): EngineKey => (f.kind === 'image' ? 'image' : f.kind === 'document' || f.kind === 'pdf' ? 'doc' : 'av');

// Extension first (iOS hands real types; `accept` is omitted on purpose, Ek D), MIME as fallback.
export function detect(file: File): Format | null {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  return FORMATS.find((f) => f.ext.includes(ext)) || FORMATS.find((f) => f.mime === file.type) || null;
}
export const outName = (name: string, to: string) => name.replace(/\.[^.]+$/, '') + '.' + to;
