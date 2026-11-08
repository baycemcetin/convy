<script lang="ts">
  // Theme toggle (bar, next to language). No state here: the head script in Base.astro handles [data-theme-toggle] clicks, so the same
  // markup works in the island and on the zero-JS pages. Icon and name follow <html data-theme> by CSS (.th-sun / .th-moon).
  let { label }: { label: string[] } = $props();
</script>
<button class="theme-btn" type="button" data-theme-toggle><svg class="ic s16 th-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" /><path d="M7.25 0h1.5v2.5h-1.5zM7.25 13.5h1.5V16h-1.5zM0 7.25h2.5v1.5H0zM13.5 7.25H16v1.5h-2.5zM2.1 3.16l1.06-1.06 1.77 1.77-1.06 1.06zM11.07 12.13l1.06-1.06 1.77 1.77-1.06 1.06zM2.1 12.84l1.77-1.77 1.06 1.06-1.77 1.77zM11.07 3.87l1.77-1.77 1.06 1.06-1.77 1.77z" /></svg><svg class="ic s16 th-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.2 1.1a6.9 6.9 0 1 0 8.7 8.7A6 6 0 0 1 6.2 1.1z" /></svg><span class="sr th-sun">{label[0]}</span><span class="sr th-moon">{label[1]}</span></button>
