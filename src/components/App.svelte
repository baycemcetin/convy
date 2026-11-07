<script lang="ts">
  // Tool page island: header tools, device panel, stage, queue log. Howband (children) and wordmark (wm) are static Astro slots.
  // Stage subject rule (veri.js): oldest running job; else the file that needs attention; else the last result. A row's name button
  // pins a file (T1). The stage keeps a subject ≥ 1200 ms; ≥ 2 completions inside that window switch it to count mode (HAREKET §3.1).
  import { onMount, tick, type Snippet } from 'svelte';
  import { q, add, setTarget, applyToKind, convert, stop, stopAll, retry, remove, stage, save, share, saveZip, reconvert, refreshDevice, removeEngines, byIdItem, type Item } from '../lib/queue.svelte';
  import { formatter, fmt } from '../lib/fmt';
  import { announcer } from '../lib/live';
  import { T, d } from '../lib/motion';
  import { isJob, isReady, outName } from '../lib/view';
  import type { Lang, Copy } from '../i18n';
  import Stage from './Stage.svelte';
  import Log from './Log.svelte';
  import DevicePanel from './DevicePanel.svelte';
  import Icon from './Icon.svelte';

  let { lang, t: copyT, wm, children }: { lang: Lang; t: Copy; wm?: Snippet; children?: Snippet } = $props();
  const x = formatter(lang, copyT);
  const t = x.t;
  let input: HTMLInputElement;
  let chipEl: HTMLButtonElement;
  let dp: DevicePanel;
  let panelOpen = $state(false);
  let menuOpen = $state(false);
  let dragging = $state(false);
  let touch = $state(false);
  const live = typeof window === 'undefined' ? null : announcer();

  // ---- subject, dwell, count mode ----
  let pinned = $state<number | null>(null);
  let instant = $state(false);
  let subId = $state<number | null>(null);
  let since = 0;
  let count = $state(false);
  let completing = $state<number[]>([]);
  let shown = $state<number[]>([]);
  const doneTimes: number[] = [];
  let dwellT = 0, countT = 0;

  function rule(): number | null {
    const it = q.items;
    const pick = (f: (i: Item) => boolean) => it.find(f)?.id;
    return pick((i) => completing.includes(i.id)) ?? pick((i) => i.st === 'running') ?? pick((i) => i.st === 'queued')
      ?? pick((i) => i.st === 'failed') ?? pick((i) => i.st === 'needs') ?? pick((i) => !!i.block) ?? pick(isReady)
      ?? pick((i) => i.st === 'unsupported' || i.st === 'offline') ?? [...it].reverse().find((i) => i.st === 'done' || i.st === 'cleared')?.id ?? it[0]?.id ?? null;
  }
  $effect(() => {
    const want = pinned != null && byIdItem(pinned) ? pinned : rule();
    if (want === subId) return;
    const cur = byIdItem(subId);
    const wait = pinned === want || !cur ? 0 : T.dwell - (Date.now() - since);
    clearTimeout(dwellT);
    if (wait > 0) { dwellT = window.setTimeout(() => { subId = want; since = Date.now(); }, wait); return; }
    subId = want; since = Date.now();
  });
  const sub = $derived(count ? null : byIdItem(subId));

  // ---- transitions of item state: live region, completing hold, t-show, count mode ----
  const prev = new Map<number, { st: string; block: boolean }>();
  let prevEngine: string | null = null;
  let engineSaid = false;
  // batch boundary (live.batch): the jobs one Convert press created + jobs that join while that batch still runs
  const batchIds = new Set<number>();
  let batchOpen = false;
  $effect(() => {
    const items = q.items.map((i) => ({ i, st: i.st, block: !!i.block }));
    const running = q.items.filter(isJob).length;
    for (const { i, st, block } of items) {
      const p = prev.get(i.id);
      if (!p) {
        live?.say(i.empty ? fmt(t.live.empty, { name: i.n }) : st === 'unsupported' ? fmt(t.live.unsupported, { name: i.n, ext: i.f }) : fmt(st === 'needs' ? t.live.needs : t.live.added, { name: i.n, size: x.say(i.i) }));
      } else if (p.st !== st) {
        if ((st === 'queued' || st === 'running') && !batchIds.has(i.id)) { if (!batchOpen) { batchIds.clear(); batchOpen = true; } batchIds.add(i.id); }
        if (st === 'running') setTimeout(() => shown = [...shown, i.id], T.tShow);
        if (st === 'done') onDone(i, running);
        if (st === 'cancelled') live?.say(fmt(t.live.stopped, { name: i.n }));
        if (st === 'offline') live?.say(fmt(t.live[({ av: 'offline', image: 'offlineImage', doc: 'offlineDoc', pdf: 'offlinePdf' } as const)[i.eng ?? 'av']], { name: i.n, size: x.dl(q.sizes[i.eng ?? 'av']?.transfer) }));
        if (st === 'failed') live?.failed(i.n, (name) => { const w = i.error && (t.err.tag as Record<string, string>)[i.error]; return w ? fmt(t.live.failedWhy, { name, why: w }) : fmt(t.live.failed, { name }); }, (f, names) => fmt(t.live.failedN, { f, names }));
      }
      if (block && !p?.block) live?.say(fmt(t.live.blocked, { name: i.n, size: x.say(i.i) }));
      prev.set(i.id, { st, block });
    }
    if (!running) batchOpen = false;
    const e = q.engine?.key ?? null;
    if (prevEngine === 'av' && !e && !engineSaid && q.items.some((i) => i.eng === 'av' && i.st === 'running')) { engineSaid = true; live?.say(t.live.engine); } // once: ffmpeg reloads from cache per job
    prevEngine = e;
    if (count && running <= 1) { clearTimeout(countT); countT = window.setTimeout(() => { if (q.items.filter((i) => i.st === 'running').length <= 1) count = false; }, T.dwell); }
  });
  function onDone(i: Item, running: number) {
    const hold = d(T.fill + T.done);
    if (hold && !count) { completing = [...completing, i.id]; setTimeout(() => (completing = completing.filter((n) => n !== i.id)), hold); }
    const now = Date.now(); doneTimes.push(now);
    while (doneTimes.length && now - doneTimes[0] > T.dwell) doneTimes.shift();
    if (doneTimes.length >= 2) count = true;
    const ids = new Set(batchIds);
    const batch = q.items.filter((f) => ids.has(f.id));
    // last job of an all-done batch → live.batch with sizes summed over this batch only; otherwise "d of n converted" (HAREKET §5.1)
    const summary = () => {
      const dn = batch.filter((f) => f.st === 'done');
      return running === 0 && dn.length === batch.length
        ? fmt(t.live.batch, { n: dn.length, in: x.say(dn.reduce((s, f) => s + f.i, 0)), out: x.say(dn.reduce((s, f) => s + (f.o ?? 0), 0)) })
        : fmt(t.live.progress, { d: dn.length, n: batch.length });
    };
    live?.done(fmt(t.live.done, { name: outName(i), in: x.say(i.i), out: x.say(i.o ?? 0) }), summary, () => q.items.filter(isJob).length, running === 0);
  }

  // ---- actions ----
  function choose() { input.click(); }
  function picked() { if (input.files?.length) ingest(input.files); input.value = ''; }
  function doConvert() { pinned = null; convert(); live?.say(t.live.start); }
  async function doRemove(id: number, e?: MouseEvent) {
    const it = byIdItem(id); if (!it) return;
    const fromRow = !!(e?.currentTarget as Element | null)?.closest('.row'); // read before any await
    const i = q.items.indexOf(it);
    if (e?.detail === 0) { instant = true; setTimeout(() => (instant = false), T.exit + 200 + 50); } // keyboard: no exit, no FLIP, no stage swap (HAREKET §3.4)
    remove(id); if (pinned === id) pinned = null;
    live?.say(fmt(t.live.removed, { name: it.n }));
    await tick();
    // focus never falls to <body> (KALDIR-VE-SILINDI §1.4): next row's name, else the previous one; one file left or Remove on the stage → the slot; nothing left → Choose files
    const next = q.items[Math.min(i, q.items.length - 1)];
    const target = (fromRow && q.items.length > 1 && next && document.getElementById('nm-' + next.id)) || document.getElementById('sg-act') || document.querySelector<HTMLElement>('[data-testid=choose]');
    target?.focus();
  }
  function pick(it: Item, label: string) {
    const batch = it.k === 'image' && q.items.filter((f) => f.k === it.k && (f.st === 'needs' || isReady(f))).length > 1;
    if (batch) applyToKind(it.k, label); else setTarget(it.id, label);
  }
  function doStage(id: number, e: MouseEvent) {
    instant = e.detail === 0; // keyboard: the stage swaps with 0 ms (HAREKET §3.4); focus stays on the name button
    pinned = id; stage(id);
    setTimeout(() => (instant = false), T.swapOut + T.swapIn);
  }
  function doRetry(id: number) { retry(id); live?.say(t.live.start); }
  async function doStopAll() {
    stopAll(); await tick();
    if (!document.activeElement || document.activeElement === document.body) document.getElementById('sg-act')?.focus(); // the header button is gone now
  }
  const stageActs = { choose, convert: doConvert, stop, stopAll: doStopAll, save, share, reconvert, retry: doRetry, remove: doRemove, pick, removeEngines };
  const logActs = { add: choose, stopAll: doStopAll, saveZip, save, reconvert, retry: doRetry, remove: doRemove, stage: doStage, pick };
  const delays = new Map<number, number>();
  const delay = (id: number) => (delays.get(id) ?? 0) * T.stagger;
  function ingest(files: FileList | File[]) {
    add(files, (fresh) => fresh.forEach((it, k) => delays.set(it.id, Math.min(k, 7)))); // stagger only inside one drop
  }

  onMount(() => {
    const w = window as any;
    w.__convyReady = true;
    if (w.__convyPending?.length) ingest(w.__convyPending.splice(0));
    refreshDevice();
    touch = matchMedia('(pointer: coarse)').matches;
    document.addEventListener('touchstart', () => {}, { passive: true }); // iOS :active (HAREKET §11.5 b)
    let dragT = 0;
    const over = (e: DragEvent) => { if (!e.dataTransfer?.types.includes('Files')) return; e.preventDefault(); dragging = true; clearTimeout(dragT); dragT = window.setTimeout(() => (dragging = false), 150); };
    const drop = (e: DragEvent) => { if (!e.dataTransfer?.files.length) return; e.preventDefault(); dragging = false; ingest(e.dataTransfer.files); };
    const mq = matchMedia('(min-width:768px)');
    const wide = () => { if (mq.matches) menuOpen = false; };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && menuOpen && !panelOpen) { menuOpen = false; document.querySelector<HTMLElement>('.menu-btn')?.focus(); } };
    document.addEventListener('dragover', over); document.addEventListener('drop', drop); mq.addEventListener('change', wide); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('dragover', over); document.removeEventListener('drop', drop); mq.removeEventListener('change', wide); document.removeEventListener('keydown', esc); };
  });
  const engOnStage = $derived(!!sub && !!q.engine && sub.eng === q.engine.key && isJob(sub));
  const other = lang === 'en' ? 'tr' : 'en';
</script>

<header class="bar"><div class="wrap">
  <a class="wm" href={lang === 'tr' ? '/tr/' : '/'} aria-label="Convy">{@render wm?.()}</a>
  <nav id="nav" class:open={menuOpen} aria-label={t.a11y.nav}>{#each t.nav as label, i}<a href={i === 1 ? '#how-h' : '#'} onclick={() => (menuOpen = false)}>{label}</a>{/each}</nav>
  <span class="sp"></span>
  <div class="tools">
    {#if !q.online}<span class="tag-off"><i></i><span class="t1">{t.offline}</span></span>{/if}
    <a class="lang" href={other === 'tr' ? '/tr/' : '/'} hreflang={other} lang={other}>{t.other}</a>
    <button class="chip-dev" type="button" bind:this={chipEl} aria-haspopup="dialog" aria-expanded={panelOpen} aria-controls="dp" aria-label={t.dev} onclick={(e) => (panelOpen ? dp.close() : dp.show(e.detail === 0))}><Icon n="device" s16 /><span class="t">{t.dev}</span></button>
    <button class="menu-btn" type="button" aria-label={t.menu} aria-expanded={menuOpen} aria-controls="nav" onclick={() => (menuOpen = !menuOpen)}><i></i></button>
  </div>
</div></header>
<DevicePanel bind:this={dp} bind:open={panelOpen} {x} chip={() => chipEl} />

<main id="main" class="wrap tool" tabindex="-1">
  {#if q.items.length}<h1 class="sr">{t.h1}</h1>{/if}
  <section class="panel stage" class:empty={!q.items.length} class:drop={dragging} id="stage" tabindex="-1" aria-label={t.a11y.stage}>
    <input bind:this={input} type="file" multiple hidden data-testid="pick" onchange={picked} />
    <Stage {x} {sub} {count} completing={!!sub && completing.includes(sub.id)} shown={!!sub && shown.includes(sub.id)} {instant} {touch} acts={stageActs} />
  </section>
  <Log {x} {instant} subId={sub?.id ?? null} {count} {completing} {engOnStage} {delay} acts={logActs} />
  {@render children?.()}
</main>
