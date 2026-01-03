/**
 * Blockchain client configuration using viem
 * Provides configured clients for reading and writing to Anvil
 */
import { createPublicClient, createWalletClient, http } from 'viem';
import { defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Anvil configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const CHAIN_ID = parseInt(process.env.CHAIN_ID as string) || 31337;

// Anvil default account[0] private key
// Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const chain = defineChain({
  id: CHAIN_ID,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
});

/**
 * Public client for reading blockchain data
 * Use for: calling view functions, getting events, reading state
 */
export const publicClient = createPublicClient({
  chain: chain,
  transport: http(RPC_URL),
});

/**
 * Get wallet client for writing transactions
 * Use for: sending transactions, signing messages
 */
export function getWalletClient() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

  return createWalletClient({
    account,
    chain: chain,
    transport: http(RPC_URL),
  });
}

/**
 * Get the default account address
 */
export function getDefaultAccount() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  return account.address;
}

/**
 * Health check for blockchain connection
 */
export async function checkBlockchainConnection(): Promise<boolean> {
  try {
    const blockNumber = await publicClient.getBlockNumber();
    return blockNumber !== undefined;
  } catch (error) {
    console.error('Blockchain connection error:', error);
    return false;
  }
}
