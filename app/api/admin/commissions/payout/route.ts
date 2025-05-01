// app/api/admin/commissions/payout/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { commissionService } from '@/lib/services/commission-service'; // Use refactored service
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Zod schema for payout request
const payoutSchema = z.object({
    // Expect an array of numbers (SERIAL IDs from commissions table)
    commissionIds: z.array(z.number().int().positive()).min(1, "At least one commission ID is required"),
    payoutMethod: z.string().min(1, "Payout method is required"), // e.g., 'Manual E-Transfer', 'BTC', 'Wise'
    payoutReference: z.string().min(1, "Payout reference/batch ID is required"), // e.g., E-transfer confirmation, BTC Tx ID, Batch Name
});

export async function POST(request: NextRequest) {
    try {
        // --- Authentication & Authorization ---
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const adminUserId = authResult.userId;

        // --- Parse and Validate Body ---
        const body = await request.json();
        const validation = payoutSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { commissionIds, payoutMethod, payoutReference } = validation.data;

        logger.info(`Admin POST /api/admin/commissions/payout request`, { adminId: adminUserId, count: commissionIds.length, method: payoutMethod });

        // --- Call Service Method ---
        // The service handles finding approved commissions, updating status, etc.
        const payoutResult = await commissionService.processCommissionPayout(
            commissionIds,
            payoutMethod,
            payoutReference
            // Pass adminUserId if needed by service for logging/audit
        );

        // --- Handle Service Response ---
        if (!payoutResult.success) {
             // Service might have failed because no valid commissions were found, or DB error
            logger.warn('Commission payout processing failed in service', { adminId: adminUserId, result: payoutResult });
            return NextResponse.json({ message: payoutResult.message || 'Payout processing failed.' }, { status: 400 }); // Bad request if validation failed in service
        }

        logger.info('Admin: Commission payout processed successfully', { adminId: adminUserId, result: payoutResult });
        return NextResponse.json({
            message: payoutResult.message,
            details: {
                batchId: payoutResult.batchId,
                processedCount: payoutResult.processedCount,
                totalAmount: payoutResult.totalAmount,
            }
        });

    } catch (error: unknown) {
        logger.error('Admin: Failed to process commission payout request:', { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
         // Catch specific errors thrown by the service if needed
        return NextResponse.json({ message: 'Internal Server Error during payout processing.' }, { status: 500 });
    }
}
