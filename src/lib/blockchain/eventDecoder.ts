/**
 * Event decoder utilities
 * Decodes blockchain events from transaction receipts
 */
import { Hex, TransactionReceipt, decodeEventLog } from 'viem';
import { publicClient } from './client';
import { getContractConfig } from './contracts';

export interface DecodedEvent {
  eventName: string;
  args: Record<string, any>;
  address: Hex;
  blockNumber: bigint;
  transactionHash: Hex;
  logIndex: number;
}

/**
 * Decode all events from a transaction receipt
 * @param receipt The transaction receipt
 * @returns Array of decoded events
 */
export async function decodeTransactionEvents(
  receipt: TransactionReceipt
): Promise<DecodedEvent[]> {
  const decodedEvents: DecodedEvent[] = [];

  // Get contract ABIs
  const omaAccountConfig = getContractConfig('OMAAccount');
  const policyModuleConfig = getContractConfig('PolicyModule');
  const venueAdapterConfig = getContractConfig('VenueAdapterMock');

  for (const log of receipt.logs) {
    try {
      // Try to decode with each contract's ABI
      for (const config of [omaAccountConfig, policyModuleConfig, venueAdapterConfig]) {
        try {
          const decoded = decodeEventLog({
            abi: config.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName) {
            decodedEvents.push({
              eventName: decoded.eventName,
              args: (decoded.args || {}) as Record<string, any>,
              address: log.address,
              blockNumber: log.blockNumber || receipt.blockNumber,
              transactionHash: log.transactionHash || receipt.transactionHash,
              logIndex: log.logIndex || 0,
            });

            break; // Successfully decoded, move to next log
          }
        } catch {
          // Try next ABI
          continue;
        }
      }
    } catch (error) {
      // Failed to decode with all ABIs, skip this log
      console.warn('Failed to decode log:', log);
    }
  }

  return decodedEvents;
}

/**
 * Get events for a specific transaction hash
 */
export async function getTransactionEvents(txHash: Hex): Promise<DecodedEvent[]> {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  return decodeTransactionEvents(receipt);
}

/**
 * Extract specific event data by name
 */
export function findEventByName(
  events: DecodedEvent[],
  eventName: string
): DecodedEvent | undefined {
  return events.find((event) => event.eventName === eventName);
}

/**
 * Extract all events of a specific name
 */
export function filterEventsByName(events: DecodedEvent[], eventName: string): DecodedEvent[] {
  return events.filter((event) => event.eventName === eventName);
}

/**
 * Format event data for display
 */
export function formatEventData(event: DecodedEvent): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [key, value] of Object.entries(event.args)) {
    if (typeof value === 'bigint') {
      formatted[key] = value.toString();
    } else if (typeof value === 'object' && value !== null) {
      formatted[key] = JSON.stringify(value);
    } else {
      formatted[key] = String(value);
    }
  }

  return formatted;
}
