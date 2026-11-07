<script lang="ts">
  // WAVE 0 PLACEHOLDER: proves the core flow (pick → target → convert → save). Wave 1 replaces this with the hi-fi port.
  import { onMount } from 'svelte';
  import { q, add, setTarget, convert, save, refreshDevice, readyCount } from '../lib/queue.svelte';
  import type { Lang } from '../i18n';
  let { lang }: { lang: Lang } = $props();
  let input: HTMLInputElement;
  onMount(() => {
    const w = window as any;
    w.__convyReady = true;
    if (w.__convyPending?.length) add(w.__convyPending.splice(0));
    refreshDevice();
  });
</script>

<main id="main" class="wrap tool" tabindex="-1">
  <section class="panel stage" id="stage" tabindex="-1">
    <input bind:this={input} type="file" multiple data-testid="pick" onchange={() => { if (input.files) add(input.files); input.value = ''; }} />
    {#each q.items as it (it.id)}
      <div class="row" data-testid="item" data-st={it.st}>
        <span>{it.n} · {it.f} · {it.st}{it.p != null ? ` ${Math.round(it.p * 100)}%` : ''}{it.dim ? ` · ${it.dim}` : ''}</span>
        <select data-testid="target" onchange={(e) => setTarget(it.id, (e.target as HTMLSelectElement).value)}>
          <option value="">—</option>
          {#each it.targets as t}<option value={t}>{t}</option>{/each}
        </select>
        {#if it.st === 'done'}<button class="btn" data-testid="save" onclick={() => save(it.id)}>Save</button>{/if}
      </div>
    {/each}
    <button class="btn prim" id="sg-act" data-testid="convert" disabled={!readyCount()} onclick={convert}>Convert</button>
    {#if q.engine}<p data-testid="engine">engine {q.engine.key} {Math.round(q.engine.p * 100)}%</p>{/if}
  </section>
</main>
