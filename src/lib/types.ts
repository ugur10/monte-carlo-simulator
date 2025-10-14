export type DealIdentifier = string;

export type Probability = number;

export interface Deal {
  id: DealIdentifier;
  name: string;
  amount: number;
  winProbability: Probability;
  /**
   * ISO-8601 date string representing the expected close date.
   */
  expectedCloseDate: string;
  stage?: string;
  owner?: string;
  notes?: string;
}

export interface DealInput extends Omit<Deal, 'id'> {
  id?: DealIdentifier;
}

export interface SimulationConfig {
  iterations?: number;
  seed?: number;
  /**
   * Revenue targets to evaluate (e.g. board commitments).
   */
  revenueTargets?: number[];
  /**
   * Confidence levels to compute (defaults to [0.5, 0.8, 0.95]).
   */
  confidenceLevels?: number[];
  /**
   * Number of buckets for histogram distribution.
   */
  histogramBinCount?: number;
  /**
   * Whether to compute deal contribution analytics.
   */
  includeDealImpacts?: boolean;
}

export interface ConfidenceInterval {
  level: number;
  lower: number;
  upper: number;
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
  /**
   * Probability mass contained in this bucket.
   */
  probability: number;
}

export interface TargetProbability {
  target: number;
  probability: Probability;
}

export interface DealImpact {
  dealId: DealIdentifier;
  expectedValue: number;
  /**
   * How much the variance of the portfolio changes due to this deal.
   */
  varianceContribution: number;
  /**
   * Probability that the deal materially affects the outcome (e.g. tail risk).
   */
  sensitivity: number;
}

export interface SimulationSummary {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  percentile10: number;
  percentile90: number;
}

export interface SimulationMetadata {
  iterations: number;
  seed: number;
  generatedAt: string;
  version: string;
  runId?: string;
  durationMs?: number;
}

export interface SimulationResult {
  revenueSamples: number[];
  histogram: HistogramBin[];
  confidenceIntervals: ConfidenceInterval[];
  targetProbabilities: TargetProbability[];
  dealImpacts: DealImpact[];
  summary: SimulationSummary;
  metadata: SimulationMetadata;
}

export interface SimulationRequestPayload {
  deals: DealInput[];
  config?: SimulationConfig;
}

export interface SimulationResponsePayload {
  result: SimulationResult;
}

export interface SavedScenario {
  id: string;
  name: string;
  description?: string;
  deals: DealInput[];
  config: SimulationConfig;
  savedAt: string;
  updatedAt: string;
}

export type SimulationRunStatus = 'idle' | 'running' | 'success' | 'error';

/**
 * View-model state consumed by the interactive UI.
 */
export interface SimulationUiState {
  deals: DealInput[];
  config: SimulationConfig;
  result?: SimulationResult;
  status: SimulationRunStatus;
  error?: string;
  lastRunId?: string;
  lastUpdatedAt?: string;
}
