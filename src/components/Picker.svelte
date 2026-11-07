<script lang="ts">
  // Target picker: native radios styled as chips (44 px) for the first three outputs; every other output sits in a native select
  // behind "More formats" (hi-fi note: native select in the product). T5: `onpick` may apply the choice to the whole kind.
  import type { Item } from '../lib/queue.svelte';
  let { it, legend, more, onpick }: { it: Item; legend: string; more: string; onpick: (label: string) => void } = $props();
  const chips = $derived(it.targets.slice(0, 3));
  const rest = $derived(it.targets.slice(3));
  const inRest = $derived(!!it.to && rest.includes(it.to));
</script>
<fieldset class="tpick">
  <legend class="lbl">{legend}</legend>
  <div class="chips">
    {#each chips as o (o)}
      <label class="chip"><input type="radio" name="to-{it.id}" value={o} checked={o === it.to} onchange={() => onpick(o)} /><span>{o}</span></label>
    {/each}
    {#if rest.length}
      <label class="chip more" class:on={inRest}><span>{inRest ? it.to : more}</span><select class="ovl" aria-label={more} onchange={(e) => { const v = e.currentTarget.value; if (v) onpick(v); }}>
        <option value="" selected={!inRest}>{more}</option>
        {#each rest as o (o)}<option value={o} selected={o === it.to}>{o}</option>{/each}
      </select></label>
    {/if}
  </div>
</fieldset>
