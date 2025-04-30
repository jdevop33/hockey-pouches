import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { blacklistToken } from '@/lib/blacklist';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // For stateless JWTs, logout is primarily handled client-side by deleting the token.
  // This endpoint exists mainly to potentially:
  // 1. Invalidate a refresh token if you implement a refresh token strategy.
  // 2. Add the JWT to a blacklist if you implement server-side revocation (more complex).
  // 3. Log the logout event for security auditing.

  try {
    // Verify the user's authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse();
    }

    const userId = authResult.userId;

    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 400 });
    }

    // Add the token to the blacklist
    await blacklistToken(token);

    logger.info('User logged out', { userId });

    // Return success response
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Error during logout', {}, error);
    return NextResponse.json({ message: 'An error occurred during logout' }, { status: 500 });
  }
}
