/**
 * Database queries for intent executions
 */
import { query } from './connection';
import { Execution, ExecutionInput, ExecutionStatus } from '@/types/execution';
import { DatabaseError, NotFoundError } from '@/lib/utils/errors';

/**
 * Create an execution record
 */
export async function createExecution(data: ExecutionInput): Promise<Execution> {
  const sql = `
    INSERT INTO executions (
      intent_id, tx_hash, block_number, block_timestamp, gas_used,
      status, revert_reason, actual_amount_out, execution_price
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    data.intent_id,
    data.tx_hash || null,
    data.block_number || null,
    data.block_timestamp || null,
    data.gas_used || null,
    data.status,
    data.revert_reason || null,
    data.actual_amount_out || null,
    data.execution_price || null,
  ];

  try {
    const result = await query<Execution>(sql, values);

    if (result.rows.length === 0) {
      throw new DatabaseError('Failed to create execution');
    }

    return result.rows[0];
  } catch (error: any) {
    throw new DatabaseError('Failed to create execution', error);
  }
}

/**
 * Get execution by ID
 */
export async function getExecutionById(id: string): Promise<Execution> {
  const sql = 'SELECT * FROM executions WHERE id = $1';

  try {
    const result = await query<Execution>(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Execution', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to fetch execution', error as Error);
  }
}

/**
 * Get execution by intent ID
 */
export async function getExecutionByIntentId(intentId: string): Promise<Execution | null> {
  const sql = 'SELECT * FROM executions WHERE intent_id = $1 ORDER BY executed_at DESC LIMIT 1';

  try {
    const result = await query<Execution>(sql, [intentId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    throw new DatabaseError('Failed to fetch execution by intent', error as Error);
  }
}

/**
 * Get execution by transaction hash
 */
export async function getExecutionByTxHash(txHash: string): Promise<Execution | null> {
  const sql = 'SELECT * FROM executions WHERE tx_hash = $1';

  try {
    const result = await query<Execution>(sql, [txHash]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    throw new DatabaseError('Failed to fetch execution by tx hash', error as Error);
  }
}

/**
 * Update execution status and details
 */
export async function updateExecution(
  id: string,
  data: Partial<ExecutionInput>
): Promise<Execution> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 0;

  if (data.tx_hash !== undefined) {
    paramCount++;
    updates.push(`tx_hash = $${paramCount}`);
    values.push(data.tx_hash);
  }

  if (data.block_number !== undefined) {
    paramCount++;
    updates.push(`block_number = $${paramCount}`);
    values.push(data.block_number);
  }

  if (data.block_timestamp !== undefined) {
    paramCount++;
    updates.push(`block_timestamp = $${paramCount}`);
    values.push(data.block_timestamp);
  }

  if (data.gas_used !== undefined) {
    paramCount++;
    updates.push(`gas_used = $${paramCount}`);
    values.push(data.gas_used);
  }

  if (data.status !== undefined) {
    paramCount++;
    updates.push(`status = $${paramCount}`);
    values.push(data.status);
  }

  if (data.revert_reason !== undefined) {
    paramCount++;
    updates.push(`revert_reason = $${paramCount}`);
    values.push(data.revert_reason);
  }

  if (data.actual_amount_out !== undefined) {
    paramCount++;
    updates.push(`actual_amount_out = $${paramCount}`);
    values.push(data.actual_amount_out);
  }

  if (data.execution_price !== undefined) {
    paramCount++;
    updates.push(`execution_price = $${paramCount}`);
    values.push(data.execution_price);
  }

  if (updates.length === 0) {
    throw new DatabaseError('No fields to update');
  }

  paramCount++;
  values.push(id);

  const sql = `
    UPDATE executions
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await query<Execution>(sql, values);

    if (result.rows.length === 0) {
      throw new NotFoundError('Execution', id);
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to update execution', error as Error);
  }
}

/**
 * Get executions by user address (for trade limit calculations)
 * @param userAddress User's Ethereum address
 * @param startTime Optional start time filter (Unix timestamp)
 * @param endTime Optional end time filter (Unix timestamp)
 */
export async function getExecutionsByUser(
  userAddress: string,
  startTime?: number,
  endTime?: number
): Promise<Execution[]> {
  let sql = `
    SELECT e.* FROM executions e
    INNER JOIN intents i ON e.intent_id = i.id
    WHERE i.user_address = $1
      AND e.status = 'success'
  `;

  const values: any[] = [userAddress];
  let paramCount = 1;

  if (startTime !== undefined) {
    paramCount++;
    sql += ` AND e.block_timestamp >= $${paramCount}`;
    values.push(startTime);
  }

  if (endTime !== undefined) {
    paramCount++;
    sql += ` AND e.block_timestamp <= $${paramCount}`;
    values.push(endTime);
  }

  sql += ' ORDER BY e.executed_at DESC';

  try {
    const result = await query<Execution>(sql, values);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to fetch user executions', error as Error);
  }
}

/**
 * Get total executed amount for a user and asset within a time period
 * Used for trade limit policy enforcement
 */
export async function getUserAssetExecutionTotal(
  userAddress: string,
  assetIn: string,
  startTime: number
): Promise<string> {
  const sql = `
    SELECT COALESCE(SUM(CAST(i.amount_in AS NUMERIC)), 0) as total
    FROM executions e
    INNER JOIN intents i ON e.intent_id = i.id
    WHERE i.user_address = $1
      AND i.asset_in = $2
      AND e.status = 'success'
      AND e.block_timestamp >= $3
  `;

  try {
    const result = await query<{ total: string }>(sql, [userAddress, assetIn, startTime]);

    if (result.rows.length === 0) {
      return '0';
    }

    return result.rows[0].total;
  } catch (error) {
    throw new DatabaseError('Failed to calculate execution total', error as Error);
  }
}

/**
 * List all executions with optional filters
 */
export async function listExecutions(filters?: {
  status?: ExecutionStatus;
  limit?: number;
  offset?: number;
}): Promise<Execution[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 0;

  if (filters?.status) {
    paramCount++;
    conditions.push(`status = $${paramCount}`);
    values.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  paramCount++;
  const limitClause = `LIMIT $${paramCount}`;
  values.push(limit);

  paramCount++;
  const offsetClause = `OFFSET $${paramCount}`;
  values.push(offset);

  const sql = `
    SELECT * FROM executions
    ${whereClause}
    ORDER BY executed_at DESC
    ${limitClause} ${offsetClause}
  `;

  try {
    const result = await query<Execution>(sql, values);
    return result.rows;
  } catch (error) {
    throw new DatabaseError('Failed to list executions', error as Error);
  }
}

/**
 * Get execution statistics
 */
export async function getExecutionStats(): Promise<{
  total: number;
  success: number;
  failed: number;
  reverted: number;
  pending: number;
}> {
  const sql = `
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'success') as success,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status = 'reverted') as reverted,
      COUNT(*) FILTER (WHERE status = 'pending') as pending
    FROM executions
  `;

  try {
    const result = await query<any>(sql);
    const row = result.rows[0];

    return {
      total: parseInt(row.total) || 0,
      success: parseInt(row.success) || 0,
      failed: parseInt(row.failed) || 0,
      reverted: parseInt(row.reverted) || 0,
      pending: parseInt(row.pending) || 0,
    };
  } catch (error) {
    throw new DatabaseError('Failed to get execution stats', error as Error);
  }
}
