/**
 * API Route for intent validation
 * POST /api/intents/:id/validate - Validate intent against policies
 */
import { NextRequest, NextResponse } from 'next/server';
import { getIntentById, updateIntentStatus } from '@/lib/db/intents';
import { validateIntent } from '@/lib/policy/engine';
import { NotFoundError, DatabaseError } from '@/lib/utils/errors';

/**
 * POST /api/intents/:id/validate
 * Validate an intent against all active policies
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch the intent
    const intent = await getIntentById(id);

    // Check if intent is in a valid state for validation
    if (intent.status !== 'created') {
      return NextResponse.json(
        {
          success: false,
          error: `Intent cannot be validated in status: ${intent.status}`,
          message: 'Intent must be in "created" status to be validated',
        },
        { status: 400 }
      );
    }

    // Validate intent against all policies
    const validationResult = await validateIntent(intent, true);

    // Update intent status based on validation result
    const newStatus = validationResult.passed ? 'validated' : 'rejected';
    await updateIntentStatus(id, newStatus);

    return NextResponse.json({
      success: true,
      data: {
        ...validationResult,
        newStatus,
      },
      message: validationResult.passed
        ? 'Intent validated successfully'
        : 'Intent validation failed',
    });
  } catch (error: any) {
    console.error(`POST /api/intents/${id}/validate error:`, error);

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
        error: 'Failed to validate intent',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
