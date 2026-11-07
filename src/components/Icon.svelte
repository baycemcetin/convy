<script lang="ts">
  let { n, s16 = false, cls = '' }: { n: string; s16?: boolean; cls?: string } = $props();
  const known = ['image', 'audio', 'video', 'document', 'pdf', 'engine', 'device', 'done', 'error', 'storage', 'close'];
</script>
<svg class="ic{s16 ? ' s16' : ''}{cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-{known.includes(n) ? n : 'document'}{s16 ? '-16' : ''}" /></svg>
