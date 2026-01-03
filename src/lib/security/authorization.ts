/**
 * Authorization and signature utilities
 * Handles EIP-712 signature generation for intents (server-side)
 */
import { Intent } from '@/types/intent';
import { privateKeyToAccount } from 'viem/accounts';
import { Hex, hashTypedData } from 'viem';
import { EIP712_DOMAIN, INTENT_TYPES, intentToContractFormat } from '../wallet/eip712';

// Re-export for backward compatibility
export { EIP712_DOMAIN, INTENT_TYPES, intentToContractFormat };

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
