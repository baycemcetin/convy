<script lang="ts">
  // "→" is visual; screen readers get the word (a11y P2-6)
  let { to }: { to: string } = $props();
</script>
<span class="ar" aria-hidden="true">→</span><span class="sr"> {to} </span>
