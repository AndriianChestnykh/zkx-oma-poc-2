/**
 * API Routes for policies
 * GET /api/policies - List policies
 * POST /api/policies - Create policy
 */
import { NextRequest, NextResponse } from 'next/server';
import { listPolicies, createPolicy } from '@/lib/db/policies';
import { createPolicySchema, policyListQuerySchema } from '@/lib/security/validation';
import { DatabaseError } from '@/lib/utils/errors';

/**
 * GET /api/policies
 * List policies with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);

    // Validate query parameters
    const validatedParams = policyListQuerySchema.parse(searchParams);

    // Build filters for database query
    const filters = {
      enabled: validatedParams.enabled,
      policyType: validatedParams.policyType,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
    };

    // Fetch policies from database
    const policies = await listPolicies(filters);

    return NextResponse.json({
      success: true,
      data: policies,
      count: policies.length,
    });
  } catch (error: any) {
    console.error('GET /api/policies error:', error);

    // Handle validation errors
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
        error: 'Failed to fetch policies',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/policies
 * Create a new policy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createPolicySchema.parse(body);

    // Create policy in database
    const policy = await createPolicy(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: policy,
        message: 'Policy created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/policies error:', error);

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
        error: 'Failed to create policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
