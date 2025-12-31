/**
 * Input validation schemas using Zod
 */
import { z } from 'zod';

// Ethereum address validation (0x + 40 hex characters)
const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

// Positive number string (for amounts stored as strings in DB)
const positiveAmountSchema = z
  .string()
  .regex(/^\d+$/, 'Amount must be a positive integer')
  .refine((val) => BigInt(val) > 0, 'Amount must be greater than 0');

// Unix timestamp validation (must be in the future)
const futureTimestampSchema = z
  .number()
  .int()
  .positive()
  .refine(
    (val) => val > Math.floor(Date.now() / 1000),
    'Deadline must be in the future'
  );

// Nonce validation (non-negative integer)
const nonceSchema = z.number().int().min(0, 'Nonce must be non-negative');

// Intent status enum
export const intentStatusSchema = z.enum([
  'created',
  'validated',
  'executing',
  'executed',
  'rejected',
  'failed',
]);

/**
 * Schema for creating a new intent
 */
export const createIntentSchema = z.object({
  user_address: ethereumAddressSchema,
  asset_in: ethereumAddressSchema,
  asset_out: ethereumAddressSchema,
  amount_in: positiveAmountSchema,
  amount_out_min: positiveAmountSchema,
  venue: z.string().min(1, 'Venue is required').max(100),
  deadline: futureTimestampSchema,
  nonce: nonceSchema,
  status: intentStatusSchema.optional(),
});

/**
 * Schema for updating an intent
 */
export const updateIntentSchema = z.object({
  status: intentStatusSchema,
});

/**
 * Schema for updating intent signature
 */
export const updateSignatureSchema = z.object({
  signature: z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, 'Signature must be a hex string starting with 0x'),
});

/**
 * Schema for intent list query parameters
 */
export const intentListQuerySchema = z.object({
  status: intentStatusSchema.optional(),
  userAddress: ethereumAddressSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return ethereumAddressSchema.safeParse(address).success;
}

/**
 * Validate amount string
 */
export function isValidAmount(amount: string): boolean {
  return positiveAmountSchema.safeParse(amount).success;
}

/**
 * Validate deadline timestamp
 */
export function isValidDeadline(timestamp: number): boolean {
  return futureTimestampSchema.safeParse(timestamp).success;
}

export type CreateIntentInput = z.infer<typeof createIntentSchema>;
export type UpdateIntentInput = z.infer<typeof updateIntentSchema>;
export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;
export type IntentListQuery = z.infer<typeof intentListQuerySchema>;

/**
 * Policy Validation Schemas
 */

// Policy type enum
export const policyTypeSchema = z.enum([
  'allow_deny_list',
  'trade_limit',
  'venue_allowlist',
  'custom',
]);

// Allow/Deny list config schema
const allowDenyListConfigSchema = z.object({
  mode: z.enum(['allow', 'deny']),
  addresses: z.array(ethereumAddressSchema),
});

// Trade limit config schema
const tradeLimitConfigSchema = z.object({
  min_amount: positiveAmountSchema.optional(),
  max_amount: positiveAmountSchema.optional(),
  asset: ethereumAddressSchema.optional(),
});

// Venue allowlist config schema
const venueAllowlistConfigSchema = z.object({
  allowed_venues: z.array(z.string().min(1)),
});

// Custom config schema (allows any JSON)
const customConfigSchema = z.record(z.any());

/**
 * Schema for creating a new policy
 */
export const createPolicySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  policy_type: policyTypeSchema,
  config: z.union([
    allowDenyListConfigSchema,
    tradeLimitConfigSchema,
    venueAllowlistConfigSchema,
    customConfigSchema,
  ]),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
});

/**
 * Schema for updating a policy
 */
export const updatePolicySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  policy_type: policyTypeSchema.optional(),
  config: z.union([
    allowDenyListConfigSchema,
    tradeLimitConfigSchema,
    venueAllowlistConfigSchema,
    customConfigSchema,
  ]).optional(),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
});

/**
 * Schema for policy list query parameters
 */
export const policyListQuerySchema = z.object({
  enabled: z.coerce.boolean().optional(),
  policyType: policyTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
export type PolicyListQuery = z.infer<typeof policyListQuerySchema>;
