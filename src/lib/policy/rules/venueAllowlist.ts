/**
 * Venue Allowlist Policy Rule
 * Checks if the trading venue is in the allowed list
 */
import {
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyEvaluationError,
} from '../types';
import { VenueAllowlistConfig } from '@/types/policy';

/**
 * Evaluate venue allowlist policy
 */
export async function evaluateVenueAllowlist(
  context: PolicyEvaluationContext
): Promise<PolicyEvaluationResult> {
  const { intent, policy } = context;
  const config = policy.config as VenueAllowlistConfig;

  if (!config || !Array.isArray(config.allowed_venues)) {
    throw new PolicyEvaluationError(
      'Invalid venue allowlist configuration',
      policy.id,
      policy.policy_type
    );
  }

  // Normalize venue names for comparison (case-insensitive)
  const allowedVenues = config.allowed_venues.map((v) => v.toLowerCase());
  const intentVenue = intent.venue.toLowerCase();

  const passed = allowedVenues.includes(intentVenue);
  const reason = passed
    ? `Passed: venue "${intent.venue}" is in allowlist`
    : `Rejected: venue "${intent.venue}" is not in allowlist`;

  return {
    passed,
    reason,
    policyId: policy.id,
    policyName: policy.name,
    policyType: policy.policy_type,
    metadata: {
      intentVenue: intent.venue,
      allowedVenues: config.allowed_venues,
      totalAllowedVenues: config.allowed_venues.length,
    },
  };
}
