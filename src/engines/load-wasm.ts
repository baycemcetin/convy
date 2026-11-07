// Engine files: manifest + split wasm parts (scripts/prep-engines.mjs). Cache-first in Cache Storage under
// versioned paths, so a cached engine is never stale. Progress = raw bytes received / manifest.size.
export interface Manifest { engine: string; version: string; size: number; transfer: number; parts: { name: string; size: number }[]; side: { name: string; size: number }[]; }
export const ENGINES = { av: 'ffmpeg-st@0.12.10', image: 'magick@0.0.46' } as const;
export type EngineId = keyof typeof ENGINES;
const CACHE = 'convy-engines-v1';
const base = (id: EngineId) => new URL(`/engines/${ENGINES[id]}/`, self.location.origin).href;

const manifests: Partial<Record<EngineId, Promise<Manifest>>> = {};
export const manifest = (id: EngineId) => (manifests[id] ??= fetch(base(id) + 'manifest.json').then((r) => {
  if (!r.ok) throw new Error(`manifest ${id}: HTTP ${r.status}`);
  return r.json();
}));

async function cachedFetch(url: string, onBytes: (n: number) => void): Promise<ArrayBuffer> {
  const cache = typeof caches !== 'undefined' ? await caches.open(CACHE).catch(() => null) : null;
  const hit = await cache?.match(url);
  if (hit) { const b = await hit.arrayBuffer(); onBytes(b.byteLength); return b; }
  const r = await fetch(url);
  if (!r.ok || !r.body) throw new Error(`${url}: HTTP ${r.status}`);
  const chunks: Uint8Array[] = [];
  for (const rd = r.body.getReader(); ;) {
    const { done, value } = await rd.read();
    if (done) break;
    chunks.push(value); onBytes(value.byteLength);
  }
  const blob = new Blob(chunks as BlobPart[]);
  await cache?.put(url, new Response(blob, { headers: { 'content-type': url.endsWith('.wasm') ? 'application/wasm' : 'text/javascript' } })).catch(() => {});
  return blob.arrayBuffer();
}

/** Downloads (or reads from cache) an engine; returns its joined wasm and side files. */
export async function loadEngine(id: EngineId, onProgress?: (p: number) => void) {
  const m = await manifest(id);
  let got = 0;
  const tick = (n: number) => { got += n; onProgress?.(Math.min(1, got / m.size)); };
  const [wasm, ...side] = await Promise.all([
    Promise.all(m.parts.map((p) => cachedFetch(base(id) + p.name, tick))).then((b) => new Blob(b, { type: 'application/wasm' })),
    ...m.side.map((s) => cachedFetch(base(id) + s.name, tick).then((b) => new Blob([b], { type: 'text/javascript' }))),
  ]);
  return { wasm, side, manifest: m };
}

/** Which engines are fully in Cache Storage (device panel, readout "saved"). */
export async function savedEngines(): Promise<Record<EngineId, boolean>> {
  const out = { av: false, image: false } as Record<EngineId, boolean>;
  const cache = typeof caches !== 'undefined' ? await caches.open(CACHE).catch(() => null) : null;
  if (!cache) return out;
  for (const id of Object.keys(ENGINES) as EngineId[]) {
    const m = await manifest(id).catch(() => null);
    out[id] = !!m && (await Promise.all([...m.parts, ...m.side].map((p) => cache.match(base(id) + p.name)))).every(Boolean);
  }
  return out;
}
export const removeSavedEngines = () => caches.delete(CACHE);
