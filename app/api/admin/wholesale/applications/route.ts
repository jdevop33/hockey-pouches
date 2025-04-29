// app/api/admin/wholesale/applications/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { wholesaleService, type ListWholesaleAppsOptions } from '@/lib/services/wholesale-service'; // Use new service
import * as schema from '@/lib/schema'; // Use schema for enum
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// --- GET Handler (List Wholesale Applications) ---
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        logger.info(`Admin GET /api/admin/wholesale/applications request`, { adminId: authResult.userId });

        const searchParams = request.nextUrl.searchParams;
        const options: ListWholesaleAppsOptions = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            status: searchParams.get('status') as typeof schema.wholesaleApplicationStatusEnum.enumValues[number] | undefined,
            // Add search filter parsing here if needed
        };

        // Optional: Validate status enum
        if (options.status && !schema.wholesaleApplicationStatusEnum.enumValues.includes(options.status)) {
             return NextResponse.json({ message: `Invalid status filter: ${options.status}` }, { status: 400 });
        }

        const result = await wholesaleService.listApplications(options);
        return NextResponse.json(result);

    } catch (error: any) {
        logger.error('Admin: Failed to get wholesale applications list:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching wholesale applications.' }, { status: 500 });
    }
}

// POST is usually handled by the user-facing /api/wholesale/apply route.
// Admin actions (approve/reject) typically go to /api/admin/wholesale/applications/[applicationId]/approve|reject
