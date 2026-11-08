// UI copy: metin.json (hi-fi single source, copywriter-owned). EN default, TR under /tr/.
import metin from './metin.json';
export type Lang = 'en' | 'tr';
/** pair: set by PairPage only, so the empty gauge shows what the page already knows (E6) */
export type Copy = (typeof metin)['en'] & { pair?: { from: string; to: string; eng: 'image' | 'av' | 'doc' | 'pdf' } };
export const copy = (l: Lang): Copy => (metin as any)[l];
export const fmt = (s: string, o?: Record<string, unknown>) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o && k in o ? String(o[k]) : m));

/** the island's slice of the copy (content-page sections stay out of the HTML payload) */
export const islandCopy = (l: Lang) => { const { fmt: _f, hiw: _h, priv: _p, how: _w, foot: _o, made: _m, mem: _e, written: _r, ...rest } = copy(l) as any; return rest as Copy; };
