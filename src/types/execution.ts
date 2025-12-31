export type ExecutionStatus = 'pending' | 'success' | 'reverted' | 'failed';

export interface Execution {
  id: string;
  intent_id: string;
  tx_hash: string | null;
  block_number: number | null;
  block_timestamp: number | null;
  gas_used: number | null;
  status: ExecutionStatus;
  revert_reason: string | null;
  actual_amount_out: string | null;
  execution_price: string | null;
  executed_at: Date;
}

export interface ExecutionInput {
  intent_id: string;
  tx_hash?: string;
  block_number?: number;
  block_timestamp?: number;
  gas_used?: number;
  status: ExecutionStatus;
  revert_reason?: string;
  actual_amount_out?: string;
  execution_price?: string;
}
