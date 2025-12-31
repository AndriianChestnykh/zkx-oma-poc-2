/**
 * Authorization and signature utilities
 * Handles EIP-712 signature generation for intents
 */
import { Intent } from '@/types/intent';
import { privateKeyToAccount } from 'viem/accounts';
import { Hex, hashTypedData } from 'viem';
import { CONTRACT_ADDRESSES } from '../blockchain/contracts';

// EIP-712 domain for OMAAccount
const EIP712_DOMAIN = {
  name: 'OMAAccount',
  version: '1',
  chainId: 31337, // Anvil chain ID
  verifyingContract: CONTRACT_ADDRESSES.OMAAccount,
} as const;

// EIP-712 types for Intent
const INTENT_TYPES = {
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
 */
export function intentToContractFormat(intent: Intent) {
  return {
    user: intent.user_address as Hex,
    assetIn: intent.asset_in as Hex,
    assetOut: intent.asset_out as Hex,
    amountIn: BigInt(intent.amount_in),
    amountOutMin: BigInt(intent.amount_out_min),
    venue: intent.venue,
    deadline: BigInt(intent.deadline),
    nonce: BigInt(intent.nonce),
  };
}

/**
 * Sign an intent using EIP-712
 * @param intent The intent to sign
 * @param privateKey The private key to sign with (0x... format)
 * @returns The signature as a hex string
 */
export async function signIntent(intent: Intent, privateKey: Hex): Promise<Hex> {
  const account = privateKeyToAccount(privateKey);

  const message = intentToContractFormat(intent);

  const signature = await account.signTypedData({
    domain: EIP712_DOMAIN,
    types: INTENT_TYPES,
    primaryType: 'Intent',
    message,
  });

  return signature;
}

/**
 * Get the EIP-712 hash for an intent
 * @param intent The intent
 * @returns The typed data hash
 */
export function getIntentTypedDataHash(intent: Intent): Hex {
  const message = intentToContractFormat(intent);

  return hashTypedData({
    domain: EIP712_DOMAIN,
    types: INTENT_TYPES,
    primaryType: 'Intent',
    message,
  });
}

/**
 * Generate a unique nonce for a user
 * Uses timestamp + random component
 */
export function generateNonce(): number {
  // Use timestamp in seconds + random component
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1000);
  return timestamp * 1000 + random;
}

/**
 * Get Anvil's default private key for testing
 * Account[0]: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
 */
export const ANVIL_DEFAULT_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex;
