import { describe, expect, it } from 'vitest';

import { simulatePipeline } from './simulator';
import type { Deal } from './types';
import {
  createSeededRng,
  DEFAULT_CONFIDENCE_LEVELS,
  DEFAULT_SIMULATION_ITERATIONS,
  normalizeConfidenceLevels,
} from './utils';

describe('createSeededRng', () => {
  it('produces a deterministic sequence when seeded', () => {
    const seed = 42;
    const first = createSeededRng(seed);
    const second = createSeededRng(seed);

    const firstSequence = Array.from({ length: 5 }, () => first());
    const secondSequence = Array.from({ length: 5 }, () => second());

    expect(secondSequence).toEqual(firstSequence);
    expect(firstSequence.every((value) => value >= 0 && value < 1)).toBe(true);
  });
});

describe('normalizeConfidenceLevels', () => {
  it('falls back to defaults when input is missing or invalid', () => {
    expect(normalizeConfidenceLevels()).toEqual(DEFAULT_CONFIDENCE_LEVELS);
    expect(normalizeConfidenceLevels([1.4, -0.3, Number.NaN])).toEqual(DEFAULT_CONFIDENCE_LEVELS);
  });

  it('sorts, deduplicates, and filters levels', () => {
    expect(normalizeConfidenceLevels([0.95, 0.5, 0.5, 0.8])).toEqual([0.5, 0.8, 0.95]);
  });
});

describe('simulatePipeline', () => {
  const deals: Deal[] = [
    {
      id: 'deal-1',
      name: 'Expansion - Northern Corp',
      amount: 120_000,
      winProbability: 0.6,
      expectedCloseDate: '2025-11-15',
    },
    {
      id: 'deal-2',
      name: 'Net-new - Horizon Labs',
      amount: 80_000,
      winProbability: 0.35,
      expectedCloseDate: '2025-12-01',
    },
  ];

  it('returns a result structure with defaulted metadata', () => {
    const result = simulatePipeline(deals);

    expect(result.metadata.iterations).toBe(DEFAULT_SIMULATION_ITERATIONS);
    expect(result.metadata.generatedAt).toBeTruthy();
    expect(result.metadata.runId).toMatch(/^simulation-/);
    expect(result.dealImpacts).toHaveLength(deals.length);
    expect(result.confidenceIntervals.map((c) => c.level)).toEqual(DEFAULT_CONFIDENCE_LEVELS);
  });

  it('respects iteration overrides in config', () => {
    const iterations = 5_000;
    const result = simulatePipeline(deals, { iterations });
    expect(result.metadata.iterations).toBe(iterations);
  });

  it('pre-computes expected value for each deal impact stub', () => {
    const result = simulatePipeline(deals);
    const expectedValues = result.dealImpacts.map((impact) => impact.expectedValue);
    expect(expectedValues).toEqual([72_000, 28_000]);
  });
});
