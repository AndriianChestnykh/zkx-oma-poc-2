/**
 * API Routes for individual policy
 * GET /api/policies/:id - Get single policy
 * PATCH /api/policies/:id - Update policy
 * DELETE /api/policies/:id - Delete policy
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPolicyById, updatePolicy, deletePolicy } from '@/lib/db/policies';
import { updatePolicySchema } from '@/lib/security/validation';
import { NotFoundError, DatabaseError } from '@/lib/utils/errors';

/**
 * GET /api/policies/:id
 * Get a single policy by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const policy = await getPolicyById(id);

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error(`GET /api/policies/${id} error:`, error);

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Policy not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/policies/:id
 * Update a policy
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = updatePolicySchema.parse(body);

    // Update policy in database
    const policy = await updatePolicy(id, validatedData);

    return NextResponse.json({
      success: true,
      data: policy,
      message: 'Policy updated successfully',
    });
  } catch (error: any) {
    console.error(`PATCH /api/policies/${id} error:`, error);

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
          error: 'Policy not found',
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
        error: 'Failed to update policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/policies/:id
 * Delete a policy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deletePolicy(id);

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error: any) {
    console.error(`DELETE /api/policies/${id} error:`, error);

    // Handle not found errors
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Policy not found',
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
        error: 'Failed to delete policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
