import { NextResponse } from 'next/server';
import { getIntentStats } from '@/lib/db/intents';
import { DatabaseError } from '@/lib/utils/errors';

/**
 * GET /api/stats
 * Fetch intent statistics
 */
export async function GET() {
  try {
    const stats = await getIntentStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching intent stats:', error);

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
