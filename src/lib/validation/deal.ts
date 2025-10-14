import { z } from 'zod';

import type { DealInput } from '$lib/types';

const EPSILON = 1e-6;
const MAX_AMOUNT = 1_000_000_000;
const MAX_NOTES_LENGTH = 2_000;
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[-+]\d{2}:\d{2})?)?$/;

const dealSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(160, 'Keep names under 160 characters'),
  amount: z
    .number()
    .finite('Amount must be finite')
    .min(EPSILON, 'Amount must be greater than zero')
    .max(MAX_AMOUNT, `Amount must be less than ${MAX_AMOUNT.toLocaleString()}`),
  winProbability: z
    .number()
    .min(0, 'Win probability cannot be negative')
    .max(1, 'Win probability cannot exceed 1'),
  expectedCloseDate: z
    .string()
    .trim()
    .min(1, 'Expected close date is required')
    .refine((value) => ISO_DATE.test(value) && !Number.isNaN(Date.parse(value)), {
      message: 'Expected close date must follow ISO-8601 (YYYY-MM-DD)',
    }),
  stage: z.string().trim().max(80, 'Stage should be under 80 characters').optional(),
  owner: z.string().trim().max(80, 'Owner should be under 80 characters').optional(),
  notes: z
    .string()
    .trim()
    .max(MAX_NOTES_LENGTH, 'Notes should be concise (2000 characters max)')
    .optional(),
});

export function validateDeal(draft: DealInput): DealInput {
  const parsed = dealSchema.parse(draft);
  return {
    ...draft,
    ...parsed,
    stage: parsed.stage && parsed.stage.length > 0 ? parsed.stage : undefined,
    owner: parsed.owner && parsed.owner.length > 0 ? parsed.owner : undefined,
    notes: parsed.notes && parsed.notes.length > 0 ? parsed.notes : undefined,
  };
}
