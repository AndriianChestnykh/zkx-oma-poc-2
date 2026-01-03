/**
 * API route for fetching next available nonce
 * GET /api/intents/nonce?address=0x...
 */
import { NextRequest, NextResponse } from 'next/server';
import { getNextNonce } from '@/lib/db/intents';
import { isValidEthereumAddress } from '@/lib/security/validation';

/**
 * GET /api/intents/nonce
 * Returns the next available nonce for a user address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: 'Address parameter is required',
        },
        { status: 400 }
      );
    }

    if (!isValidEthereumAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Ethereum address format',
        },
        { status: 400 }
      );
    }

    // Fetch next nonce from database
    const nonce = await getNextNonce(address);

    return NextResponse.json({
      success: true,
      nonce,
    });
  } catch (error: any) {
    console.error('GET /api/intents/nonce error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nonce',
        message: error.message,
      },
      { status: 500 }
    );
  }
}