// app/api/users/me/commissions/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { commissionService } from '@/lib/services/commission-service'; // Use refactored service
import * as schema from '@/lib/schema'; // Use schema for enum validation
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
        const status = searchParams.get('status') as schema.CommissionStatus | undefined;

        logger.info(`GET /api/users/me/commissions request`, { userId, page, limit, status });

        // Optional: Validate status enum
        if (status && !schema.commissionStatusEnum.enumValues.includes(status)) {
             return NextResponse.json({ message: `Invalid status filter: ${status}` }, { status: 400 });
        }

        // --- Call Service Method ---
        // Use the specific service method for getting the current user's commissions
        const result = await commissionService.getUserCommissions(userId, {
            page,
            limit,
            status: status ?? undefined,
        });

        // The service returns commissions with user info, which is fine here too.
        return NextResponse.json(result);

    } catch (error) {
        logger.error('Failed to get user commissions:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching commissions.' }, { status: 500 });
    }
}
