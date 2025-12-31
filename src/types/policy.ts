export type PolicyType =
  | 'allow_deny_list'
  | 'trade_limit'
  | 'venue_allowlist'
  | 'custom';

export interface AllowDenyListConfig {
  mode: 'allowlist' | 'denylist';
  addresses: string[];
}

export interface TradeLimitConfig {
  asset: string;
  max_amount: string;
  period_seconds: number;
}

export interface VenueAllowlistConfig {
  allowed_venues: string[];
}

export type PolicyConfig =
  | AllowDenyListConfig
  | TradeLimitConfig
  | VenueAllowlistConfig
  | Record<string, unknown>;

export interface Policy {
  id: string;
  name: string;
  description: string | null;
  policy_type: PolicyType;
  config: PolicyConfig;
  enabled: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface PolicyInput {
  name: string;
  description?: string;
  policy_type: PolicyType;
  config: PolicyConfig;
  enabled?: boolean;
  priority?: number;
}

export interface PolicyEvaluationResult {
  policy_id: string;
  policy_name: string;
  passed: boolean;
  reason?: string;
}
