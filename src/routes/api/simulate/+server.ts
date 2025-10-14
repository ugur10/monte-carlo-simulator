import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

import { simulatePipeline } from '$lib/simulator';
import type { Deal } from '$lib/types';

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[-+]\d{2}:\d{2})?)?$/;

const dealInputSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, 'id must not be empty')
    .max(120, 'id must be 120 characters or fewer')
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, 'name is required')
    .max(160, 'name must be 160 characters or fewer'),
  amount: z
    .number()
    .finite('amount must be finite')
    .min(0, 'amount must be non-negative')
    .max(1_000_000_000, 'amount exceeds supported maximum'),
  winProbability: z
    .number()
    .min(0, 'winProbability must be at least 0')
    .max(1, 'winProbability must be at most 1'),
  expectedCloseDate: z
    .string()
    .trim()
    .min(1, 'expectedCloseDate is required')
    .max(50, 'expectedCloseDate must be 50 characters or fewer')
    .refine((value) => ISO_DATE_REGEX.test(value) && !Number.isNaN(Date.parse(value)), {
      message: 'expectedCloseDate must be an ISO-8601 date string',
    }),
  stage: z
    .string()
    .trim()
    .min(1, 'stage must not be empty')
    .max(80, 'stage must be 80 characters or fewer')
    .optional(),
  owner: z
    .string()
    .trim()
    .min(1, 'owner must not be empty')
    .max(80, 'owner must be 80 characters or fewer')
    .optional(),
  notes: z.string().trim().max(1_000, 'notes must be 1,000 characters or fewer').optional(),
});

const simulationConfigSchema = z
  .object({
    iterations: z
      .number()
      .int('iterations must be an integer')
      .min(100, 'iterations must be at least 100')
      .max(200_000, 'iterations must be 200,000 or fewer')
      .optional(),
    seed: z
      .number()
      .int('seed must be an integer')
      .min(0, 'seed must be non-negative')
      .max(Number.MAX_SAFE_INTEGER, 'seed exceeds supported maximum')
      .optional(),
    revenueTargets: z
      .array(z.number().finite('revenue target must be finite'))
      .max(20, 'no more than 20 revenue targets are supported')
      .optional(),
    confidenceLevels: z
      .array(
        z
          .number()
          .min(0, 'confidence level must be at least 0')
          .max(1, 'confidence level must be at most 1'),
      )
      .max(10, 'no more than 10 confidence levels are supported')
      .optional(),
    histogramBinCount: z
      .number()
      .int('histogramBinCount must be an integer')
      .min(5, 'histogramBinCount must be at least 5')
      .max(200, 'histogramBinCount must be 200 or fewer')
      .optional(),
    includeDealImpacts: z.boolean().optional(),
  })
  .strict();

const requestSchema = z
  .object({
    deals: z
      .array(dealInputSchema)
      .min(1, 'provide at least one deal')
      .max(500, 'no more than 500 deals are supported'),
    config: simulationConfigSchema.optional(),
  })
  .strict();

type ParsedPayload = z.infer<typeof requestSchema>;

export const POST: RequestHandler = async ({ request }) => {
  if (!isJsonRequest(request)) {
    return json({ message: 'Content-Type must be application/json' }, { status: 415 });
  }

  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = requestSchema.safeParse(rawPayload);
  if (!parseResult.success) {
    return json(
      {
        message: 'Invalid simulation payload',
        issues: formatZodIssues(parseResult.error.issues),
      },
      { status: 400 },
    );
  }

  const payload = parseResult.data;
  const deals = normaliseDeals(payload);

  const simulationStart = performance.now();
  const result = simulatePipeline(deals, payload.config);
  const simulationDuration = performance.now() - simulationStart;
  result.metadata.durationMs = simulationDuration;

  return json(
    { result },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store',
        'x-simulation-duration-ms': simulationDuration.toFixed(3),
      },
    },
  );
};

function normaliseDeals(payload: ParsedPayload): Deal[] {
  return payload.deals.map((deal, index) => {
    const trimmed = (value?: string) => value?.trim() || undefined;
    return {
      id: trimmed(deal.id) ?? `deal-${index + 1}`,
      name: deal.name.trim(),
      amount: deal.amount,
      winProbability: deal.winProbability,
      expectedCloseDate: deal.expectedCloseDate,
      stage: trimmed(deal.stage),
      owner: trimmed(deal.owner),
      notes: trimmed(deal.notes),
    };
  });
}

function formatZodIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join('.') || issue.path.toString(),
    code: issue.code,
    message: issue.message,
  }));
}

function isJsonRequest(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return Boolean(contentType && contentType.toLowerCase().includes('application/json'));
}
