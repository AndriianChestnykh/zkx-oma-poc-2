export type IntentStatus =
  | 'created'
  | 'validated'
  | 'executing'
  | 'executed'
  | 'rejected'
  | 'failed';

export interface Intent {
  id: string;
  user_address: string;
  asset_in: string;
  asset_out: string;
  amount_in: string;
  amount_out_min: string;
  venue: string;
  deadline: number;
  status: IntentStatus;
  nonce: number;
  signature: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IntentInput {
  user_address: string;
  asset_in: string;
  asset_out: string;
  amount_in: string;
  amount_out_min: string;
  venue: string;
  deadline: number;
  nonce: number;
  signature?: string;
}
