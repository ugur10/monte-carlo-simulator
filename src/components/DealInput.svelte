<script lang="ts">
  import type { DealInput } from '$lib/types';

  /**
   * Placeholder deal used until the interactive form is built.
   */
  export let value: DealInput;
</script>

<!--
  Phase 4: Deal input form.
  The actual form controls will be added in the next step – this block simply confirms component wiring.
-->
<section class="rounded-[var(--radius-card)] border border-white/10 bg-surface/70 p-6 shadow-[var(--shadow-card)] backdrop-blur">
  <header class="mb-4 flex items-center justify-between">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">
      Deal Input (Coming Soon)
    </h2>
  </header>
  <p class="text-sm text-slate-400">
    A guided form for creating and editing deals will appear here. We’ll support amount, win-rate,
    close date, owner, and stage with friendly validation.
  </p>
  <pre class="mt-4 rounded-lg bg-black/30 p-4 text-xs text-slate-400">
{JSON.stringify(value, null, 2)}
  </pre>
</section>
