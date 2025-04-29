// app/api/admin/orders/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { orderService } from '@/lib/services/order-service'; // Use refactored service
import { logger } from '@/lib/logger';
import * as schema from '@/lib/schema'; // Use central schema index

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        logger.info(`Admin GET /api/admin/orders request`, { adminId: authResult.userId });

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const status = searchParams.get('status') as schema.OrderStatus | null;
        const type = searchParams.get('type') as schema.OrderType | null;
        const fromDateStr = searchParams.get('fromDate');
        const toDateStr = searchParams.get('toDate');
        const search = searchParams.get('search');

        const fromDate = fromDateStr ? new Date(fromDateStr) : undefined;
        const toDate = toDateStr ? new Date(toDateStr) : undefined;
        if ((fromDate && isNaN(fromDate.getTime())) || (toDate && isNaN(toDate.getTime()))) {
            return NextResponse.json({ message: 'Invalid date format for fromDate or toDate.' }, { status: 400 });
        }
        // TODO: Validate status/type against enums

        const result = await orderService.getAdminOrders({
            page, limit, status: status ?? undefined, type: type ?? undefined,
            fromDate, toDate, search: search ?? undefined,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('Admin: Failed to get orders list:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching orders.' }, { status: 500 });
    }
}

// POST commented out
