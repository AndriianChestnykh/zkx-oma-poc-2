/**
 * API Routes for individual intent
 * GET /api/intents/:id - Get single intent
 * PATCH /api/intents/:id - Update intent status
 */
import { NextRequest, NextResponse } from 'next/server';
import { getIntentById, updateIntentStatus } from '@/lib/db/intents';
import { updateIntentSchema } from '@/lib/security/validation';
import { NotFoundError, DatabaseError } from '@/lib/utils/errors';

/**
 * GET /api/intents/:id
 * Get a single intent by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const intent = await getIntentById(id);

    return NextResponse.json({
      success: true,
      data: intent,
    });
  } catch (error: any) {
    console.error(`GET /api/intents/${id} error:`, error);

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Intent not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch intent',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/intents/:id
 * Update intent status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = updateIntentSchema.parse(body);

    // Update intent in database
    const intent = await updateIntentStatus(id, validatedData.status);

    return NextResponse.json({
      success: true,
      data: intent,
      message: 'Intent updated successfully',
    });
  } catch (error: any) {
    console.error(`PATCH /api/intents/${id} error:`, error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

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
        error: 'Failed to update intent',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
