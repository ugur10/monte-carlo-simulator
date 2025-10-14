import type { Deal, DealImpact, SimulationConfig, SimulationResult } from './types';
import {
  buildConfidenceIntervals,
  calculatePercentile,
  clampProbability,
  computeHistogram,
  computeSummaryStatistics,
  computeTargetProbabilities,
  createSeededRng,
  createSimulationMetadata,
  generateRunId,
  normalizeConfidenceLevels,
  normalizeHistogramBinCount,
  normalizeIterations,
  normalizeSeed,
  sortNumbers,
} from './utils';

/**
 * Runs a Monte Carlo simulation across the provided deals and returns
 * the full analytical output (samples, histogram, confidence intervals, impacts).
 */
export function simulatePipeline(deals: Deal[], config?: SimulationConfig): SimulationResult {
  // Normalize deal probabilities to guard against out-of-range values before iterating.
  const sanitizedDeals = deals.map((deal) => ({
    ...deal,
    winProbability: clampProbability(deal.winProbability),
  }));

  const iterations = normalizeIterations(config);
  const confidenceLevels = normalizeConfidenceLevels(config?.confidenceLevels);
  const histogramBins = normalizeHistogramBinCount(config?.histogramBinCount);
  const seed = normalizeSeed(config?.seed);
  const rng = createSeededRng(seed);

  const revenueBuffer = new Float64Array(iterations);
  const dealWinCounts = sanitizedDeals.map(() => 0);
  const dealWinningIterations = sanitizedDeals.map(() => [] as number[]);

  // Run the Bernoulli trial for each deal per iteration, accumulating revenue totals
  // and tracking which iterations each deal contributed to.
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let total = 0;

    sanitizedDeals.forEach((deal, index) => {
      if (deal.winProbability === 0 || deal.amount === 0) {
        return;
      }

      if (rng() < deal.winProbability) {
        total += deal.amount;
        dealWinCounts[index] += 1;
        dealWinningIterations[index].push(iteration);
      }
    });

    revenueBuffer[iteration] = total;
  }

  const revenueSamples = Array.from(revenueBuffer);
  const sortedSamples = sortNumbers(revenueSamples);
  const confidenceIntervals = buildConfidenceIntervals(sortedSamples, confidenceLevels, {
    sorted: true,
  });
  const histogram = computeHistogram(revenueSamples, histogramBins);
  const summary = computeSummaryStatistics(sortedSamples, { sorted: true });
  const metadata = createSimulationMetadata(config, {
    iterations,
    seed,
    runId: generateRunId(),
  });

  const targetProbabilities = computeTargetProbabilities(sortedSamples, config?.revenueTargets);

  const shouldIncludeDealImpacts = config?.includeDealImpacts ?? true;
  const dealImpacts: DealImpact[] = shouldIncludeDealImpacts
    ? buildDealImpacts({
        deals: sanitizedDeals,
        revenueSamples,
        iterations,
        dealWinCounts,
        dealWinningIterations,
        sortedSamples,
      })
    : [];

  return {
    revenueSamples,
    histogram,
    confidenceIntervals,
    targetProbabilities,
    dealImpacts,
    summary,
    metadata,
  };
}

interface BuildDealImpactsOptions {
  deals: Deal[];
  revenueSamples: number[];
  iterations: number;
  dealWinCounts: number[];
  dealWinningIterations: number[][];
  sortedSamples: number[];
}

/**
 * Estimates how each deal contributes to tail risk and expected value.
 * Sensitivity counts iterations where a deal pushed revenue over the 80th percentile threshold.
 */
function buildDealImpacts({
  deals,
  revenueSamples,
  iterations,
  dealWinCounts,
  dealWinningIterations,
  sortedSamples,
}: BuildDealImpactsOptions): DealImpact[] {
  if (!deals.length || iterations <= 0) {
    return [];
  }

  const tailThreshold = calculatePercentile(sortedSamples, 0.8);

  return deals.map((deal, index) => {
    const wins = dealWinCounts[index] ?? 0;
    const winFrequency = wins / iterations;
    const varianceContribution = deal.amount * deal.amount * winFrequency * (1 - winFrequency);

    let sensitivityHits = 0;
    for (const iterationIndex of dealWinningIterations[index] ?? []) {
      const revenue = revenueSamples[iterationIndex];
      if (revenue >= tailThreshold && revenue - deal.amount < tailThreshold) {
        sensitivityHits += 1;
      }
    }

    return {
      dealId: deal.id,
      expectedValue: winFrequency * deal.amount,
      varianceContribution,
      sensitivity: sensitivityHits / iterations,
    };
  });
}
