// UI copy: metin.json (hi-fi single source, copywriter-owned). EN default, TR under /tr/.
import metin from './metin.json';
export type Lang = 'en' | 'tr';
export type Copy = (typeof metin)['en'];
export const copy = (l: Lang): Copy => (metin as any)[l];
export const fmt = (s: string, o?: Record<string, unknown>) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && k in o ? String(o[k]) : m));
