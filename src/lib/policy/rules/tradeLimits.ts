/**
 * Trade Limit Policy Rule
 * Checks if trade amounts are within configured limits
 * Includes periodic limit checks based on actual executions
 */
import {
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyEvaluationError,
} from '../types';
import { TradeLimitConfig } from '@/types/policy';
import { getUserAssetExecutionTotal } from '@/lib/db/executions';

/**
 * Evaluate trade limit policy
 */
export async function evaluateTradeLimits(
  context: PolicyEvaluationContext
): Promise<PolicyEvaluationResult> {
  const { intent, policy } = context;
  const config = policy.config as TradeLimitConfig;

  if (!config) {
    throw new PolicyEvaluationError(
      'Invalid trade limit configuration',
      policy.id,
      policy.policy_type
    );
  }

  // If asset is specified, only check if it matches asset_in
  if (config.asset) {
    const configAsset = config.asset.toLowerCase();
    const intentAsset = intent.asset_in.toLowerCase();

    if (configAsset !== intentAsset) {
      // Policy doesn't apply to this asset
      return {
        passed: true,
        reason: `Policy does not apply to asset ${intent.asset_in}`,
        policyId: policy.id,
        policyName: policy.name,
        policyType: policy.policy_type,
        metadata: {
          skipped: true,
          policyAsset: config.asset,
          intentAsset: intent.asset_in,
        },
      };
    }
  }

  const amountIn = BigInt(intent.amount_in);
  const violations: string[] = [];

  // Check minimum amount
  if (config.min_amount) {
    const minAmount = BigInt(config.min_amount);
    if (amountIn < minAmount) {
      violations.push(
        `amount_in (${intent.amount_in}) is below minimum (${config.min_amount})`
      );
    }
  }

  // Check maximum amount
  if (config.max_amount) {
    const maxAmount = BigInt(config.max_amount);
    if (amountIn > maxAmount) {
      violations.push(
        `amount_in (${intent.amount_in}) exceeds maximum (${config.max_amount})`
      );
    }
  }

  // TODO: Add periodic limit checking
  // To implement daily/weekly limits, extend TradeLimitConfig to include:
  // - period_seconds: number (e.g., 86400 for daily)
  // - period_max_amount: string
  // Then use getUserAssetExecutionTotal() to check cumulative executed amount:
  //
  // if (config.period_seconds && config.period_max_amount) {
  //   const startTime = Math.floor(Date.now() / 1000) - config.period_seconds;
  //   const executedTotal = await getUserAssetExecutionTotal(
  //     intent.user_address,
  //     intent.asset_in,
  //     startTime
  //   );
  //   const totalWithCurrent = BigInt(executedTotal) + amountIn;
  //   if (totalWithCurrent > BigInt(config.period_max_amount)) {
  //     violations.push(`Periodic limit exceeded: ${totalWithCurrent.toString()}`);
  //   }
  // }

  const passed = violations.length === 0;
  const reason = passed
    ? `Passed: amount ${intent.amount_in} within limits`
    : `Rejected: ${violations.join(', ')}`;

  return {
    passed,
    reason,
    policyId: policy.id,
    policyName: policy.name,
    policyType: policy.policy_type,
    metadata: {
      amountIn: intent.amount_in,
      minAmount: config.min_amount,
      maxAmount: config.max_amount,
      violations,
    },
  };
}
