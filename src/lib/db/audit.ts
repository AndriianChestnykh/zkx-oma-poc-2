/**
 * Database queries for audit artifacts
 */
import { query } from './connection';
import { AuditArtifact, AuditArtifactInput, ArtifactType } from '@/types/audit';
import { DatabaseError } from '@/lib/utils/errors';

/**
 * Create an audit artifact
 */
export async function createAuditArtifact(input: AuditArtifactInput): Promise<AuditArtifact> {
  const sql = `
    INSERT INTO audit_artifacts (
      intent_id, execution_id, artifact_type, data
    ) VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    input.intent_id,
    input.execution_id || null,
    input.artifact_type,
    JSON.stringify(input.data),
  ];

  try {
    const result = await query<AuditArtifact>(sql, values);

    if (result.rows.length === 0) {
      throw new DatabaseError('Failed to create audit artifact');
    }

    return result.rows[0];
  } catch (error: any) {
    throw new DatabaseError('Failed to create audit artifact', error);
  }
}

/**
 * Get complete audit trail for an intent
 */
export async function getAuditTrail(intentId: string): Promise<AuditArtifact[]> {
  const sql = `
    SELECT * FROM audit_artifacts
    WHERE intent_id = $1
    ORDER BY created_at ASC
  `;

  try {
    const result = await query<AuditArtifact>(sql, [intentId]);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to fetch audit trail', error as Error);
  }
}

/**
 * Get audit artifacts by execution ID
 */
export async function getExecutionArtifacts(executionId: string): Promise<AuditArtifact[]> {
  const sql = `
    SELECT * FROM audit_artifacts
    WHERE execution_id = $1
    ORDER BY created_at ASC
  `;

  try {
    const result = await query<AuditArtifact>(sql, [executionId]);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to fetch execution artifacts', error as Error);
  }
}

/**
 * Get artifacts by type
 */
export async function getArtifactsByType(
  intentId: string,
  artifactType: ArtifactType
): Promise<AuditArtifact[]> {
  const sql = `
    SELECT * FROM audit_artifacts
    WHERE intent_id = $1 AND artifact_type = $2
    ORDER BY created_at ASC
  `;

  try {
    const result = await query<AuditArtifact>(sql, [intentId, artifactType]);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to fetch artifacts by type', error as Error);
  }
}

/**
 * Verify artifact hash integrity
 * Recomputes the hash and compares with stored value
 */
export async function verifyArtifactHash(id: string): Promise<boolean> {
  const sql = `
    SELECT
      hash as stored_hash,
      encode(digest(data::text, 'sha256'), 'hex') as computed_hash
    FROM audit_artifacts
    WHERE id = $1
  `;

  try {
    const result = await query<{ stored_hash: string; computed_hash: string }>(sql, [id]);

    if (result.rows.length === 0) {
      throw new DatabaseError('Audit artifact not found');
    }

    const { stored_hash, computed_hash } = result.rows[0];
    return stored_hash === computed_hash;
  } catch (error) {
    throw new DatabaseError('Failed to verify artifact hash', error as Error);
  }
}

/**
 * Get policy evaluation artifacts for an intent
 */
export async function getPolicyEvaluations(intentId: string): Promise<AuditArtifact[]> {
  return getArtifactsByType(intentId, 'policy_evaluation');
}

/**
 * Get error logs for an intent
 */
export async function getErrorLogs(intentId: string): Promise<AuditArtifact[]> {
  return getArtifactsByType(intentId, 'error_logged');
}

/**
 * Count artifacts by type
 */
export async function getArtifactStats(intentId: string): Promise<{
  total: number;
  policyEvaluations: number;
  transactionsSubmitted: number;
  eventsDecoded: number;
  errorsLogged: number;
  stateChanges: number;
}> {
  const sql = `
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE artifact_type = 'policy_evaluation') as policy_evaluations,
      COUNT(*) FILTER (WHERE artifact_type = 'transaction_submitted') as transactions_submitted,
      COUNT(*) FILTER (WHERE artifact_type = 'event_decoded') as events_decoded,
      COUNT(*) FILTER (WHERE artifact_type = 'error_logged') as errors_logged,
      COUNT(*) FILTER (WHERE artifact_type = 'state_change') as state_changes
    FROM audit_artifacts
    WHERE intent_id = $1
  `;

  try {
    const result = await query<any>(sql, [intentId]);
    const row = result.rows[0];

    return {
      total: parseInt(row.total) || 0,
      policyEvaluations: parseInt(row.policy_evaluations) || 0,
      transactionsSubmitted: parseInt(row.transactions_submitted) || 0,
      eventsDecoded: parseInt(row.events_decoded) || 0,
      errorsLogged: parseInt(row.errors_logged) || 0,
      stateChanges: parseInt(row.state_changes) || 0,
    };
  } catch (error) {
    throw new DatabaseError('Failed to get artifact stats', error as Error);
  }
}
