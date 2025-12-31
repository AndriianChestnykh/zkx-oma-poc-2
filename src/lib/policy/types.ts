/**
 * Policy Engine Types
 * Defines interfaces for policy evaluation and rule handling
 */
import { Intent } from '@/types/intent';
import { Policy, PolicyType } from '@/types/policy';

/**
 * Result of policy evaluation
 */
export interface PolicyEvaluationResult {
  /** Whether the intent passed the policy check */
  passed: boolean;

  /** Human-readable reason for the result */
  reason: string;

  /** Policy that was evaluated */
  policyId: string;
  policyName: string;
  policyType: PolicyType;

  /** Additional metadata about the evaluation */
  metadata?: Record<string, any>;
}

/**
 * Complete evaluation result for all policies
 */
export interface IntentValidationResult {
  /** Overall validation result */
  passed: boolean;

  /** Individual policy evaluation results */
  evaluations: PolicyEvaluationResult[];

  /** Policies that passed */
  passedPolicies: PolicyEvaluationResult[];

  /** Policies that failed */
  failedPolicies: PolicyEvaluationResult[];

  /** Timestamp of evaluation */
  evaluatedAt: Date;
}

/**
 * Context for policy evaluation
 * Contains all information needed to evaluate a policy
 */
export interface PolicyEvaluationContext {
  intent: Intent;
  policy: Policy;

  /** Additional context data (e.g., current prices, user history) */
  additionalData?: Record<string, any>;
}

/**
 * Policy rule handler function signature
 * Each policy type has a corresponding rule handler
 */
export type PolicyRuleHandler = (
  context: PolicyEvaluationContext
) => Promise<PolicyEvaluationResult>;

/**
 * Registry mapping policy types to their handlers
 */
export type PolicyRuleRegistry = {
  [K in PolicyType]: PolicyRuleHandler;
};

/**
 * Policy evaluation error
 */
export class PolicyEvaluationError extends Error {
  constructor(
    message: string,
    public policyId: string,
    public policyType: PolicyType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PolicyEvaluationError';
  }
}
