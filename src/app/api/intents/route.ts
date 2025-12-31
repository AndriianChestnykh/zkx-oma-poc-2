/**
 * API Routes for intents
 * GET /api/intents - List all intents with filters
 * POST /api/intents - Create a new intent
 */
import { NextRequest, NextResponse } from 'next/server';
import { createIntent, listIntents } from '@/lib/db/intents';
import { createIntentSchema, intentListQuerySchema } from '@/lib/security/validation';
import { ValidationError, DatabaseError } from '@/lib/utils/errors';

/**
 * GET /api/intents
 * List intents with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      status: searchParams.get('status') || undefined,
      userAddress: searchParams.get('userAddress') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const validatedParams = intentListQuerySchema.parse(queryParams);

    // Fetch intents from database
    const intents = await listIntents(validatedParams);

    return NextResponse.json({
      success: true,
      data: intents,
      count: intents.length,
    });
  } catch (error: any) {
    console.error('GET /api/intents error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch intents',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/intents
 * Create a new intent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createIntentSchema.parse(body);

    // Create intent in database
    const intent = await createIntent(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: intent,
        message: 'Intent created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/intents error:', error);

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

    // Handle database errors (including duplicate nonce)
    if (error instanceof DatabaseError) {
      const status = error.message.includes('Nonce already used') ? 409 : 500;
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create intent',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
