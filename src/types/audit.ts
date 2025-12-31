export type ArtifactType =
  | 'policy_evaluation'
  | 'transaction_submitted'
  | 'event_decoded'
  | 'error_logged'
  | 'state_change';

export interface PolicyEvaluationArtifact {
  policy_id: string;
  result: 'pass' | 'fail';
  reason: string | null;
}

export interface EventDecodedArtifact {
  event_name: string;
  args: Record<string, unknown>;
}

export interface ErrorLoggedArtifact {
  error: string;
  stack?: string;
}

export type ArtifactData =
  | PolicyEvaluationArtifact
  | EventDecodedArtifact
  | ErrorLoggedArtifact
  | Record<string, unknown>;

export interface AuditArtifact {
  id: string;
  intent_id: string;
  execution_id: string | null;
  artifact_type: ArtifactType;
  data: ArtifactData;
  hash: string | null;
  created_at: Date;
}

export interface AuditArtifactInput {
  intent_id: string;
  execution_id?: string;
  artifact_type: ArtifactType;
  data: ArtifactData;
}
