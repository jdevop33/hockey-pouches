// app/api/users/me/referrals/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { userService } from '@/lib/services/user-service'; // Use refactored service
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // --- Authentication ---
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;

        // --- Parse Query Params ---
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        logger.info(`GET /api/users/me/referrals request`, { userId, page, limit });

        // --- Call Service Method ---
        const result = await userService.getReferrals(userId, { page, limit });

        return NextResponse.json(result);

    } catch (error) {
        logger.error('Failed to get user referrals:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching referrals.' }, { status: 500 });
    }
}
