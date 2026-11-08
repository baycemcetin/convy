<script lang="ts">
  // Logo arrow = progress (KIMLIK §4). Trace --c-trace, fill along the centre line in --c-signal. Never rotates or scales; fill only
  // grows per job (clamped, monotonic, HAREKET §3.2). Bridge = CSS transition var(--d-data) linear (0 under reduced motion: steps).
  import { OK_D, ORTA_D } from '../lib/arrow';
  let { p = 0, cls = '' }: { p?: number | null; cls?: string } = $props();
  const id = $props.id();
  let hi = $state(0);
  $effect.pre(() => { const v = Math.max(0, Math.min(1, p ?? 0)); if (v > hi) hi = v; });
</script>
<svg class="arw {cls}" viewBox="36.74 7.44 56.03 30.78" aria-hidden="true" data-volt="arrow"><defs><clipPath id="ok{id}"><path d={OK_D} /></clipPath></defs><path d={OK_D} fill="var(--c-trace)" /><path class="fill" d={ORTA_D} pathLength="100" fill="none" stroke="var(--c-signal)" stroke-width="32" stroke-dasharray="100" stroke-dashoffset={100 - Math.round(hi * 100)} clip-path="url(#ok{id})" /></svg>
