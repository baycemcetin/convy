// Document engine (pandoc-wasm 1.1.0 = Pandoc 3.10) in its own module worker. The package's browser entry fetches the 59 MB
// wasm in one piece; we use core.js createPandocInstance(ArrayBuffer) with our split, cached loader (spike-2).
// @ts-ignore: subpath outside the package's exports map, imported by path on purpose
import { createPandocInstance } from '../../node_modules/pandoc-wasm/src/core.js';
import { loadEngine } from './load-wasm';

// our format id → pandoc reader / writer
const READ: Record<string, string> = { docx: 'docx', odt: 'odt', md: 'markdown', html: 'html', epub: 'epub', rtf: 'rtf', tex: 'latex' };
const WRITE: Record<string, string> = { docx: 'docx', odt: 'odt', md: 'markdown', html: 'html5', epub: 'epub3', txt: 'plain' };

let ready: Promise<any> | null = null;
self.onmessage = async ({ data: { id, file, from, to, title } }) => {
  try {
    ready ??= loadEngine('doc', (p) => self.postMessage({ id, type: 'engine', p })).then(({ wasm }) => wasm.arrayBuffer()).then(createPandocInstance);
    const pandoc = await ready.catch((e) => { ready = null; throw e; });
    self.postMessage({ id, type: 'progress', p: null });
    const inName = 'in.' + from, outName = 'out.' + to;
    const options: Record<string, unknown> = { from: READ[from], to: WRITE[to], 'input-files': [inName], 'output-file': outName, standalone: to === 'html' || to === 'epub' };
    if (to === 'epub') options.metadata = { title };
    if (to === 'html') options.variables = { pagetitle: title }; // otherwise pandoc titles the page after our temp name: <title>in</title>
    const r = await pandoc.convert(options, null, { [inName]: file as Blob });
    const out: Blob | undefined = r.files?.[outName];
    if (!out) throw new Error('no output: ' + String(r.stderr || '').slice(0, 300));
    const buf = await out.arrayBuffer();
    self.postMessage({ id, type: 'done', out: buf }, [buf]);
  } catch (e: any) {
    self.postMessage({ id, type: 'error', error: String(e?.message || e) });
  }
};
