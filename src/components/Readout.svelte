<script lang="ts">
  // Fixed fields in a fixed order; unknown = "—" (the gauge waits for data, it never guesses). Values change instantly (HAREKET §3.1).
  import type { Snippet } from 'svelte';
  import type { Copy } from '../i18n';
  import Dash from './Dash.svelte';
  type V = string | null | undefined | Snippet;
  let { t, engine, format, size, result, where }: { t: Copy; engine?: V; format?: V; size?: V; result?: V; where?: V } = $props();
  const rows = $derived([['engine', engine], ['format', format], ['size', size], ['result', result], ['where', where === undefined ? t.whereVal : where]] as [keyof Copy['lbl'], V][]);
</script>
<dl class="readout">
  {#each rows as [k, v] (k)}
    <div><dt class="lbl">{t.lbl[k]}</dt><dd class={v ? '' : 'unk'}>{#if typeof v === 'function'}{@render v()}{:else if v}{v}{:else}<Dash sr={t.sr.pending} />{/if}</dd></div>
  {/each}
</dl>
