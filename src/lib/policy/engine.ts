/**
 * Policy Engine Core
 * Orchestrates policy evaluation for intents
 */
import { Intent } from '@/types/intent';
import { PolicyType } from '@/types/policy';
import { getActivePolicies } from '@/lib/db/policies';
import { createAuditArtifact } from '@/lib/db/audit';
import {
  IntentValidationResult,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PolicyRuleHandler,
  PolicyRuleRegistry,
  PolicyEvaluationError,
} from './types';
import { evaluateAllowDenyList } from './rules/allowDenyList';
import { evaluateTradeLimits } from './rules/tradeLimits';
import { evaluateVenueAllowlist } from './rules/venueAllowlist';

/**
 * Registry of policy rule handlers
 * Maps policy types to their evaluation functions
 */
const POLICY_RULE_REGISTRY: PolicyRuleRegistry = {
  allow_deny_list: evaluateAllowDenyList,
  trade_limit: evaluateTradeLimits,
  venue_allowlist: evaluateVenueAllowlist,
  custom: evaluateCustomPolicy,
};

/**
 * Custom policy handler (placeholder)
 * Custom policies need to be implemented based on specific requirements
 */
async function evaluateCustomPolicy(
  context: PolicyEvaluationContext
): Promise<PolicyEvaluationResult> {
  const { policy } = context;

  // For now, custom policies always pass with a warning
  // In production, you would implement custom logic here
  return {
    passed: true,
    reason: 'Custom policy evaluation not implemented - defaulting to pass',
    policyId: policy.id,
    policyName: policy.name,
    policyType: policy.policy_type,
    metadata: {
      warning: 'Custom policy handler not implemented',
      config: policy.config,
    },
  };
}

/**
 * Validate an intent against all active policies
 * @param intent The intent to validate
 * @param recordAudit Whether to record audit artifacts (default: true)
 * @returns Complete validation result
 */
export async function validateIntent(
  intent: Intent,
  recordAudit: boolean = true
): Promise<IntentValidationResult> {
  const evaluatedAt = new Date();
  const evaluations: PolicyEvaluationResult[] = [];

  try {
    // Get all active policies, ordered by priority
    const policies = await getActivePolicies();

    if (policies.length === 0) {
      // No policies defined - should we allow or deny?
      // For security, default to deny when no policies exist
      return {
        passed: false,
        evaluations: [],
        passedPolicies: [],
        failedPolicies: [],
        evaluatedAt,
      };
    }

    // Evaluate each policy
    for (const policy of policies) {
      try {
        // Get the appropriate rule handler for this policy type
        const handler = POLICY_RULE_REGISTRY[policy.policy_type];

        if (!handler) {
          throw new PolicyEvaluationError(
            `No handler found for policy type: ${policy.policy_type}`,
            policy.id,
            policy.policy_type
          );
        }

        // Build evaluation context
        const context: PolicyEvaluationContext = {
          intent,
          policy,
        };

        // Execute policy evaluation
        const result = await handler(context);
        evaluations.push(result);

        // Record audit artifact if requested
        if (recordAudit) {
          await createAuditArtifact({
            intent_id: intent.id,
            artifact_type: 'policy_evaluation',
            data: {
              policyId: result.policyId,
              policyName: result.policyName,
              policyType: result.policyType,
              passed: result.passed,
              reason: result.reason,
              metadata: result.metadata,
            },
          });
        }
      } catch (error) {
        // Handle policy evaluation errors
        const errorResult: PolicyEvaluationResult = {
          passed: false,
          reason:
            error instanceof PolicyEvaluationError
              ? error.message
              : 'Policy evaluation failed with unexpected error',
          policyId: policy.id,
          policyName: policy.name,
          policyType: policy.policy_type,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        };

        evaluations.push(errorResult);

        // Record error in audit trail
        if (recordAudit) {
          await createAuditArtifact({
            intent_id: intent.id,
            artifact_type: 'error_logged',
            data: {
              policyId: policy.id,
              policyName: policy.name,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
          });
        }
      }
    }

    // Separate passed and failed policies
    const passedPolicies = evaluations.filter((e) => e.passed);
    const failedPolicies = evaluations.filter((e) => !e.passed);

    // Overall validation passes only if ALL policies pass
    const passed = failedPolicies.length === 0;

    return {
      passed,
      evaluations,
      passedPolicies,
      failedPolicies,
      evaluatedAt,
    };
  } catch (error) {
    // Unexpected error during validation
    console.error('Intent validation error:', error);

    // Record critical error
    if (recordAudit) {
      await createAuditArtifact({
        intent_id: intent.id,
        artifact_type: 'error_logged',
        data: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          phase: 'validation',
        },
      });
    }

    throw error;
  }
}

/**
 * Get the rule handler for a specific policy type
 */
export function getRuleHandler(policyType: PolicyType): PolicyRuleHandler {
  const handler = POLICY_RULE_REGISTRY[policyType];

  if (!handler) {
    throw new Error(`No handler found for policy type: ${policyType}`);
  }

  return handler;
}

/**
 * Check if a policy type has a registered handler
 */
export function hasRuleHandler(policyType: PolicyType): boolean {
  return policyType in POLICY_RULE_REGISTRY;
}
