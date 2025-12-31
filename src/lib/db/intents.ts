/**
 * Database queries for intent management
 */
import { query } from './connection';
import { Intent, IntentInput, IntentStatus } from '@/types/intent';
import { DatabaseError, NotFoundError } from '@/lib/utils/errors';

export interface IntentFilters {
  status?: IntentStatus;
  userAddress?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new intent
 */
export async function createIntent(data: IntentInput): Promise<Intent> {
  const sql = `
    INSERT INTO intents (
      user_address, asset_in, asset_out, amount_in, amount_out_min,
      venue, deadline, nonce, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    data.user_address,
    data.asset_in,
    data.asset_out,
    data.amount_in,
    data.amount_out_min,
    data.venue,
    data.deadline,
    data.nonce,
    data.status || 'created',
  ];

  try {
    const result = await query<Intent>(sql, values);

    if (result.rows.length === 0) {
      throw new DatabaseError('Failed to create intent');
    }

    return result.rows[0];
  } catch (error: any) {
    // Handle unique constraint violation for nonce
    if (error.code === '23505' && error.constraint === 'unique_user_nonce') {
      throw new DatabaseError('Nonce already used for this user');
    }
    throw new DatabaseError('Failed to create intent', error);
  }
}

/**
 * Get intent by ID
 */
export async function getIntentById(id: string): Promise<Intent> {
  const sql = 'SELECT * FROM intents WHERE id = $1';

  try {
    const result = await query<Intent>(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Intent', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch intent', error as Error);
  }
}

/**
 * List intents with optional filters
 */
export async function listIntents(filters: IntentFilters = {}): Promise<Intent[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 0;

  if (filters.status) {
    paramCount++;
    conditions.push(`status = $${paramCount}`);
    values.push(filters.status);
  }

  if (filters.userAddress) {
    paramCount++;
    conditions.push(`user_address = $${paramCount}`);
    values.push(filters.userAddress);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  paramCount++;
  const limitClause = `LIMIT $${paramCount}`;
  values.push(limit);

  paramCount++;
  const offsetClause = `OFFSET $${paramCount}`;
  values.push(offset);

  const sql = `
    SELECT * FROM intents
    ${whereClause}
    ORDER BY created_at DESC
    ${limitClause} ${offsetClause}
  `;

  try {
    const result = await query<Intent>(sql, values);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to list intents', error as Error);
  }
}

/**
 * Update intent status
 */
export async function updateIntentStatus(
  id: string,
  status: IntentStatus
): Promise<Intent> {
  const sql = `
    UPDATE intents
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  try {
    const result = await query<Intent>(sql, [status, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Intent', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to update intent status', error as Error);
  }
}

/**
 * Update intent signature
 */
export async function updateIntentSignature(
  id: string,
  signature: string
): Promise<Intent> {
  const sql = `
    UPDATE intents
    SET signature = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  try {
    const result = await query<Intent>(sql, [signature, id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Intent', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to update intent signature', error as Error);
  }
}

/**
 * Check if a nonce has been used for a user
 */
export async function checkNonceUsed(
  userAddress: string,
  nonce: number
): Promise<boolean> {
  const sql = `
    SELECT EXISTS (
      SELECT 1 FROM intents
      WHERE user_address = $1 AND nonce = $2
    ) as exists
  `;

  try {
    const result = await query<{ exists: boolean }>(sql, [userAddress, nonce]);
    return result.rows[0]?.exists || false;
  } catch (error) {
    throw new DatabaseError('Failed to check nonce', error as Error);
  }
}

/**
 * Get intents count by status
 */
export async function getIntentStats(): Promise<{
  total: number;
  created: number;
  validated: number;
  executing: number;
  executed: number;
  rejected: number;
  failed: number;
}> {
  const sql = `
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'created') as created,
      COUNT(*) FILTER (WHERE status = 'validated') as validated,
      COUNT(*) FILTER (WHERE status = 'executing') as executing,
      COUNT(*) FILTER (WHERE status = 'executed') as executed,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status = 'failed') as failed
    FROM intents
  `;

  try {
    const result = await query<any>(sql);
    const row = result.rows[0];

    return {
      total: parseInt(row.total) || 0,
      created: parseInt(row.created) || 0,
      validated: parseInt(row.validated) || 0,
      executing: parseInt(row.executing) || 0,
      executed: parseInt(row.executed) || 0,
      rejected: parseInt(row.rejected) || 0,
      failed: parseInt(row.failed) || 0,
    };
  } catch (error) {
    throw new DatabaseError('Failed to get intent stats', error as Error);
  }
}
