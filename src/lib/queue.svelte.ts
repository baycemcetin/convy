// Converter state (MIMARI §4, TEYIT Ek D). File list: unsupported | needs | ready{block?} ; a Job exists only after
// "Convert": queued → running → done | failed | cancelled. Item fields follow the hi-fi data model (veri.js) so the
// island templates map 1:1: n name, f FROM label, k kind, to TO label, i/o sizes in MB, dim, dur, st, p, eng.
import { detect, targets, engineOf, outName, byId, type Format, type EngineKey } from '../engines/formats';
import { run, probeAV, estimateOut, EngineError, type ErrCode, preview, release, sweepOpfs, dropSession, type Preview } from '../engines/index';
import { manifest, savedEngines, removeSavedEngines, type EngineId } from '../engines/load-wasm';
import { OPFS_OUT_MIN } from '../engines/limits';

export type St = 'needs' | 'ready' | 'queued' | 'running' | 'done' | 'cleared' | 'failed' | 'unsupported' | 'cancelled' | 'offline';
export interface Item {
  id: number; file: File; fmt: Format | null;
  n: string; f: string; k: string; to: string | null; i: number; o: number | null; approx: boolean;
  dim: string | null; w: number | null; h: number | null; dur: number | null;
  st: St; p: number | null; eng: EngineKey | null; out: Blob | null; pv: Preview; outN: string | null; // pv: result preview (Ek B); outN: output file name (a PDF's pages arrive as name.zip)
  block: { need: number; free: number } | null; error: ErrCode | null; empty: boolean; saved: boolean; pvGone: boolean; // pvGone: a preview existed and went with the OPFS copy (empty frame, same size)
  targets: string[];
}
const MB = (b: number) => b / 1e6;
let nextId = 1;
const ctrls = new Map<number, AbortController>();

export const q = $state({
  items: [] as Item[],
  staged: null as number | null,            // id of the file on the stage (T1: a row's name button stages it)
  engine: null as null | { key: EngineKey; p: number },   // engine download in progress (engine line / readout)
  saved: { av: false, image: false, doc: false, pdf: false } as Record<EngineId, boolean>,
  sizes: { av: null, image: null, doc: null, pdf: null } as Record<EngineId, null | { size: number; transfer: number }>, // MB, from manifest (T11)
  store: null as null | { usage: number; quota: number },  // MB, storage.estimate()
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
});

// online/offline: the "Offline" tag follows the browser; an item parked as offline is ready again once the connection is back
if (typeof window !== 'undefined') {
  const net = () => { q.online = navigator.onLine; if (q.online) for (const it of q.items) if (it.st === 'offline') it.st = 'ready'; };
  addEventListener('online', net); addEventListener('offline', net);
  // OPFS outputs (≥ 50 MB) never outlive the session: earlier sessions' leftovers go now, ours when the page goes (not into bfcache)
  sweepOpfs();
  addEventListener('pagehide', (e) => { if (!e.persisted) dropSession(); });
}
// a download reads the file after click() returns: give it time before the OPFS copy goes (in-memory results: no-op).
// After that the result is gone (out = null, st = 'cleared'): Save and the ZIP skip it, the row offers "Convert again".
// A second save/share/ZIP restarts the clock, so the first timer never deletes the file under the second download.
const CLEAR_MS = () => (globalThis as any).__convyClearMs ?? 60_000; // the global exists for tests/remove-cleared.mjs only
const clearT = new Map<number, ReturnType<typeof setTimeout>>();
const spend = (it: Item) => {
  const b = it.out; clearTimeout(clearT.get(it.id));
  clearT.set(it.id, setTimeout(() => {
    clearT.delete(it.id);
    if (!release(b) || it.out !== b) return;
    it.out = null; it.st = 'cleared';
    if (it.pv && 'url' in it.pv) URL.revokeObjectURL(it.pv.url);
    it.pvGone = !!it.pv; it.pv = null;
  }, CLEAR_MS()));
};

export const byIdItem = (id: number | null) => q.items.find((x) => x.id === id) || null;

const IDS: EngineId[] = ['av', 'image', 'doc', 'pdf'];
/** Manifest sizes + saved state + estimate(); call on mount and after engine downloads / removal. */
export async function refreshDevice() {
  // all four at once: WebKit logs a console error for a fetch that starts while a navigation (language switch right after load) tears the page down
  const ms = await Promise.all(IDS.map((id) => manifest(id).catch(() => null)));
  ms.forEach((m, k) => { if (m) q.sizes[IDS[k]] = { size: MB(m.size), transfer: MB(m.transfer) }; });
  q.saved = await savedEngines(ms);
  const e = await navigator.storage?.estimate?.().catch(() => null);
  if (e) q.store = { usage: MB(e.usage || 0), quota: MB(e.quota || 0) };
}
export async function removeEngines() { await removeSavedEngines(); await refreshDevice(); for (const it of q.items) if (it.block) await checkQuota(it); } // the freed room may lift a block

/** `before` sees the new items just ahead of the push (the island sets row stagger there: rows render in the same flush). */
export async function add(files: FileList | File[], before?: (items: Item[]) => void) {
  const list = Array.from(files); // the input is cleared right after the pick
  const fmts = await Promise.all(list.map(detect));
  const fresh = list.map((file, k) => {
    const fmt = fmts[k];
    return <Item>{
      id: nextId++, file, fmt, n: file.name, f: fmt?.label ?? (file.name.split('.').pop() || '?').toUpperCase(), k: fmt?.kind ?? 'unknown',
      to: null, i: MB(file.size), o: null, approx: false, dim: null, w: null, h: null, dur: null,
      st: fmt && targets(fmt).length && file.size ? 'needs' : 'unsupported', empty: file.size === 0, // a 0-byte file is never convertible: 'unsupported' + empty flag (own copy)
      p: null, eng: fmt ? engineOf(fmt) : null, out: null, pv: null, outN: null,
      block: null, error: null, saved: false, pvGone: false, targets: fmt ? targets(fmt).map((t) => byId(t)!.label) : [],
    };
  });
  before?.(fresh);
  for (const it of fresh) { q.items.push(it); if (q.staged == null) q.staged = it.id; }
  // batch target: a new file of a kind already targeted in this batch inherits that target (one choice per kind)
  for (const it of q.items) if (it.st === 'needs') { const same = q.items.find((x) => x !== it && x.k === it.k && x.to); if (same) setTarget(it.id, same.to!); }
}

/** Choose / change the target. Re-runs the pre-checks (estimate, quota) every time (Ek D). */
export async function setTarget(id: number, label: string) {
  const it = byIdItem(id); if (!it || !it.fmt || !['needs', 'ready', 'failed', 'cancelled'].includes(it.st)) return;
  it.to = label; it.st = 'ready'; it.error = null; it.o = null; it.approx = false;
  const to = label.toLowerCase();
  if (it.k === 'audio' || it.k === 'video') {
    import('../engines/ffmpeg').catch(() => {}); // warm the fallback wrapper: WebKit remembers a failed dynamic import until reload
    const pr = await probeAV(it.file, to);
    it.dur = pr.duration; if (pr.w) { it.w = pr.w; it.h = pr.h; }
    if (pr.duration) { it.o = MB(estimateOut(it.file.size, to, pr.duration)); it.approx = true; }
  }
  await checkQuota(it);
}
export function applyToKind(kind: string, label: string) { for (const it of q.items) if (it.k === kind && it.targets.includes(label)) setTarget(it.id, label); }

/** Quota pre-check: engine raw size if not saved + output headed to OPFS. Uses estimate(), never "free on device". */
async function checkQuota(it: Item) {
  const e = await navigator.storage?.estimate?.().catch(() => null);
  if (!e?.quota) { it.block = null; return; }
  const key = it.eng as EngineId;
  const engine = q.saved[key] ? 0 : (q.sizes[key]?.size ?? 0) * 1e6;
  const out = (it.o ?? it.i) * 1e6;
  const need = engine + (out > OPFS_OUT_MIN ? out : 0);
  const free = e.quota - (e.usage || 0);
  it.block = need > free ? { need: MB(need), free: MB(free) } : null;
}

const ready = (it: Item) => (it.st === 'ready' || it.st === 'cancelled') && !it.block; // a stopped file is ready again
export const readyCount = () => q.items.filter(ready).length;

/** "Convert": every ready file becomes a job. One runner per engine (image / av) so a video never blocks photos. */
export function convert() {
  for (const it of q.items) if (ready(it)) { it.st = 'queued'; it.p = null; }
  for (const k of ['image', 'av', 'doc', 'pdf'] as EngineKey[]) pump(k);
}
const busy: Record<string, boolean> = {};
async function pump(key: EngineKey) {
  if (busy[key]) return;
  busy[key] = true;
  try {
    for (let it; (it = q.items.find((x) => x.st === 'queued' && x.eng === key)); ) await exec(it);
  } finally { busy[key] = false; }
}

async function exec(it: Item) {
  const ac = new AbortController(); ctrls.set(it.id, ac);
  release(it.out); it.out = null; // a retry after Stop during the preview: the earlier output is replaced
  it.st = 'running'; it.p = null;
  const ekey = it.eng as EngineId;
  try {
    if ((globalThis as any).__convyFail) throw new EngineError((globalThis as any).__convyFail); // test hook (tests/reasons.mjs): fail with this reason code
    const to = it.to!.toLowerCase();
    const r = await run(it.file, it.fmt!, to, outName(it.n, to), {
      engine: (p) => { q.engine = p >= 1 ? null : { key: it.eng!, p }; },
      progress: (p) => { it.p = p; },
    }, ac.signal);
    q.engine = null;
    it.out = r.blob; it.o = MB(r.blob.size); it.approx = false;
    if (r.w) { it.w = r.w; it.h = r.h!; it.dim = `${r.w} × ${r.h}`; }
    if (r.duration) it.dur = r.duration;
    it.outN = r.name ?? outName(it.n, to);
    it.pv = await preview(r, to, ac.signal).catch(() => null);
    it.st = 'done'; it.p = 1;
    if (!q.saved[ekey]) refreshDevice();
  } catch (e: any) {
    q.engine = null;
    if (e?.name === 'AbortError') { it.st = 'cancelled'; it.p = null; }
    else if (!navigator.onLine && !q.saved[ekey]) it.st = 'offline'; // engine never saved + no connection (copy per engine: off.needs*)
    else { let c: ErrCode = e instanceof EngineError ? e.code : 'failed';
      if (c === 'failed' || c === 'unsupported') c = await import('../engines/classify').then((m) => m.classify(e?.wname || e?.name, e?.message), () => 'failed');
      it.error = c; it.st = 'failed'; console.warn('[convy]', it.n, e); }
  } finally { ctrls.delete(it.id); }
}

export function stop(id: number) {
  const it = byIdItem(id); if (!it) return;
  if (it.st === 'queued') { it.st = 'ready'; return; }
  ctrls.get(id)?.abort();
}
export function stopAll() { for (const it of q.items) if (it.st === 'queued' || it.st === 'running') stop(it.id); }
export function retry(id: number) { const it = byIdItem(id); if (it && (it.st === 'failed' || it.st === 'cancelled') && it.to) { it.st = 'queued'; it.error = null; pump(it.eng!); } }
export function remove(id: number) {
  const i = q.items.findIndex((x) => x.id === id); if (i < 0) return;
  const [it] = q.items.splice(i, 1);
  ctrls.get(id)?.abort();
  if (!it.saved) release(it.out); // saved: its pending timer (started by Save) deletes the file once the download has read it
  if (it.pv && 'url' in it.pv) URL.revokeObjectURL(it.pv.url);
  if (q.staged === id) q.staged = q.items[Math.min(i, q.items.length - 1)]?.id ?? null;
}
/** "Convert again" on a cleared result: same quota check as a first run, then the job queues again. */
export async function reconvert(id: number) {
  const it = byIdItem(id); if (!it || it.st !== 'cleared') return;
  await checkQuota(it); // the output goes to OPFS again: it needs room
  if (it.st !== 'cleared') return; // a second click while checking
  it.saved = false; it.pvGone = false; it.error = null; it.p = null;
  if (it.block) it.st = 'ready'; else { it.st = 'queued'; pump(it.eng!); }
}
export function stage(id: number) { q.staged = id; }

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30_000);
}
/** Save one result (T7: marks it saved). */
export function save(id: number) {
  const it = byIdItem(id); if (!it?.out) return;
  download(it.out, it.outN!); it.saved = true; spend(it);
}
/** iOS share sheet for images/video when canShare({files}) (Ek B). share() must be the first await in the click. */
export const canShareItem = (it: Item) => !!it.out && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [new File([it.out], it.outN!, { type: it.out.type })] });
export async function share(id: number) {
  const it = byIdItem(id); if (!it?.out) return;
  await navigator.share({ files: [new File([it.out], it.outN!, { type: it.out.type })] }).then(() => { it.saved = true; spend(it); }, () => {});
}
/** "Save n done (ZIP)": finished files only (DECISIONS 2026-11-07). Names are de-duplicated. */
export async function saveZip() {
  const done = q.items.filter((x) => x.st === 'done' && x.out);
  if (!done.length) return;
  const { zip } = await import('fflate');
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  for (const it of done) {
    let name = it.outN!;
    for (let k = 2; files[name]; k++) name = name.replace(/(\.[^.]+)$/, ` (${k})$1`);
    files[name] = [new Uint8Array(await it.out!.arrayBuffer()), { level: 0 }]; // outputs are already compressed
  }
  // shortcut: in-memory ZIP; fine for photo batches, streams (fflate Zip + showSaveFilePicker) when large batches are measured
  const data = await new Promise<Uint8Array>((res, rej) => zip(files, (err, d) => (err ? rej(err) : res(d))));
  download(new Blob([data as BlobPart], { type: 'application/zip' }), 'convy.zip');
  done.forEach((it) => { it.saved = true; spend(it); });
}
