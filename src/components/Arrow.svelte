<script lang="ts">
  // Logo arrow = progress (KIMLIK §4). Trace --c-trace, fill along the centre line in --c-signal. Never rotates or scales; fill only
  // grows per job (clamped, monotonic, HAREKET §3.2). Bridge = CSS transition var(--d-data) linear (0 under reduced motion: steps).
  let { p = 0, cls = '' }: { p?: number | null; cls?: string } = $props();
  const id = $props.id();
  let hi = $state(0);
  $effect.pre(() => { const v = Math.max(0, Math.min(1, p ?? 0)); if (v > hi) hi = v; });
  const OK_D = 'M38.4 25.58Q39.52 22.39 41.84 20.08Q44.46 17.45 48.17 16.37Q51.75 15.32 55.85 15.85Q59.95 16.38 63.93 18.4Q68.05 20.5 71.45 23.9Q72.45 24.89 73.3 25.92L66.75 32.47Q66.47 32.75 66.59 33.13Q66.71 33.51 67.1 33.58L91.98 38.2Q92.32 38.26 92.57 38.02Q92.82 37.77 92.75 37.43L88.14 12.55Q88.06 12.16 87.68 12.04Q87.3 11.93 87.02 12.21L80.97 18.25L80.8 18.08Q76.4 13.68 71.07 10.97Q65.91 8.35 60.61 7.66Q55.3 6.98 50.65 8.34Q45.84 9.74 42.44 13.14Q38.89 16.7 37.52 21.78Q36.2 26.69 37.11 32.27Q37.14 32.44 37.3 32.42Q37.47 32.4 37.46 32.23Q37.32 28.67 38.4 25.58Z';
  const ORTA_D = 'M37.94 27.75C37.84 22.8 39.32 19.42 42.14 16.61C50.32 8.44 65.53 10.4 76.13 20.99L90.63 36.06';
</script>
<svg class="arw {cls}" viewBox="36.74 7.44 56.03 30.78" aria-hidden="true" data-volt="arrow"><defs><clipPath id="ok{id}"><path d={OK_D} /></clipPath></defs><path d={OK_D} fill="var(--c-trace)" /><path class="fill" d={ORTA_D} pathLength="100" fill="none" stroke="var(--c-signal)" stroke-width="30" stroke-dasharray="100" stroke-dashoffset={100 - Math.round(hi * 100)} clip-path="url(#ok{id})" /></svg>
