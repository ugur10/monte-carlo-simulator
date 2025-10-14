<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import { z } from 'zod';

import type { DealInput } from '$lib/types';
import { validateDeal } from '$lib/validation/deal';

const dispatch = createEventDispatcher<{
  save: { deal: DealInput; index?: number };
  cancel: void;
}>();

const props = $props<{ draft: DealInput; index?: number }>();

let localDraft: DealInput = $state(structuredClone(props.draft));
let errors: Partial<Record<keyof DealInput, string>> = $state({});
let form: HTMLFormElement | null = null;

onMount(() => {
  form?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
});

$effect(() => {
  Object.assign(localDraft, props.draft);
});

function clearErrors() {
  for (const key of Object.keys(errors)) {
    delete errors[key as keyof DealInput];
  }
}

function update<K extends keyof DealInput>(key: K, value: DealInput[K]) {
  localDraft[key] = value;
  errors[key] = undefined;
}

function handleSubmit(event: Event) {
  event.preventDefault();
  clearErrors();

  try {
    const normalized = validateDeal({ ...localDraft });
    const payload: DealInput = { ...localDraft, ...normalized };
    dispatch('save', { deal: payload, index: props.index });
  } catch (err) {
    if (err instanceof z.ZodError) {
      for (const issue of err.issues) {
        const key = issue.path[0] as keyof DealInput;
        errors[key] = issue.message;
      }
    }
  }
}

function handleCancel() {
  clearErrors();
  dispatch('cancel');
}
</script>

<form bind:this={form} class="space-y-6" onsubmit={handleSubmit}>
  <div class="rounded-xl border border-white/10 bg-surface-strong/70 p-4">
    <header class="mb-3 flex items-center justify-between">
      <h3 class="text-xs uppercase tracking-[0.28em] text-slate-400">Deal essentials</h3>
      <span class="text-xs text-slate-500">{localDraft.name ? 'Ready to simulate' : 'Give it a name'}</span>
    </header>
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="flex flex-col gap-2 text-sm">
        <span class="font-medium text-slate-300">Deal name</span>
        <input
          name="name"
          type="text"
          class="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          bind:value={localDraft.name}
          oninput={(event) => update('name', event.currentTarget.value)}
          placeholder="Enterprise Expansion"
          required
        />
        {#if errors.name}
          <p class="text-xs text-danger">{errors.name}</p>
        {/if}
      </label>

      <label class="flex flex-col gap-2 text-sm">
        <span class="font-medium text-slate-300">Owner</span>
        <input
          type="text"
          class="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          bind:value={localDraft.owner}
          oninput={(event) => update('owner', event.currentTarget.value)}
          placeholder="Optional – e.g. Account Executive"
        />
        {#if errors.owner}
          <p class="text-xs text-danger">{errors.owner}</p>
        {/if}
      </label>
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-3">
    <label class="flex flex-col gap-2 text-sm">
      <span class="font-medium text-slate-300">Deal name</span>
      <input
        name="name"
        type="text"
        class="w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        bind:value={localDraft.name}
        oninput={(event) => update('name', event.currentTarget.value)}
        placeholder="Enterprise Expansion"
        required
      />
      {#if errors.name}
        <p class="text-xs text-danger">{errors.name}</p>
      {/if}
    </label>

    <label class="flex flex-col gap-2 text-sm">
      <span class="font-medium text-slate-300">Owner</span>
      <input
        type="text"
        class="w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        bind:value={localDraft.owner}
        oninput={(event) => update('owner', event.currentTarget.value)}
        placeholder="Optional – e.g. Account Executive"
      />
      {#if errors.owner}
        <p class="text-xs text-danger">{errors.owner}</p>
      {/if}
    </label>
  </div>

  <div class="grid gap-4 sm:grid-cols-3">
    <label class="flex flex-col gap-2 text-sm">
      <span class="font-medium text-slate-300">Amount (USD)</span>
      <input
        type="number"
        class="w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        min="0"
        step="1000"
        bind:value={localDraft.amount}
        oninput={(event) => update('amount', Number(event.currentTarget.value) || 0)}
        placeholder="250000"
        required
     />
     {#if errors.amount}
       <p class="text-xs text-danger">{errors.amount}</p>
     {/if}
   </label>

    <label class="flex flex-col gap-2 text-sm">
      <span class="font-medium text-slate-300">Win probability (%)</span>
      <input
        type="number"
        class="w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        min="0"
        max="100"
        step="1"
        value={(localDraft.winProbability * 100).toFixed(0)}
        oninput={(event) => update('winProbability', Number(event.currentTarget.value) / 100)}
        placeholder="60"
        required
      />
      {#if errors.winProbability}
        <p class="text-xs text-danger">{errors.winProbability}</p>
      {/if}
    </label>

    <label class="flex flex-col gap-2 text-sm">
      <span class="font-medium text-slate-300">Expected close</span>
      <input
        type="date"
        class="w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        bind:value={localDraft.expectedCloseDate}
        oninput={(event) => update('expectedCloseDate', event.currentTarget.value)}
        required
      />
      {#if errors.expectedCloseDate}
        <p class="text-xs text-danger">{errors.expectedCloseDate}</p>
      {/if}
    </label>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <label class="flex flex-col gap-2 text-sm">
      <span class="font-medium text-slate-300">Stage</span>
      <input
        type="text"
        class="w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        bind:value={localDraft.stage}
        oninput={(event) => update('stage', event.currentTarget.value)}
        placeholder="Negotiation"
      />
      {#if errors.stage}
        <p class="text-xs text-danger">{errors.stage}</p>
      {/if}
    </label>
  </div>

  <label class="flex flex-col gap-2 text-sm">
    <span class="font-medium text-slate-300">Notes</span>
    <textarea
      class="min-h-[120px] w-full rounded-xl border border-white/10 bg-surface-strong/70 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      bind:value={localDraft.notes}
      oninput={(event) => update('notes', event.currentTarget.value)}
      placeholder="Context around the buyer committee, risk, or mitigation plans." 
    ></textarea>
    {#if errors.notes}
      <p class="text-xs text-danger">{errors.notes}</p>
    {/if}
  </label>

  <footer class="flex flex-col gap-3 sm:flex-row sm:justify-end">
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
      onclick={handleCancel}
    >
      Cancel
    </button>
    <button
      type="submit"
      class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {#if typeof props.index === 'number'}Update deal{:else}Add deal{/if}
    </button>
  </footer>
</form>
