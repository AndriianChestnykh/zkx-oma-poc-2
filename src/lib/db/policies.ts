/**
 * Database queries for policy management
 */
import { query } from './connection';
import { Policy, PolicyInput, PolicyType } from '@/types/policy';
import { DatabaseError, NotFoundError } from '@/lib/utils/errors';

export interface PolicyFilters {
  enabled?: boolean;
  policyType?: PolicyType;
  limit?: number;
  offset?: number;
}

/**
 * Create a new policy
 */
export async function createPolicy(data: PolicyInput): Promise<Policy> {
  const sql = `
    INSERT INTO policies (
      name, description, policy_type, config, enabled, priority
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    data.name,
    data.description || null,
    data.policy_type,
    JSON.stringify(data.config),
    data.enabled !== undefined ? data.enabled : true,
    data.priority || 0,
  ];

  try {
    const result = await query<Policy>(sql, values);

    if (result.rows.length === 0) {
      throw new DatabaseError('Failed to create policy');
    }

    return result.rows[0];
  } catch (error: any) {
    throw new DatabaseError('Failed to create policy', error);
  }
}

/**
 * Get policy by ID
 */
export async function getPolicyById(id: string): Promise<Policy> {
  const sql = 'SELECT * FROM policies WHERE id = $1';

  try {
    const result = await query<Policy>(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Policy', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch policy', error as Error);
  }
}

/**
 * List policies with optional filters
 */
export async function listPolicies(filters: PolicyFilters = {}): Promise<Policy[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 0;

  if (filters.enabled !== undefined) {
    paramCount++;
    conditions.push(`enabled = $${paramCount}`);
    values.push(filters.enabled);
  }

  if (filters.policyType) {
    paramCount++;
    conditions.push(`policy_type = $${paramCount}`);
    values.push(filters.policyType);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = filters.limit || 100;
  const offset = filters.offset || 0;

  paramCount++;
  const limitClause = `LIMIT $${paramCount}`;
  values.push(limit);

  paramCount++;
  const offsetClause = `OFFSET $${paramCount}`;
  values.push(offset);

  const sql = `
    SELECT * FROM policies
    ${whereClause}
    ORDER BY priority ASC, created_at DESC
    ${limitClause} ${offsetClause}
  `;

  try {
    const result = await query<Policy>(sql, values);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to list policies', error as Error);
  }
}

/**
 * Get all active policies ordered by priority
 */
export async function getActivePolicies(): Promise<Policy[]> {
  const sql = `
    SELECT * FROM policies
    WHERE enabled = true
    ORDER BY priority ASC, created_at ASC
  `;

  try {
    const result = await query<Policy>(sql);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to fetch active policies', error as Error);
  }
}

/**
 * Update policy
 */
export async function updatePolicy(
  id: string,
  data: Partial<PolicyInput>
): Promise<Policy> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 0;

  if (data.name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    values.push(data.name);
  }

  if (data.description !== undefined) {
    paramCount++;
    updates.push(`description = $${paramCount}`);
    values.push(data.description);
  }

  if (data.policy_type !== undefined) {
    paramCount++;
    updates.push(`policy_type = $${paramCount}`);
    values.push(data.policy_type);
  }

  if (data.config !== undefined) {
    paramCount++;
    updates.push(`config = $${paramCount}`);
    values.push(JSON.stringify(data.config));
  }

  if (data.enabled !== undefined) {
    paramCount++;
    updates.push(`enabled = $${paramCount}`);
    values.push(data.enabled);
  }

  if (data.priority !== undefined) {
    paramCount++;
    updates.push(`priority = $${paramCount}`);
    values.push(data.priority);
  }

  if (updates.length === 0) {
    throw new DatabaseError('No fields to update');
  }

  paramCount++;
  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  paramCount++;
  values.push(id);

  const sql = `
    UPDATE policies
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await query<Policy>(sql, values);

    if (result.rows.length === 0) {
      throw new NotFoundError('Policy', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to update policy', error as Error);
  }
}

/**
 * Delete policy
 */
export async function deletePolicy(id: string): Promise<void> {
  const sql = 'DELETE FROM policies WHERE id = $1 RETURNING id';

  try {
    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Policy', id);
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to delete policy', error as Error);
  }
}

/**
 * Get policy count by type
 */
export async function getPolicyStats(): Promise<{
  total: number;
  enabled: number;
  disabled: number;
  byType: Record<PolicyType, number>;
}> {
  const sql = `
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE enabled = true) as enabled,
      COUNT(*) FILTER (WHERE enabled = false) as disabled,
      COUNT(*) FILTER (WHERE policy_type = 'allow_deny_list') as allow_deny_list,
      COUNT(*) FILTER (WHERE policy_type = 'trade_limit') as trade_limit,
      COUNT(*) FILTER (WHERE policy_type = 'venue_allowlist') as venue_allowlist,
      COUNT(*) FILTER (WHERE policy_type = 'custom') as custom
    FROM policies
  `;

  try {
    const result = await query<any>(sql);
    const row = result.rows[0];

    return {
      total: parseInt(row.total) || 0,
      enabled: parseInt(row.enabled) || 0,
      disabled: parseInt(row.disabled) || 0,
      byType: {
        allow_deny_list: parseInt(row.allow_deny_list) || 0,
        trade_limit: parseInt(row.trade_limit) || 0,
        venue_allowlist: parseInt(row.venue_allowlist) || 0,
        custom: parseInt(row.custom) || 0,
      },
    };
  } catch (error) {
    throw new DatabaseError('Failed to get policy stats', error as Error);
  }
}
