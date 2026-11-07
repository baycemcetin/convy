<script lang="ts">
  // T8: "4032 × 3024" on screen; the "×" is not read. Spoken word = copy key sr.by ("by" / "çarpı"); without it the visible text
  // stays readable as-is.
  let { w, h, by }: { w: number; h: number; by?: string } = $props();
</script>
{#if by}{w}<span aria-hidden="true"> × </span><span class="sr"> {by} </span>{h}{:else}{w} × {h}{/if}
