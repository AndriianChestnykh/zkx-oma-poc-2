/**
 * API Route for audit trail
 * GET /api/audit/:intentId - Get complete audit trail for an intent
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuditTrail } from '@/lib/db/audit';
import { DatabaseError } from '@/lib/utils/errors';

/**
 * GET /api/audit/:intentId
 * Get complete chronological audit trail for an intent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  const { intentId } = await params;

  try {
    // Fetch complete audit trail
    const auditTrail = await getAuditTrail(intentId);

    return NextResponse.json({
      success: true,
      data: auditTrail,
      count: auditTrail.length,
    });
  } catch (error: any) {
    console.error(`GET /api/audit/${intentId} error:`, error);

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
        error: 'Failed to fetch audit trail',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
