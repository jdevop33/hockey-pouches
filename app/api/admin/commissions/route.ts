// app/api/admin/commissions/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { commissionService, type ListCommissionsOptions } from '@/lib/services/commission-service'; // Use refactored service
import * as schema from '@/lib/schema'; // Use central schema index for enums
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // --- Authentication & Authorization ---
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        logger.info(`Admin GET /api/admin/commissions request`, { adminId: authResult.userId });

        // --- Parse Query Params ---
        const searchParams = request.nextUrl.searchParams;
        const options: ListCommissionsOptions = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            status: searchParams.get('status') as typeof schema.commissionStatusEnum.enumValues[number] | undefined,
            userId: searchParams.get('userId') ?? undefined,
            // Add other filters here (e.g., date ranges)
        };

        // Optional: Validate status enum
        if (options.status && !schema.commissionStatusEnum.enumValues.includes(options.status)) {
             return NextResponse.json({ message: `Invalid status filter: ${options.status}` }, { status: 400 });
        }

        // --- Call Service Method ---
        const result = await commissionService.listCommissions(options);

        return NextResponse.json(result);

    } catch (error: any) {
        logger.error('Admin: Failed to get commissions list:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching commissions.' }, { status: 500 });
    }
}

// TODO: Implement POST route for admin actions like approving/rejecting/paying commissions?
// Example: Approving a commission might call a commissionService.updateStatus method.
