// app/api/distributor/orders/[orderId]/fulfill/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { orderService, type FulfillmentData } from '@/lib/services/order-service'; // Use service
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { db } from '@/lib/db';
// Import specific schemas needed
import { orders, tasks, users, orderStatusEnum, taskCategoryEnum, taskStatusEnum } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Define Zod schema ONCE
const fulfillSchema = z.object({
    trackingNumber: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
    fulfillmentNotes: z.string().optional().nullable(),
    fulfillmentProofUrl: z.union([z.string().url(), z.array(z.string().url())]).optional().nullable(),
}).refine(data => !!data.trackingNumber || !!data.fulfillmentProofUrl, { // Correct refine usage
    message: "Either trackingNumber or fulfillmentProofUrl is required",
    path: ["trackingNumber", "fulfillmentProofUrl"],
});

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) return unauthorizedResponse(authResult.message);
        if (authResult.role !== 'Distributor') return forbiddenResponse('Only distributors can fulfill orders.');

        const distributorId = authResult.userId;
        const { orderId } = params;
        if (!orderId || orderId.length !== 36) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });

        const body = await request.json();
        const validation = fulfillSchema.safeParse(body);
        if (!validation.success) return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });

        // Use validated data to construct FulfillmentData
        const fulfillmentData: FulfillmentData = {
             trackingNumber: validation.data.trackingNumber ?? undefined,
             carrier: validation.data.carrier ?? undefined,
             fulfillmentNotes: validation.data.fulfillmentNotes ?? undefined,
             fulfillmentProofUrl: validation.data.fulfillmentProofUrl ? JSON.parse(JSON.stringify(validation.data.fulfillmentProofUrl)) : undefined,
        };
        logger.info(`Distributor POST /api/distributor/orders/${orderId}/fulfill request`, { distributorId, orderId });

        // --- Verify Order Assignment using direct schema reference ---
        const order = await db.query.orders.findFirst({
            where: and(eq(orders.id, orderId), eq(orders.distributorId, distributorId)),
            columns: { id: true, status: true }
        });
        if (!order) return NextResponse.json({ message: 'Order not found or not assigned to this distributor.' }, { status: 404 });

        // Use correct enum type from imported schema
        const fulfillableStatuses: (typeof orderStatusEnum.enumValues[number])[] = ['ReadyForFulfillment', 'Processing'];
        if (!fulfillableStatuses.includes(order.status)) {
            return NextResponse.json({ message: `Order cannot be fulfilled. Current status: ${order.status}` }, { status: 400 });
        }

        // --- Call Order Service ---
        const updatedOrder = await orderService.recordFulfillment(orderId, fulfillmentData, distributorId);

        // --- Task Management ---
        try {
            const fulfillmentTaskUpdate = await db.update(tasks).set({
                status: 'Completed',
                updatedAt: new Date(),
                // Use direct variable interpolation (Drizzle handles parameterization)
                notes: sql`COALESCE(${tasks.notes}, '') || ' | Completed by distributor ${distributorId} on ' || NOW()`
            }).where(and(
                eq(tasks.relatedTo, 'Order'),
                eq(tasks.relatedId, orderId),
                eq(tasks.assignedTo, distributorId),
                eq(tasks.title, 'Fulfill order'),
                eq(tasks.status, 'Pending')
            ));
            logger.info('Closed fulfill order task(s)', { orderId, count: fulfillmentTaskUpdate.rowCount });

            // Use direct schema reference for users query
            const distributor = await db.query.users.findFirst({ where: eq(users.id, distributorId), columns: { name: true } });
            const distributorName = distributor?.name ?? 'Unknown Distributor';
            await db.insert(tasks).values({
                title: 'Verify fulfillment',
                description: `Verify fulfillment for order #${orderId} by distributor ${distributorName}`,
                status: 'Pending',
                priority: 'High',
                // Use correct enum value from imported schema
                category: taskCategoryEnum.enumValues[0], // Assuming 'OrderReview' or similar based on enum definition
                relatedTo: 'Order', // Use correct enum value
                relatedId: orderId,
            });
            logger.info('Created verify fulfillment task for admin', { orderId });
        } catch (taskError) {
            logger.error('Error updating/creating tasks after fulfillment', { orderId, error: taskError });
        }

        logger.info('Distributor: Order fulfilled successfully', { orderId });
        return NextResponse.json({ message: `Order ${orderId} marked as fulfilled. Awaiting verification.`, order: updatedOrder });
    } catch (error: any) {
        logger.error(`Distributor: Failed to fulfill order ${params.orderId}:`, { error });
        if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        if (error.message?.includes('not found') || error.message?.includes('Cannot record fulfillment')) return NextResponse.json({ message: error.message }, { status: 400 });
        return NextResponse.json({ message: 'Internal Server Error fulfilling order.' }, { status: 500 });
    }
}
