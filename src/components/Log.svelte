<script lang="ts">
  // Queue log (ekranlar.js log() + bilesen.js row()). Header = batch tools only. One file: the stage says everything, the queue is only
  // the way to add more (K2). Rows enter with fly 8 px + stagger, leave with fade + flip (HAREKET §3.4, §6.1).
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { q, type Item } from '../lib/queue.svelte';
  import { ENGINES } from '../engines/load-wasm';
  import { fmt, type F } from '../lib/fmt';
  import { T, d, easeTurn } from '../lib/motion';
  import { isJob, outName, stateWord, engWord } from '../lib/view';
  import Icon from './Icon.svelte';
  import Fname from './Fname.svelte';
  import Arrow from './Arrow.svelte';
  import Ar from './Ar.svelte';
  import Dim from './Dim.svelte';

  type Acts = { add: () => void; stopAll: () => void; saveZip: () => void; save: (id: number) => void; retry: (id: number) => void; remove: (id: number) => void; stage: (id: number, e: MouseEvent) => void; pick: (it: Item, label: string) => void };
  let { x, subId, count, completing, engOnStage, delay, acts }: { x: F; subId: number | null; count: boolean; completing: Set<number>; engOnStage: boolean; delay: (id: number) => number; acts: Acts } = $props();
  const t = $derived(x.t);
  const items = $derived(q.items);
  const n = $derived(items.length);
  const done = $derived(items.filter((f) => f.st === 'done'));
  const failed = $derived(items.filter((f) => f.st === 'failed').length);
  const left = $derived(n - done.length);
  const jobs = $derived(items.filter(isJob).length);
  // Volt budget (KIMLIK §1, DECISIONS 2026-11-07): arrows of processing jobs + engine bar ≤ 3; the bar turns neutral as the 4th
  const arrows = $derived(items.filter((f) => f.st === 'running' && (f.p != null || completing.has(f.id))).length);
  const eng = $derived(q.engine && !engOnStage ? q.engine : null);
  const engBefore = $derived(eng ? items.find((f) => f.eng === eng.key && isJob(f))?.id ?? null : null);
  type R = { key: string; it?: Item };
  const rows = $derived<R[]>(items.flatMap((it) => (it.id === engBefore ? [{ key: 'eng' }, { key: 'r' + it.id, it }] : [{ key: 'r' + it.id, it }])));
  const zipSize = $derived(done.reduce((a, f) => a + (f.o ?? 0), 0));
  const inT = (node: Element, o: { id: number }) => fly(node, { y: 8, duration: d(T.enter), delay: d(delay(o.id)), easing: easeTurn });
</script>

{#snippet seg(last = false)}{#if !last}{' '}<span class="sep" aria-hidden="true">·</span>{/if}{/snippet}

{#if n === 1}
  <section class="log solo" aria-label={t.lbl.queue}><div class="go"><button class="btn" type="button" onclick={acts.add}>{t.btn.add}</button><span class="s fine">{t.dropAny}</span></div></section>
{:else if n > 1}
  {@const zipBtn = done.length > 0}
  <section class="log" aria-labelledby="q-h">
    <div class="log-hd">
      <div><span class="lbl">{t.lbl.queue}</span><h2 id="q-h"><span class="sg">{x.plural(n, t.batch.fileOne, t.batch.files)}{@render seg()}</span> <span class="sg">{x.size(items.reduce((a, f) => a + f.i, 0))}</span></h2></div>
      <div class="acts">
        <button class="btn" type="button" onclick={acts.add}>{t.btn.add}</button>
        {#if jobs > 1 && !count}<button class="btn" type="button" onclick={acts.stopAll}>{t.btn.stopAll}</button>{/if}
        {#if zipBtn}<button class="btn" type="button" data-testid="zip" aria-describedby={left ? 'zip-why' : undefined} onclick={acts.saveZip}>{fmt(t.btn.saveDone, { d: done.length })}</button>{/if}
      </div>
      {#if zipBtn && left}<p class="zipnote small" id="zip-why">{t.batch.zipOnly}</p>{/if}
    </div>
    {#each rows as r (r.key)}
      {@const it = r.it}
      {@const staged = !!it && it.id === subId && !count}
      {@const comp = !!it && completing.has(it.id)}
      {@const run = !!it && (it.st === 'running' || comp)}
      {@const ep = eng?.p ?? 0}
      <div class={it ? `row ${it.st}${staged ? ' staged' : ''} pick` : 'eng'} data-testid={it ? 'item' : undefined} data-st={it?.st} data-saved={it?.saved ? '' : undefined}
        in:inT={{ id: it?.id ?? -1 }} out:fade={{ duration: d(T.exit) }} animate:flip={{ duration: d(200), easing: easeTurn }}>
        {#if !it}
          <Icon n="engine" /><span class="t">{fmt(t.engLine, { engine: engWord(t, eng?.key), size: x.dl(eng ? q.sizes[eng.key]?.transfer : null) })}</span>
          {#if arrows + 1 > 3}<span class="ebar neutral" style="--p:{ep}"><i></i></span>{:else}<span class="ebar" data-volt="engine" style="--p:{ep}"><i></i></span>{/if}
          <span class="m data"><span><span class="sg">{x.pct(ep)}{@render seg()}</span> <span class="sg">{ENGINES[eng?.key ?? 'av'].split(/[-@]/)[0]}</span></span>{#if eng?.key === 'av'}<span>{t.engNeed}</span>{/if}</span>

        {:else}
          <Icon n={it.k} />
          <span class="nm"><button class="nm-b" type="button" id="nm-{it.id}" aria-current={staged ? 'true' : undefined} onclick={(e) => acts.stage(it.id, e)}><Fname n={it.n} /></button>{#if staged && t.onGauge}<span class="lbl on" aria-hidden="true">{t.onGauge}</span>{/if}</span>
          {#if !staged}
            <span class="dt"><span class="data">
              <span class="sg">{it.f}{#if it.to}{' '}<Ar to={t.sr.to} />{' '}{it.to}{/if}{@render seg()}</span>
              <span class="sg">{#if it.st === 'done'}{x.size(it.i)} <Ar to={t.sr.to} /> {x.size(it.o)}{:else if it.o != null && it.approx}{x.size(it.i)} <Ar to={t.sr.to} /> <span aria-hidden="true">≈ </span><span class="sr">{t.sr.approx} </span>{x.size(it.o)}{:else}{x.size(it.i)}{/if}{@render seg()}</span>
              {#if it.st === 'done' && it.w && it.h}<span class="sg"><Dim w={it.w} h={it.h} by={t.sr.by} />{@render seg()}</span>{:else if it.st === 'done' && it.k === 'audio' && it.dur}<span class="sg">{x.dur(it.dur)}{@render seg()}</span>{/if}
              <span class="sg"><span class="stx">{#if run && !comp}{#if it.p == null}{t.st.runningNoPct}{:else}{t.st.running.split('{pct}')[0].replace(/\s*·\s*$/, '')}<span aria-hidden="true"> · {x.pct(it.p)}</span>{/if}
                {:else if it.block}<Icon n="storage" s16 cls="neu" />{t.st.blocked}
                {:else if it.st === 'done' || comp}<Icon n="done" s16 />{it.saved ? t.st.saved : t.st.done}
                {:else if it.st === 'failed'}<Icon n="error" s16 cls="err" />{t.st.failed}
                {:else}{stateWord(x, it)}{/if}</span></span>
            </span></span>
          {/if}
          <span class="st">
            {#if it.st === 'done' && !comp && !staged}<button class="btn sm" type="button" data-testid="save" aria-label={fmt(t.a11y.save, { name: outName(it) })} onclick={() => acts.save(it.id)}>{t.btn.save}</button>
            {:else if run && !staged && (it.p != null || comp)}{@const v = comp ? 100 : Math.round((it.p ?? 0) * 100)}<span class="pct" role="progressbar" aria-label={it.n} aria-valuemin="0" aria-valuemax="100" aria-valuenow={v} aria-valuetext={fmt(t.sr.pct, { pct: v })}>{x.pct(v / 100)}</span><Arrow p={v / 100} />
            {:else if (it.st === 'ready' || it.st === 'cancelled') && it.to && !it.block && !staged}<label class="sel" aria-label="{t.pick.legend}, {it.to}">{it.to}<select class="ovl" onchange={(e) => acts.pick(it, e.currentTarget.value)}>{#each it.targets as o (o)}<option value={o} selected={o === it.to}>{o}</option>{/each}</select></label>
            {:else if it.st === 'failed' && !staged}<button class="btn sm" type="button" aria-describedby="nm-{it.id}" onclick={() => acts.retry(it.id)}>{t.btn.tryAgain}</button>
            {:else if it.block && !staged}<button class="btn sm" type="button" aria-label={fmt(t.a11y.remove, { name: it.n })} onclick={() => acts.remove(it.id)}>{t.btn.remove}</button>{/if}
          </span>
          {#if it.st === 'unsupported' && !staged}<span class="more"><span class="msg">{fmt(t.unsup.h, { ext: it.f })} <a href="#formats">{t.unsup.a}</a></span></span>{/if}

        {/if}
      </div>
    {/each}
    <div class="sum"><span class="data">{failed ? fmt(t.batch.failedSum, { d: done.length, f: failed }) : fmt(t.batch.doneOf, { d: done.length, n })}</span>{#if done.length}<span class="r"><span class="data">{#each fmt(t.batch.zip, { size: x.size(zipSize) }).split('≈') as part, i}{#if i}<span aria-hidden="true">≈</span><span class="sr">{t.sr.approx}</span>{/if}{part}{/each}</span>{#if n >= 8}<button class="btn" type="button" aria-describedby={left ? 'zip-why' : undefined} onclick={acts.saveZip}>{fmt(t.btn.saveDone, { d: done.length })}</button>{/if}</span>{/if}</div>
  </section>
{/if}
