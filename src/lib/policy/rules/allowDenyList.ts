/**
 * Allow/Deny List Policy Rule
 * Checks if addresses (user, assets) are allowed or denied
 */
import {
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyEvaluationError,
} from '../types';
import { AllowDenyListConfig } from '@/types/policy';

/**
 * Evaluate allow/deny list policy
 */
export async function evaluateAllowDenyList(
  context: PolicyEvaluationContext
): Promise<PolicyEvaluationResult> {
  const { intent, policy } = context;
  const config = policy.config as AllowDenyListConfig;

  if (!config || !config.mode || !Array.isArray(config.addresses)) {
    throw new PolicyEvaluationError(
      'Invalid allow/deny list configuration',
      policy.id,
      policy.policy_type
    );
  }

  // Normalize addresses to lowercase for comparison
  const listAddresses = config.addresses.map((addr) => addr.toLowerCase());
  const userAddress = intent.user_address.toLowerCase();
  const assetIn = intent.asset_in.toLowerCase();
  const assetOut = intent.asset_out.toLowerCase();

  // Check if any of the intent addresses are in the list
  const addressesToCheck = [userAddress, assetIn, assetOut];
  const foundAddresses = addressesToCheck.filter((addr) =>
    listAddresses.includes(addr)
  );

  let passed: boolean;
  let reason: string;

  if (config.mode === 'allow' || config.mode === 'allowlist') {
    // In allow mode, at least one address must be in the list
    // (or you could require ALL addresses to be in the list - adjust as needed)
    passed = foundAddresses.length > 0;

    if (passed) {
      reason = `Allowed: found ${foundAddresses.length} whitelisted address(es)`;
    } else {
      reason = 'Rejected: no addresses found in allowlist';
    }
  } else {
    // In deny mode, no addresses should be in the list
    passed = foundAddresses.length === 0;

    if (passed) {
      reason = 'Passed: no addresses found in denylist';
    } else {
      reason = `Rejected: found ${foundAddresses.length} blacklisted address(es)`;
    }
  }

  return {
    passed,
    reason,
    policyId: policy.id,
    policyName: policy.name,
    policyType: policy.policy_type,
    metadata: {
      mode: config.mode,
      listSize: config.addresses.length,
      foundAddresses,
    },
  };
}
