<script lang="ts">
  // Target picker: native radios styled as chips (44 px) for the first three outputs; every other output sits in a native select
  // behind "More formats" (hi-fi note: native select in the product). T5: `onpick` may apply the choice to the whole kind.
  // Long lists (Dilim 1: up to 18 entries) are alphabetical, so the select's own type-to-jump works, inside native optgroups by kind
  // (video → audio + animated images; image → images + PDF). Group names: the panel's kind words (images, audio, video, documents).
  import type { Item } from '../lib/queue.svelte';
  import { byId } from '../engines/formats';
  let { it, legend, more, kinds, onpick }: { it: Item; legend: string; more: string; kinds: string[]; onpick: (label: string) => void } = $props();
  const chips = $derived(it.targets.slice(0, 3));
  const rest = $derived(it.targets.slice(3));
  const inRest = $derived(!!it.to && rest.includes(it.to));
  const K: Record<string, number> = { image: 0, audio: 1, video: 2, document: 3, pdf: 3 };
  const groups = $derived(kinds.map((n, k) => ({ n: n[0].toLocaleUpperCase() + n.slice(1), os: rest.filter((o) => K[byId(o.toLowerCase())!.kind] === k).sort((a, b) => a.localeCompare(b)) })));
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
        {#each groups as g (g.n)}{#if g.os.length}<optgroup label={g.n}>{#each g.os as o (o)}<option value={o} selected={o === it.to}>{o}</option>{/each}</optgroup>{/if}{/each}
      </select></label>
    {/if}
  </div>
</fieldset>
