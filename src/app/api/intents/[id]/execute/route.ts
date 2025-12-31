/**
 * API Route for intent execution
 * POST /api/intents/:id/execute - Execute intent on-chain
 */
import { NextRequest, NextResponse } from 'next/server';
import { getIntentById, updateIntentStatus } from '@/lib/db/intents';
import { createExecution } from '@/lib/db/executions';
import { createAuditArtifact } from '@/lib/db/audit';
import { executeIntentOnChain } from '@/lib/blockchain/executor';
import { getTransactionEvents } from '@/lib/blockchain/eventDecoder';
import { NotFoundError, DatabaseError } from '@/lib/utils/errors';

/**
 * POST /api/intents/:id/execute
 * Execute an intent on the blockchain
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Fetch the intent
    const intent = await getIntentById(id);

    // 2. Check if intent is in a valid state for execution
    if (intent.status !== 'validated') {
      return NextResponse.json(
        {
          success: false,
          error: `Intent cannot be executed in status: ${intent.status}`,
          message: 'Intent must be in "validated" status to be executed',
        },
        { status: 400 }
      );
    }

    // 3. Update status to 'executing'
    await updateIntentStatus(id, 'executing');

    // 4. Create initial execution record
    const execution = await createExecution({
      intent_id: id,
      status: 'pending',
    });

    // 5. Execute intent on-chain
    console.log('Executing intent on-chain:', id);
    const executionResult = await executeIntentOnChain(intent);

    // 6. Create audit artifact for transaction submission
    if (executionResult.txHash) {
      await createAuditArtifact({
        intent_id: id,
        execution_id: execution.id,
        artifact_type: 'transaction_submitted',
        data: {
          txHash: executionResult.txHash,
          blockNumber: executionResult.blockNumber?.toString(),
          gasUsed: executionResult.gasUsed?.toString(),
        },
      });
    }

    // 7. Handle execution result
    if (executionResult.success && executionResult.txHash) {
      // Success case
      console.log('Execution successful, tx:', executionResult.txHash);

      // Decode events from transaction
      const events = await getTransactionEvents(executionResult.txHash);

      // Helper to convert BigInts to strings recursively
      const convertBigInts = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return obj.toString();
        if (Array.isArray(obj)) return obj.map(convertBigInts);
        if (typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, convertBigInts(value)])
          );
        }
        return obj;
      };

      // Create audit artifacts for each event
      for (const event of events) {
        await createAuditArtifact({
          intent_id: id,
          execution_id: execution.id,
          artifact_type: 'event_decoded',
          data: {
            eventName: event.eventName,
            args: convertBigInts(event.args),
            blockNumber: event.blockNumber.toString(),
            logIndex: event.logIndex,
          },
        });
      }

      // Update execution record
      await createExecution({
        intent_id: id,
        tx_hash: executionResult.txHash,
        block_number: Number(executionResult.blockNumber),
        gas_used: Number(executionResult.gasUsed),
        status: 'success',
        actual_amount_out: executionResult.amountOut,
      });

      // Update intent status to executed
      await updateIntentStatus(id, 'executed');

      return NextResponse.json({
        success: true,
        data: {
          executionResult,
          events,
          newStatus: 'executed',
        },
        message: 'Intent executed successfully on-chain',
      });
    } else {
      // Failure case
      console.error('Execution failed:', executionResult.error);

      // Create error audit artifact
      await createAuditArtifact({
        intent_id: id,
        execution_id: execution.id,
        artifact_type: 'error_logged',
        data: {
          error: executionResult.error || 'Execution failed',
          revertReason: executionResult.revertReason,
          txHash: executionResult.txHash,
        },
      });

      // Update execution record
      await createExecution({
        intent_id: id,
        tx_hash: executionResult.txHash,
        block_number: executionResult.blockNumber ? Number(executionResult.blockNumber) : undefined,
        gas_used: executionResult.gasUsed ? Number(executionResult.gasUsed) : undefined,
        status: executionResult.txHash ? 'reverted' : 'failed',
        revert_reason: executionResult.revertReason || executionResult.error,
      });

      // Update intent status to failed
      await updateIntentStatus(id, 'failed');

      return NextResponse.json(
        {
          success: false,
          error: executionResult.error || 'Execution failed',
          revertReason: executionResult.revertReason,
          data: {
            executionResult,
            newStatus: 'failed',
          },
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`POST /api/intents/${id}/execute error:`, error);

    // Handle not found errors
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Intent not found',
        },
        { status: 404 }
      );
    }

    // Handle database errors
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute intent',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
