<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte';
import { z } from 'zod';

import type { DealInput } from '$lib/types';
import { validateDeal } from '$lib/validation/deal';

const dispatch = createEventDispatcher<{
  save: { deal: DealInput; index?: number };
  cancel: void;
}>();

const props = $props<{ draft: DealInput; index?: number; formId?: string }>();

function cloneDraft(value: DealInput): DealInput {
  // Convert the reactive proxy passed through props into a plain object snapshot
  const { id, name, amount, winProbability, expectedCloseDate, stage, owner, notes } = value;
  return {
    id,
    name,
    amount,
    winProbability,
    expectedCloseDate,
    stage,
    owner,
    notes,
  };
}

let localDraft: DealInput = $state(cloneDraft(props.draft));
let errors: Partial<Record<keyof DealInput, string>> = $state({});
let form: HTMLFormElement | null = null;

onMount(() => {
  form?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
});

$effect(() => {
  Object.assign(localDraft, cloneDraft(props.draft));
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

<form bind:this={form} class="deal-form" id={props.formId} onsubmit={handleSubmit}>
  <div class="deal-form__panel">
    <header class="deal-form__panel-header">
      <h3 class="deal-form__panel-title">Deal essentials</h3>
      <span class="deal-form__status">{localDraft.name ? 'Ready to simulate' : 'Give it a name'}</span>
    </header>
    <div class="deal-form__grid deal-form__grid--two">
      <div class="input-group">
        <label for="deal-name">Deal name</label>
        <input
          id="deal-name"
          name="name"
          type="text"
          class="form-control"
          bind:value={localDraft.name}
          oninput={(event) => update('name', event.currentTarget.value)}
          placeholder="Enterprise Expansion"
          required
        />
        {#if errors.name}
          <p class="form-error">{errors.name}</p>
        {/if}
      </div>

      <div class="input-group">
        <label for="deal-owner">Owner</label>
        <input
          id="deal-owner"
          type="text"
          class="form-control"
          bind:value={localDraft.owner}
          oninput={(event) => update('owner', event.currentTarget.value)}
          placeholder="Optional – e.g. Account Executive"
        />
        {#if errors.owner}
          <p class="form-error">{errors.owner}</p>
        {/if}
      </div>
    </div>
  </div>

  <div class="deal-form__grid deal-form__grid--three">
    <div class="input-group">
      <label for="deal-amount">Amount (USD)</label>
      <input
        id="deal-amount"
        type="number"
        class="form-control"
        min="0"
        step="1000"
        bind:value={localDraft.amount}
        oninput={(event) => update('amount', Number(event.currentTarget.value) || 0)}
        placeholder="250000"
        required
      />
      {#if errors.amount}
        <p class="form-error">{errors.amount}</p>
      {/if}
    </div>

    <div class="input-group">
      <label for="deal-probability">Win probability (%)</label>
      <input
        id="deal-probability"
        type="number"
        class="form-control"
        min="0"
        max="100"
        step="1"
        value={(localDraft.winProbability * 100).toFixed(0)}
        oninput={(event) => update('winProbability', Number(event.currentTarget.value) / 100)}
        placeholder="60"
        required
      />
      {#if errors.winProbability}
        <p class="form-error">{errors.winProbability}</p>
      {/if}
    </div>

    <div class="input-group">
      <label for="deal-close">Expected close</label>
      <input
        id="deal-close"
        type="date"
        class="form-control"
        bind:value={localDraft.expectedCloseDate}
        oninput={(event) => update('expectedCloseDate', event.currentTarget.value)}
        required
      />
      {#if errors.expectedCloseDate}
        <p class="form-error">{errors.expectedCloseDate}</p>
      {/if}
    </div>
  </div>

  <div class="deal-form__grid deal-form__grid--two">
    <div class="input-group">
      <label for="deal-stage">Stage</label>
      <input
        id="deal-stage"
        type="text"
        class="form-control"
        bind:value={localDraft.stage}
        oninput={(event) => update('stage', event.currentTarget.value)}
        placeholder="Negotiation"
      />
      {#if errors.stage}
        <p class="form-error">{errors.stage}</p>
      {/if}
    </div>
  </div>

  <div class="deal-form__notes">
    <label for="deal-notes">Notes</label>
    <textarea
      id="deal-notes"
      class="form-control"
      bind:value={localDraft.notes}
      oninput={(event) => update('notes', event.currentTarget.value)}
      placeholder="Context around the buyer committee, risk, or mitigation plans." 
    ></textarea>
    {#if errors.notes}
      <p class="form-error">{errors.notes}</p>
    {/if}
  </div>

  <footer class="deal-form__footer">
    <p class="deal-form__hint">
      {#if typeof props.index === 'number'}
        Updating deal #{props.index + 1}.
      {:else}
        Fill every field before saving your deal.
      {/if}
    </p>
    <div class="deal-form__footer-actions">
      <button type="button" class="button button--ghost" onclick={handleCancel}>Cancel</button>
      <button type="submit" class="button button--primary">
        {#if typeof props.index === 'number'}Update deal{:else}Save deal{/if}
      </button>
    </div>
  </footer>
</form>
