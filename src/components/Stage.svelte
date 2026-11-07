<script lang="ts">
  // The gauge (ekranlar.js stage()). One persistent action slot #sg-act (T1): it is never inside a {#key} or moved between {#if}
  // branches, so Convert → Stop → Save is a relabel of the same node and focus stays on it. Value layers ({#key k}) cross-fade
  // 80 out / 120 in; the outgoing layer is pinned out of flow (HAREKET §11.1). Keyboard-triggered swaps are instant.
  import { fade } from 'svelte/transition';
  import { q, readyCount, canShareItem, type Item } from '../lib/queue.svelte';
  import { fmt, type F } from '../lib/fmt';
  import { T, d, pin, easeTurn } from '../lib/motion';
  import { isReady, isJob, outName, engVal, viewOf, engWord } from '../lib/view';
  import Readout from './Readout.svelte';
  import Picker from './Picker.svelte';
  import Arrow from './Arrow.svelte';
  import Fname from './Fname.svelte';
  import Icon from './Icon.svelte';
  import Ar from './Ar.svelte';
  import Dash from './Dash.svelte';
  import Dim from './Dim.svelte';

  type Acts = { choose: () => void; convert: () => void; stop: (id: number) => void; stopAll: () => void; save: (id: number) => void; share: (id: number) => void; retry: (id: number) => void; remove: (id: number) => void; pick: (it: Item, label: string) => void; removeEngines: () => void };
  let { x, sub, count, completing, shown, instant, touch, acts }: { x: F; sub: Item | null; count: boolean; completing: boolean; shown: boolean; instant: boolean; touch: boolean; acts: Acts } = $props();
  const t = $derived(x.t);
  const items = $derived(q.items);
  const n = $derived(items.length);
  const view = $derived(sub ? viewOf(sub, completing, shown) : null);
  const k = $derived(count ? 'count' : sub ? `${sub.id}:${view}` : 'empty');
  const pos = $derived(n > 1 && sub && !count ? [items.indexOf(sub) + 1, n] : null);
  const ready = $derived(readyCount());
  const jobs = $derived(items.filter(isJob).length);
  const sOut = $derived(instant ? 0 : d(T.swapOut));
  const sIn = $derived(instant ? 0 : d(T.swapIn));
  const tin = (node: Element) => fade(node, { duration: sIn, delay: sOut, easing: easeTurn });
  const tout = (node: Element) => fade(node, { duration: sOut, easing: easeTurn });

  // count mode figures
  const cd = $derived(items.filter((f) => f.st === 'done'));
  const crun = $derived(items.filter((f) => f.st === 'running').length);
  const pairs = $derived([...new Set(items.map((f) => `${f.f}|${f.to}`))]);

  const label = $derived.by(() => {
    if (count) return fmt(t.stage.batch, { n });
    switch (view) {
      case 'needs': return t.st.needs;
      case 'ready': return t.st.ready;
      case 'engine': return t.stage.preparing;
      case 'block': return t.stage.notStarted;
      case 'running': return t.stage.converting;
      case 'done': return t.stage.result;
      case 'failed': return t.stage.failed;
      case 'unsupported': return t.stage.cantOpen;
      case 'offline': return t.stage.offline;
    }
    return '';
  });

  // the slot: one node, label / weight / action follow the state
  type Slot = { label: string; cls: string; dis?: boolean; why?: string; aria?: string; run: () => void };
  const convertSlot = (why?: string): Slot => ({ label: n > 1 ? x.plural(ready, t.btn.convertOne, t.btn.convertN) : t.btn.convert, cls: 'prim', dis: !ready, why, run: acts.convert });
  const slot = $derived.by((): Slot | null => {
    if (count) return { label: t.btn.stopAll, cls: '', run: acts.stopAll };
    const f = sub; if (!f) return null;
    const anyReady = items.some(isReady);
    switch (view) {
      case 'needs': return convertSlot('sg-why');
      case 'ready': return f.st === 'running' || f.st === 'queued' ? stopSlot(f) : convertSlot();
      case 'block': return anyReady ? convertSlot('sg-why') : removeSlot(f); // nothing can start: the way out is Remove (K: no dead "Convert 0 files")
      case 'engine': case 'running': return { ...stopSlot(f), dis: completing };
      case 'done': return { label: t.btn.save, cls: 'prim', aria: n > 1 ? fmt(t.a11y.save, { name: outName(f) }) : undefined, run: () => acts.save(f.id) };
      case 'failed': return { label: t.btn.tryAgain, cls: '', run: () => acts.retry(f.id) };
      default: return anyReady ? convertSlot() : removeSlot(f);
    }
  });
  const removeSlot = (f: Item): Slot => ({ label: t.btn.remove, cls: '', aria: fmt(t.a11y.remove, { name: f.n }), run: () => acts.remove(f.id) });
  function stopSlot(f: Item): Slot {
    return jobs > 1 ? { label: t.btn.stopThis, cls: '', aria: fmt(t.a11y.stopThis, { name: f.n }), run: () => acts.stop(f.id) } : { label: t.btn.stop, cls: '', aria: fmt(t.a11y.stop, { name: f.n }), run: () => acts.stop(f.id) };
  }
  const secondRemove = $derived(!!sub && !count && (view === 'failed' || ((view === 'unsupported' || view === 'offline') && items.some(isReady))));
  const pctV = $derived(sub?.p != null ? Math.round((completing ? 1 : sub.p) * 100) : null);
  const engP = $derived(q.engine?.p ?? 0);
  const est = $derived(!!sub && sub.approx && sub.o != null);
  const kindIsBatch = $derived(!!sub && sub.k === 'image' && items.filter((f) => f.k === sub!.k && (f.st === 'needs' || isReady(f))).length > 1);
  function onLoad(e: Event) { (e.currentTarget as HTMLElement).classList.add('ok'); }
</script>

{#snippet fig(a: string, u: string, pre = false)}<span class="fig">{#if pre}<span class="u">{a}</span>{u}{:else}{a}<span class="u">{u ? ' ' + u : ''}</span>{/if}</span>{/snippet}
{#snippet pctFig(p: number)}{@const pp = x.pctParts(p)}<span class="fig">{#if pp[2]}<span class="u">{pp[0]}</span>{pp[1]}{:else}{pp[0]}<span class="u">{pp[1]}</span>{/if}</span>{/snippet}<!-- "64%": no space before % (hi-fi pctFig) -->
{#snippet inFig(mb: number)}{@const sp = x.sizeParts(mb)}{@render fig(sp[0], sp[1])}<span class="from">{t.stage.input}</span>{/snippet}
{#snippet conv(f: Item)}{f.f} <Ar to={t.sr.to} /> {#if f.to}{f.to}{:else}<Dash sr={t.sr.pending} />{/if}{/snippet}
{#snippet sizeIn()}{x.size(sub!.i)} <Ar to={t.sr.to} /> <Dash sr={t.sr.pending} />{/snippet}
{#snippet sizeEst()}{x.size(sub!.i)} <Ar to={t.sr.to} /> <span aria-hidden="true">≈ </span><span class="sr">{t.sr.approx} </span>{x.size(sub!.o)}{/snippet}
{#snippet sizeDone()}{x.size(sub!.i)} <Ar to={t.sr.to} /> {x.size(sub!.o)}{/snippet}
{#snippet sizeOnly()}{x.size(sub!.i)}{/snippet}
{#snippet fmtCur()}{@render conv(sub!)}{/snippet}
{#snippet fmtFrom()}{sub!.f} <Ar to={t.sr.to} /> <Dash sr={t.sr.pending} />{/snippet}
{#snippet resName()}{outName(sub!)}{/snippet}
{#snippet cntFmt()}{@const [a, b] = pairs[0].split('|')}{a} <Ar to={t.sr.to} /> {b}{/snippet}
{#snippet cntSize()}{x.size(cd.reduce((s, f) => s + f.i, 0))} <Ar to={t.sr.to} /> {x.size(cd.reduce((s, f) => s + (f.o ?? 0), 0))}{/snippet}

{#if !sub && !count}
  <div class="sg-main sg-hero">
    <div><span class="lbl">{t.kick}</span><h1>{#each t.h1.split(/(?<=\.)\s+/) as ln, i}{i ? ' ' : ''}<span class="ln">{ln}</span>{/each}</h1><p class="lead">{t.lead}</p></div>
    <div class="go-wrap"><div class="go"><button class="btn volt" type="button" data-volt="button" data-testid="choose" onclick={acts.choose}>{t.choose}</button><span class="s fine">{t.dropAny}</span></div><ul class="proof">{#each t.proof as p}<li>{p}</li>{/each}</ul></div>
  </div>
  <div class="sg-side"><Readout {t} /></div>
{:else}
  <div class="sg-main">
    <div class="sg-head"><span class="lbl">{label}</span>{#if pos}<span class="pos"><span aria-hidden="true">{pos[0]} / {pos[1]}</span><span class="sr">{fmt(t.sr.fileOf, { i: pos[0], n: pos[1] })}</span></span>{/if}<span class="sp"></span></div>

    {#key k}
      <div class="sg-name" aria-hidden={count ? 'true' : undefined} in:tin out:tout onoutrostart={pin}>{#if sub && !count}<Fname n={sub.n} />{/if}</div>
    {/key}

    {#if view === 'done' && !count && sub?.pv}
      {@const pv = sub.pv}
      {#key k}
        <figure class="pv tile" style="margin:0" in:tin out:tout onoutrostart={pin}>
          {#if pv.kind === 'img'}<img src={pv.url} alt="" decoding="async" onload={onLoad} />
          {:else if pv.kind === 'video'}<video src={pv.url} muted playsinline controls preload="metadata" onloadeddata={onLoad}></video>
          {:else if pv.kind === 'audio'}<svg class="scn" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 160V96L70 52 120 84 190 30 262 92 312 64 400 112V160Z" fill="var(--c-line)" /><path d="M0 160V124L90 98 170 126 250 96 330 120 400 104V160Z" fill="var(--c-line-strong)" opacity=".5" /></svg><audio src={pv.url} controls preload="metadata"></audio>
          {:else}<pre class="txt">{pv.text}</pre>{/if}
          {#if sub.w && sub.h && (pv.kind === 'img' || pv.kind === 'video')}<figcaption class="cap"><Dim w={sub.w} h={sub.h} by={t.sr.by} /></figcaption>{/if}
        </figure>
      {/key}
    {/if}

    {#key k}
      {#if count}
        <div class="sg-meter" in:tin out:tout onoutrostart={pin}><span role="progressbar" aria-label={fmt(t.stage.batch, { n })} aria-valuemin="0" aria-valuemax={n} aria-valuenow={cd.length} aria-valuetext={fmt(t.sr.count, { d: cd.length, n })}><span class="fig">{cd.length}<span class="u"> {fmt(t.stage.of, { n })}</span></span></span></div>
      {:else if sub && (view === 'failed' || view === 'unsupported' || view === 'offline')}
        <div class="sg-say" in:tin out:tout onoutrostart={pin}>
          {#if view === 'failed'}<Icon n="error" cls="err" /><h2>{sub.error === 'noText' ? t.err.noText : t.err.orig}</h2>
          {:else if view === 'unsupported'}<Icon n={sub.k} cls="neu" /><h2>{fmt(t.unsup.h, { ext: sub.f })}</h2><p><a href="#formats">{t.unsup.a}</a></p>
          {:else}<Icon n="engine" cls="neu" /><h2 class="long">{fmt(t.off.needs, { size: x.dl(q.sizes.av?.transfer) })}</h2><p>{t.off.works}</p>{/if}
        </div>
      {:else if sub}
        <div class="sg-meter" in:tin out:tout onoutrostart={pin}>
          {#if view === 'needs'}{@render inFig(sub.i)}
          {:else if view === 'ready'}{#if est}{@const sp = x.sizeParts(sub.o!)}<span class="fig"><span class="u" aria-hidden="true">≈ </span><span class="sr">{t.sr.approx} </span>{sp[0]}<span class="u"> {sp[1]}</span></span>{:else}{@render inFig(sub.i)}{/if}
          {:else if view === 'engine'}{@render pctFig(engP)}
          {:else if view === 'block'}{@const sp = x.sizeParts(sub.block!.need)}{@render fig(sp[0], sp[1])}<span class="from">{t.stage.needs}</span>
          {:else if view === 'running'}
            {#if pctV == null}{@render inFig(sub.i)}<Arrow p={0} cls="xl" />
            {:else}<span role="progressbar" aria-label={sub.n} aria-valuemin="0" aria-valuemax="100" aria-valuenow={pctV} aria-valuetext={fmt(t.sr.pct, { pct: pctV })}>{@render pctFig(pctV / 100)}</span><Arrow p={pctV / 100} cls="xl" />{/if}
          {:else if view === 'done'}{@const sp = x.sizeParts(sub.o ?? 0)}{@render fig(sp[0], sp[1])}{/if}
        </div>
      {/if}
    {/key}

    <div class="sg-foot">
      {#key k}
        {#if count}
          <span class="ruler" style="--n:{n}" aria-hidden="true" in:tin out:tout onoutrostart={pin}>{#each items as f (f.id)}<i class={f.st === 'done' ? 'd' : f.st === 'running' ? 'r' : ''}></i>{/each}</span>
        {:else if sub && (view === 'needs' || (view === 'ready' && !isJob(sub)))}
          <div in:tin out:tout onoutrostart={pin}><Picker it={sub} legend={kindIsBatch ? t.batch.target : t.pick.legend} more={t.pick.more} onpick={(l) => acts.pick(sub!, l)} /></div>
        {:else if view === 'engine'}
          <span class="ebar" data-volt="engine" aria-hidden="true" style="--p:{engP}" in:tin out:tout onoutrostart={pin}><i></i></span>
        {:else if view === 'block' && sub}
          <div class="notice bare" id="q-notice" in:tin out:tout onoutrostart={pin}><Icon n="storage" /><span class="h">{t.quota.h}</span><p class="data" style="color:var(--c-ink)"><span class="sg">{fmt(t.quota.canUse, { size: x.size(sub.block!.free) })}</span></p><p>{t.quota.p}</p>{#if Object.values(q.saved).some(Boolean)}<div class="acts"><button class="btn sm quiet" type="button" onclick={acts.removeEngines}>{t.quota.acts[1]}</button></div>{/if}</div>
        {:else if view === 'done'}
          <span class="pill" data-volt="pill" in:tin out:tout onoutrostart={pin}><Icon n="done" s16 /><span aria-hidden="true">{t.sig}</span><span class="sr">{t.sr.onDevice}</span></span>
        {/if}
      {/key}
      {#key k}
        {#if count}<span class="data big" in:tin out:tout onoutrostart={pin}>{fmt(t.batch.running, { n: crun })}</span>
        {:else if view === 'engine'}<span class="data" in:tin out:tout onoutrostart={pin}>{fmt(t.engLine, { engine: engWord(t, sub?.eng ?? undefined), size: x.dl(sub?.eng ? q.sizes[sub.eng]?.transfer : null) })}</span>{/if}
      {/key}
      <div class="acts">
        {#if slot}
          <button class="btn {slot.cls}" id="sg-act" type="button" data-testid="act" aria-disabled={slot.dis ? 'true' : undefined} aria-describedby={slot.why} aria-label={slot.aria} onclick={() => { if (!slot.dis) slot.run(); }}>{slot.label}</button>
        {/if}
        {#key k}
          {#if view === 'done' && sub && touch && sub.out?.type.split('/')[0] !== 'audio' && canShareItem(sub)}<button class="btn full touch" type="button" in:tin out:tout onoutrostart={pin} onclick={() => acts.share(sub!.id)}>{t.btn.share}</button>{/if}
          {#if secondRemove && sub}<button class="btn quiet" type="button" aria-label={fmt(t.a11y.remove, { name: sub.n })} in:tin out:tout onoutrostart={pin} onclick={() => acts.remove(sub!.id)}>{t.btn.remove}</button>{/if}
          {#if view === 'needs'}<span class="note" id="sg-why" in:tin out:tout onoutrostart={pin}>{t.pick.reason}</span>
          {:else if view === 'ready' && sub && !isJob(sub)}<span class="note" in:tin out:tout onoutrostart={pin}>{est ? t.stage.estNote : t.stage.noEst}</span>
          {:else if view === 'block' && items.some(isReady) && sub}<span class="note" id="sg-why" in:tin out:tout onoutrostart={pin}>{fmt(t.stage.leftOut, { name: sub.n })}</span>
          {:else if view === 'running' && pctV == null && sub?.eng === 'doc'}<span class="note" in:tin out:tout onoutrostart={pin}>{t.stage.noPct}</span>{/if}
        {/key}
      </div>
    </div>
  </div>
  <div class="sg-side">
    {#if count}
      <Readout {t} engine={engVal(x, items.find((f) => f.st === 'running') ?? null) ?? t.engVal.imageSaved} format={pairs.length === 1 ? cntFmt : null} size={cd.length ? cntSize : null} result={fmt(t.batch.doneOf, { d: cd.length, n })} />
    {:else if sub}
      <Readout {t} engine={view === 'unsupported' ? null : engVal(x, sub)} format={view === 'unsupported' ? sub.f : view === 'needs' ? fmtFrom : fmtCur}
        size={view === 'done' ? sizeDone : view === 'ready' ? (est ? sizeEst : sizeIn) : view === 'running' ? sizeIn : sizeOnly}
        result={view === 'done' ? resName : null} />
    {/if}
  </div>
{/if}
