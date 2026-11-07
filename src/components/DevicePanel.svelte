<script lang="ts">
  // "This device" (bilesen.js dpanel, TEYIT-ui-tur1 §2-3). T2: ≤ 767 px = bottom sheet, modal (aria-modal + inert background);
  // above = non-modal popover. Always mounted; closed = hidden. Esc / close returns focus to the chip. Keyboard open is instant.
  import { tick } from 'svelte';
  import { q, removeEngines } from '../lib/queue.svelte';
  import { fmt, type F } from '../lib/fmt';
  import Icon from './Icon.svelte';

  let { x, open = $bindable(false), chip }: { x: F; open: boolean; chip: () => HTMLElement | null } = $props();
  const t = $derived(x.t);
  const P = $derived(t.panel);
  let panel: HTMLDivElement;
  let scrim: HTMLDivElement;
  let modal = $state(false);
  let pref = $state<'system' | 'dark' | 'light'>('system');
  const mq = typeof window === 'undefined' ? null : matchMedia('(max-width:767px)');
  const dark = typeof window === 'undefined' ? null : matchMedia('(prefers-color-scheme: light)');

  // inert background = everything on the page except the panel and its scrim (the panel lives inside the island)
  const bg = () => [...document.querySelectorAll('body > *:not(astro-island):not(#live):not(svg), astro-island > *')].filter((el) => el !== panel && el !== scrim) as HTMLElement[];
  function sync() { modal = !!(open && mq?.matches); for (const el of bg()) el.inert = modal; }

  export async function show(keyboard: boolean) {
    open = true;
    if (!keyboard) { panel.classList.add('opening'); scrim.classList.add('opening'); }
    await tick(); sync();
    panel.querySelector<HTMLElement>('[data-close]')?.focus(); // focus at t = 0, never waits for the motion (HAREKET §5)
    requestAnimationFrame(() => requestAnimationFrame(() => { panel.classList.remove('opening'); scrim.classList.remove('opening'); }));
  }
  export function close() {
    if (!open) return;
    open = false; sync(); chip()?.focus();
  }
  $effect(() => {
    mq?.addEventListener('change', sync);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) close(); };
    document.addEventListener('keydown', onKey);
    try { const p = localStorage.getItem('convy-theme'); if (p === 'dark' || p === 'light') pref = p; } catch {}
    const follow = () => { if (pref === 'system') apply(); };
    dark?.addEventListener('change', follow);
    return () => { mq?.removeEventListener('change', sync); document.removeEventListener('keydown', onKey); dark?.removeEventListener('change', follow); };
  });

  // theme: instant; one frame of data-motion="off" so button colour transitions don't ripple (HAREKET §3.8)
  function apply() {
    const r = document.documentElement;
    r.dataset.motion = 'off';
    r.dataset.theme = pref === 'system' ? (dark?.matches ? 'light' : 'dark') : pref;
    requestAnimationFrame(() => requestAnimationFrame(() => { delete r.dataset.motion; }));
  }
  function setTheme(v: typeof pref) {
    pref = v; apply();
    try { if (v === 'system') localStorage.removeItem('convy-theme'); else localStorage.setItem('convy-theme', v); } catch {}
  }

  const keys = ['image', 'av', 'doc'] as const;
  const icons = ['image', 'video', 'document'];
  const savedWord = $derived(P.eng[0][1]), notSavedWord = $derived(P.eng[2][1]);
  const engRow = (k: (typeof keys)[number]) => {
    const saved = k !== 'doc' && q.saved[k];
    const s = k === 'doc' ? null : q.sizes[k];
    return { saved, word: saved ? savedWord : notSavedWord, val: !s ? null : saved ? fmt(P.uses, { size: x.size(s.size) }) : fmt(P.dl, { size: x.dl(s.transfer) }) }; // unknown size: no value (R-2026-13)
  };
  const anySaved = $derived(q.saved.av || q.saved.image);
  const frees = $derived((q.saved.av ? q.sizes.av?.size ?? 0 : 0) + (q.saved.image ? q.sizes.image?.size ?? 0 : 0));
  const other = $derived(x.lang === 'en' ? 'tr' : 'en');
</script>

<div class="scrim" aria-hidden="true" hidden={!open} bind:this={scrim} onclick={close}></div>
<div class="dpanel" id="dp" role="dialog" aria-modal={modal ? 'true' : 'false'} aria-labelledby="dp-t" hidden={!open} bind:this={panel}>
  <div class="dp-hd"><h2 id="dp-t">{P.t}</h2><button class="btn sm quiet ico" type="button" data-close aria-label={t.btn.close} onclick={close}><Icon n="close" s16 /></button></div>
  <div class="dp-sec"><div class="dp-where"><Icon n="device" /><span>{P.where}</span></div></div>
  <div class="dp-sec"><span class="lbl">{P.engT}</span>
    <ul class="dp-list">
      {#each keys as k, i (k)}
        {@const r = engRow(k)}
        <li><Icon n={icons[i]} /><span class="n">{P.eng[i][0]}</span><span class="v{r.saved ? '' : ' no'}">{#if r.val}<span class="sg">{r.word} <span class="sep" aria-hidden="true">·</span></span> <span class="sg">{r.val}</span>{:else}{r.word}{/if}</span></li>
      {/each}
    </ul>
    {#if q.store}<span class="data">{fmt(P.store, { used: x.size(q.store.usage), avail: x.size(Math.max(0, q.store.quota - q.store.usage)) })}</span>{/if}
  </div>
  {#if anySaved}
    <div class="dp-sec">
      <div class="dp-acts"><button class="btn sm" type="button" onclick={removeEngines}><span>{P.removeAll}</span><span class="v">{fmt(P.frees, { size: x.size(frees) })}</span></button></div>
      <span class="small" style="color:var(--c-ink-3)">{P.removeNote} {P.keep}</span>
    </div>
  {/if}
  <div class="dp-sec"><span class="lbl">{P.themeT}</span>
    <div class="seg" role="group" aria-label={P.themeT}>{#each P.theme as label, i}{@const v = (['system', 'dark', 'light'] as const)[i]}<button type="button" aria-pressed={pref === v} onclick={() => setTheme(v)}>{label}</button>{/each}</div>
    <span class="lbl" style="margin-top:4px">{P.langT}</span>
    <div class="seg two" role="group" aria-label={P.langT}>{#each P.lang as label, i}{@const v = i ? 'tr' : 'en'}<button type="button" lang={v} aria-pressed={x.lang === v} onclick={() => { if (v === other) location.href = v === 'tr' ? '/tr/' : '/'; }}>{label}</button>{/each}</div>
  </div>
</div>
