// Pure view helpers shared by Stage / Log / Row (hi-fi ekranlar.js + bilesen.js rules, product data).
import { q, type Item } from './queue.svelte';
import { outName as oName } from '../engines/formats';
import { fmt, type F } from './fmt';

export const isReady = (it: Item) => (it.st === 'ready' || it.st === 'cancelled') && !it.block;
export const isJob = (it: Item) => it.st === 'running' || it.st === 'queued';
export const outName = (it: Item) => it.outN ?? oName(it.n, (it.to || '').toLowerCase());

/** engine name in the readout: the PDF scene says "PDF engine", so does the readout */
const engLabel = (t: F['t'], k: string) => (k === 'pdf' ? t.engName.pdf : t.panel.eng[k === 'image' ? 0 : 2][0]);

/** readout "Engine" value: saved / not saved / downloading. Words come from approved copy (engVal, panel.eng) */
export function engVal(x: F, it: Item | null) {
  if (!it?.eng) return null;
  const t = x.t;
  if (q.engine && q.engine.key === it.eng) return it.eng === 'av' ? fmt(t.engVal.avFetching, { pct: x.pct(q.engine.p) }) : `${engLabel(t, it.eng)} · ${x.pct(q.engine.p)}`;
  if (it.eng === 'image') return q.saved.image ? t.engVal.imageSaved : `${t.panel.eng[0][0]} · ${t.panel.eng[2][1]}`;
  if (it.eng === 'doc' || it.eng === 'pdf') return `${engLabel(t, it.eng)} · ${q.saved[it.eng] ? t.panel.eng[0][1] : t.panel.eng[2][1]}`;
  return q.saved.av ? t.engVal.avReady : t.engVal.avNotSaved;
}

/** the row / stage state word (stateText in bilesen.js) */
export function stateWord(x: F, it: Item) {
  const t = x.t; // block / warn / done / failed words are drawn by Log before it falls back here
  if (it.st === 'queued') return it.eng === 'image' ? t.st.queued : t.st.waiting;
  if (it.st === 'cancelled') return t.st.ready;
  return (t.st as Record<string, string>)[it.st] ?? '';
}

/** stage view of an item: which ekranlar.js stage() branch draws it */
export type View = 'needs' | 'ready' | 'engine' | 'block' | 'running' | 'done' | 'cleared' | 'failed' | 'unsupported' | 'offline';
export function viewOf(it: Item, completing: boolean, shown: boolean): View {
  if (completing) return 'running';
  if (it.st === 'needs') return 'needs';
  if (it.block && (it.st === 'ready' || it.st === 'cancelled')) return 'block';
  if (it.st === 'ready' || it.st === 'cancelled') return 'ready';
  if (it.st === 'queued') return q.engine && q.engine.key === it.eng ? 'engine' : 'ready';
  if (it.st === 'running') return q.engine && q.engine.key === it.eng ? 'engine' : shown ? 'running' : 'ready';
  return it.st as View;
}

/** engine line wording: image / video / document / PDF */
export const engWord = (t: F['t'], key: string | undefined) => (key === 'image' ? t.engName.image : key === 'av' ? t.engName.video : key === 'pdf' ? t.engName.pdf : t.engName.doc);
