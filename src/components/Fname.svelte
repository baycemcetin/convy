<script lang="ts">
  // stem truncates in the middle of the row, the extension never does (UI/UX P2-4); full name in title. Always text, never HTML.
  let { n }: { n: string } = $props();
  const i = $derived(n.lastIndexOf('.'));
</script>
<span class="fn" title={n}><span class="stem">{i > 0 ? n.slice(0, i) : n}</span><span class="ext">{i > 0 ? n.slice(i) : ''}</span></span>
