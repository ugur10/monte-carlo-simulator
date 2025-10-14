import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import type {
  DealInput,
  SimulationConfig,
  SimulationRunStatus,
  SimulationUiState,
} from '$lib/types';
import { validateDeal } from '$lib/validation/deal';

const DEFAULT_REVENUE_TARGETS = [100_000, 200_000, 300_000];
const DEFAULT_CONFIDENCE_LEVELS = [0.5, 0.8, 0.95];

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  iterations: 10_000,
  histogramBinCount: 40,
  revenueTargets: DEFAULT_REVENUE_TARGETS,
  confidenceLevels: DEFAULT_CONFIDENCE_LEVELS,
  includeDealImpacts: true,
};

export const DEFAULT_SIMULATION_STATE: SimulationUiState = {
  deals: [],
  config: DEFAULT_SIMULATION_CONFIG,
  status: 'idle',
};

export type SimulationStore = Writable<SimulationUiState>;

/**
 * Creates a writable store seeded with default configuration and optional overrides.
 * The store will be used by the page to orchestrate UI interactions.
 */
export function createSimulationStore(initial?: Partial<SimulationUiState>): SimulationStore {
  const config: SimulationConfig = {
    ...DEFAULT_SIMULATION_CONFIG,
    ...initial?.config,
  };

  const state: SimulationUiState = {
    ...DEFAULT_SIMULATION_STATE,
    ...initial,
    config,
    deals: initial?.deals ? [...initial.deals] : [],
  };

  return writable(state);
}

/**
 * Adds a new deal or updates an existing one immutably.
 */
export function upsertDeal(
  state: SimulationUiState,
  draft: DealInput,
  index?: number,
): SimulationUiState {
  const parsed = validateDeal(draft);
  const next: DealInput = { ...parsed, id: draft.id };
  const deals = [...state.deals];
  if (typeof index === 'number' && index >= 0 && index < deals.length) {
    deals[index] = { ...next };
  } else {
    deals.push({ ...next });
  }
  return { ...state, deals };
}

/**
 * Removes a deal at the specified index.
 */
export function removeDeal(state: SimulationUiState, index: number): SimulationUiState {
  const deals = state.deals.filter((_, i) => i !== index);
  return { ...state, deals };
}

/**
 * Resets status/error indicators when user interaction resumes.
 */
export function resetStatus(state: SimulationUiState): SimulationUiState {
  return { ...state, status: 'idle', error: undefined };
}

/**
 * Convenience factory that returns a blank deal draft with a reasonable close date
 * so forms can begin with a populated calendar field.
 */
export function createDealDraft(): DealInput {
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10);
  return {
    name: '',
    amount: 0,
    winProbability: 0.5,
    expectedCloseDate: isoDate,
    stage: undefined,
    owner: undefined,
    notes: undefined,
  };
}

/**
 * Maps status flags to human-friendly helper text for UI consumption.
 */
export function describeStatus(status: SimulationRunStatus): string {
  switch (status) {
    case 'running':
      return 'Simulation in progress…';
    case 'success':
      return 'Simulation complete';
    case 'error':
      return 'Unable to simulate – check inputs';
    default:
      return 'Ready to simulate';
  }
}

export const defaultSimulationStore = createSimulationStore();
