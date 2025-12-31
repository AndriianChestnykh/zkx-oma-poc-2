/**
 * Blockchain execution logic
 * Handles on-chain intent execution via OMAAccount contract
 */
import { Intent } from '@/types/intent';
import { Hex, decodeEventLog } from 'viem';
import { getWalletClient, publicClient } from './client';
import { getContractConfig } from './contracts';
import { signIntent, intentToContractFormat, ANVIL_DEFAULT_PRIVATE_KEY } from '../security/authorization';

export interface ExecutionResult {
  success: boolean;
  txHash?: Hex;
  blockNumber?: bigint;
  gasUsed?: bigint;
  amountOut?: string;
  error?: string;
  revertReason?: string;
}

/**
 * Execute an intent on-chain
 * @param intent The intent to execute
 * @param privateKey Optional private key (defaults to Anvil account[0])
 * @returns Execution result with transaction details
 */
export async function executeIntentOnChain(
  intent: Intent,
  privateKey: Hex = ANVIL_DEFAULT_PRIVATE_KEY
): Promise<ExecutionResult> {
  try {
    // 1. Convert intent to contract format
    const contractIntent = intentToContractFormat(intent);

    // 2. Sign the intent
    const signature = await signIntent(intent, privateKey);

    // 3. Get wallet client
    const walletClient = getWalletClient();

    // 4. Get contract configuration
    const omaAccountConfig = getContractConfig('OMAAccount');

    // 5. Simulate the transaction first to catch reverts
    try {
      await publicClient.simulateContract({
        address: omaAccountConfig.address,
        abi: omaAccountConfig.abi,
        functionName: 'executeIntent',
        args: [contractIntent, signature],
        account: walletClient.account,
      });
    } catch (simulateError: any) {
      // Extract revert reason if available
      const revertReason = simulateError.shortMessage || simulateError.message || 'Transaction would revert';

      return {
        success: false,
        error: 'Transaction simulation failed',
        revertReason,
      };
    }

    // 6. Execute the transaction
    const txHash = await walletClient.writeContract({
      address: omaAccountConfig.address,
      abi: omaAccountConfig.abi,
      functionName: 'executeIntent',
      args: [contractIntent, signature],
    });

    // 7. Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // 8. Check if transaction was successful
    if (receipt.status === 'reverted') {
      return {
        success: false,
        txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        error: 'Transaction reverted',
      };
    }

    // 9. Extract amount out from logs (from IntentExecuted event)
    let amountOut: string | undefined;

    // Find IntentExecuted event in logs
    const intentExecutedLog = receipt.logs.find((log) => {
      try {
        // Try to decode as IntentExecuted event
        const decoded = decodeEventLog({
          abi: omaAccountConfig.abi,
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === 'IntentExecuted';
      } catch {
        return false;
      }
    });

    if (intentExecutedLog) {
      const decoded = decodeEventLog({
        abi: omaAccountConfig.abi,
        data: intentExecutedLog.data,
        topics: intentExecutedLog.topics,
      });

      if (decoded.eventName === 'IntentExecuted') {
        amountOut = (decoded.args as any).amountOut?.toString();
      }
    }

    return {
      success: true,
      txHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      amountOut,
    };
  } catch (error: any) {
    console.error('Intent execution error:', error);

    return {
      success: false,
      error: error.message || 'Execution failed',
      revertReason: error.shortMessage,
    };
  }
}

/**
 * Get transaction receipt for a given hash
 */
export async function getTransactionReceipt(txHash: Hex) {
  return publicClient.getTransactionReceipt({ hash: txHash });
}

/**
 * Get current block number
 */
export async function getCurrentBlockNumber(): Promise<bigint> {
  return publicClient.getBlockNumber();
}
