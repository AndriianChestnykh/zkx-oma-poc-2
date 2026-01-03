/**
 * EIP-712 typed data structures for intent signing
 * Shared between client-side (wallet) and server-side signing
 */
import { Hex } from 'viem';
import { CONTRACT_ADDRESSES } from '../blockchain/contracts';
import type { Intent } from '@/types/intent';

const CHAIN_ID = parseInt(process.env.CHAIN_ID as string) || 31337;

// EIP-712 domain for OMAAccount
export const EIP712_DOMAIN = {
  name: 'OMAAccount',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESSES.OMAAccount as Hex,
} as const;

// EIP-712 types for Intent
export const INTENT_TYPES = {
  Intent: [
    { name: 'user', type: 'address' },
    { name: 'assetIn', type: 'address' },
    { name: 'assetOut', type: 'address' },
    { name: 'amountIn', type: 'uint256' },
    { name: 'amountOutMin', type: 'uint256' },
    { name: 'venue', type: 'string' },
    { name: 'deadline', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

/**
 * Convert Intent from database format to contract format
 * Used for both client-side and server-side signing
 */
export function intentToContractFormat(intent: Intent | Partial<Intent>) {
  return {
    user: intent.user_address as Hex,
    assetIn: intent.asset_in as Hex,
    assetOut: intent.asset_out as Hex,
    amountIn: BigInt(intent.amount_in || '0'),
    amountOutMin: BigInt(intent.amount_out_min || '0'),
    venue: intent.venue || '',
    deadline: BigInt(intent.deadline || 0),
    nonce: BigInt(intent.nonce || 0),
  };
}

/**
 * Convert form data to typed data message format
 * For use with wagmi's signTypedData hook
 */
export interface IntentFormData {
  user_address: string;
  asset_in: string;
  asset_out: string;
  amount_in: string;
  amount_out_min: string;
  venue: string;
  deadline: number;
  nonce: number;
}

export function formDataToTypedMessage(formData: IntentFormData) {
  return {
    user: formData.user_address as Hex,
    assetIn: formData.asset_in as Hex,
    assetOut: formData.asset_out as Hex,
    amountIn: BigInt(formData.amount_in),
    amountOutMin: BigInt(formData.amount_out_min),
    venue: formData.venue,
    deadline: BigInt(formData.deadline),
    nonce: BigInt(formData.nonce),
  };
}