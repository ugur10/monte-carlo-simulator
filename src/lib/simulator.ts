import type { Deal, SimulationConfig, SimulationResult } from './types';
import {
  buildConfidenceIntervals,
  computeSummaryStatistics,
  createSimulationMetadata,
  generateRunId,
  normalizeConfidenceLevels,
  normalizeIterations,
} from './utils';

/**
 * Placeholder Monte Carlo engine. The statistical machinery will be implemented in Phase 2.
 * For now it validates configuration and returns an empty result structure that downstream layers can consume.
 */
export function simulatePipeline(deals: Deal[], config?: SimulationConfig): SimulationResult {
  const iterations = normalizeIterations(config);
  const confidenceLevels = normalizeConfidenceLevels(config?.confidenceLevels);
  const metadata = createSimulationMetadata(config, { iterations, runId: generateRunId() });

  return {
    revenueSamples: [],
    histogram: [],
    confidenceIntervals: buildConfidenceIntervals([], confidenceLevels),
    targetProbabilities: [],
    dealImpacts: deals.map((deal) => ({
      dealId: deal.id,
      expectedValue: deal.amount * deal.winProbability,
      varianceContribution: 0,
      sensitivity: 0,
    })),
    summary: computeSummaryStatistics([]),
    metadata,
  };
}
