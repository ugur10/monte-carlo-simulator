import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import type { SimulationResult } from '$lib/types';
import {
  createSimulationStore,
  DEFAULT_SIMULATION_CONFIG,
  runSimulation,
  upsertDeal,
} from './simulation';

const baseResult = (overrides?: Partial<SimulationResult>): SimulationResult => ({
  revenueSamples: [0, 100_000],
  histogram: [],
  confidenceIntervals: [],
  targetProbabilities: [],
  dealImpacts: [],
  summary: {
    mean: 50_000,
    median: 50_000,
    standardDeviation: 50_000,
    min: 0,
    max: 100_000,
    percentile10: 0,
    percentile90: 100_000,
  },
  metadata: {
    iterations: DEFAULT_SIMULATION_CONFIG.iterations ?? 10_000,
    seed: 123,
    generatedAt: new Date().toISOString(),
    version: '0.1.0-dev',
    runId: 'simulation-123',
  },
  ...overrides,
});

describe('runSimulation', () => {
  it('updates store state when the simulation succeeds', async () => {
    const store = createSimulationStore();
    store.update((state) =>
      upsertDeal(state, {
        name: 'Test Deal',
        amount: 100_000,
        winProbability: 0.5,
        expectedCloseDate: '2026-01-01',
      }),
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: baseResult() }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await runSimulation(store, fetchMock);

    const state = get(store);
    expect(state.status).toBe('success');
    expect(state.result?.metadata.runId).toBe('simulation-123');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('records error state when the API rejects the payload', async () => {
    const store = createSimulationStore();
    store.update((state) =>
      upsertDeal(state, {
        name: 'Test Deal',
        amount: 100_000,
        winProbability: 0.5,
        expectedCloseDate: '2026-01-01',
      }),
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid simulation payload' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await runSimulation(store, fetchMock);

    const state = get(store);
    expect(state.status).toBe('error');
    expect(state.error).toMatch(/invalid/i);
  });

  it('short-circuits when no deals are present', async () => {
    const store = createSimulationStore();
    const fetchMock = vi.fn();

    await runSimulation(store, fetchMock);

    const state = get(store);
    expect(state.status).toBe('error');
    expect(state.error).toContain('Add at least one deal');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
