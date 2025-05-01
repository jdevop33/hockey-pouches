// app/api/admin/orders/[orderId]/verify-fulfillment/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { orderService } from '@/lib/services/order-service'; // Use service
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { db } from '@/lib/db';
// Using index import for schema
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const verifyFulfillmentSchema = z.object({
    action: z.enum(['approve', 'reject']),
    fulfillmentId: String(z.string().uuid("Valid Fulfillment ID is required")),
    notes: z.string().optional().nullable(),
}).refine(data => data.action === 'approve' || (data.action === 'reject' && data.notes && data.notes.trim() !== ''), {
    message: "Rejection reason (notes) is required when rejecting.",
    path: ["notes"],
});

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
    let body: unknown; // Declare body outside try for catch block access
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { orderId } = params;
        if (!orderId || orderId.length !== 36) {
            return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
        }

        body = await request.json(); // Assign inside try
        const validation = verifyFulfillmentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { action, fulfillmentId, notes } = validation.data;
        const adminUserId = authResult.userId;

        logger.info(`Admin POST /api/admin/orders/${orderId}/verify-fulfillment request`, { adminId: String(adminUserId), action, fulfillmentId, orderId });

        // Call the appropriate service method. Assume success if no error is thrown.
        if (action === 'approve') {
            await orderService.approveFulfillment(orderId, fulfillmentId, adminUserId, notes ?? undefined);
        } else { // action === 'reject'
            await orderService.rejectFulfillment(orderId, fulfillmentId, adminUserId, notes!); // Notes guaranteed by validation
        }

        // Removed the check for (!success) as errors are handled by catch block

        logger.info(`Admin: Fulfillment ${action} successful`, { orderId, fulfillmentId, adminId: adminUserId });
        return NextResponse.json({ message: `Fulfillment for order ${orderId} successfully ${action === 'approve' ? 'approved' : 'rejected'}.` });

    } catch (error: unknown) {
        // Use optional chaining for body?.action in case body parsing failed
        logger.error(`Admin: Failed to ${body?.action || 'process'} fulfillment for order ${params.orderId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        if (errorMessage || errorMessage || errorMessage) {
            return NextResponse.json({ message: errorMessage }, { status: 400 });
        }
        return NextResponse.json({ message: `Internal Server Error processing fulfillment.` }, { status: 500 });
    }
}
