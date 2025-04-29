// app/api/admin/orders/[orderId]/assign-distributor/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { orderService } from '@/lib/services/order-service'; // Use service
import { taskService } from '@/lib/services/task-service'; // Use service for tasks
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const assignDistributorSchema = z.object({
    distributorId: z.string().uuid("Invalid Distributor ID format"),
});

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { orderId } = params;
        if (!orderId || orderId.length !== 36) {
            return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
        }

        const body = await request.json();
        const validation = assignDistributorSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { distributorId } = validation.data;
        const adminUserId = authResult.userId;

        logger.info(`Admin POST /api/admin/orders/${orderId}/assign-distributor request`, { adminId: adminUserId, distributorId });

        // --- Call Service to Assign Distributor --- 
        // OrderService.assignDistributor handles checking order status, distributor validity, updating order, adding history
        const updatedOrder = await orderService.assignDistributor(orderId, distributorId);

        // --- Update/Create Tasks (Handle here for now, could move to service) ---
        try {
            // 1. Close the "Assign distributor" task for this order
            const assignmentTaskUpdate = await db.update(schema.tasks).set({
                status: 'Completed',
                updatedAt: new Date(),
                notes: sql`COALESCE(${schema.tasks.notes}, '') || ' | Assigned by admin ${adminUserId} on ' || NOW()`
            }).where(and(
                eq(schema.tasks.relatedTo, 'Order'),
                eq(schema.tasks.relatedId, orderId),
                eq(schema.tasks.title, 'Assign distributor'), // Match specific title
                eq(schema.tasks.status, 'Pending')
            ));
             logger.info('Closed assign distributor task(s)', { orderId, count: assignmentTaskUpdate.rowCount });

            // 2. Create "Fulfill order" task for the assigned distributor
            await db.insert(schema.tasks).values({
                // id handled by default
                title: 'Fulfill order',
                description: `Fulfill order #${orderId}`,
                status: 'Pending',
                priority: 'High',
                category: 'Fulfillment', // Or 'Order'?
                relatedTo: 'Order',
                relatedId: orderId,
                assignedTo: distributorId,
            });
             logger.info('Created fulfill order task for distributor', { orderId, distributorId });

        } catch(taskError) {
            logger.error('Error updating/creating tasks after assigning distributor (order update succeeded)', { orderId, distributorId, error: taskError });
            // Don't fail the whole request if task update fails, but log it
        }

        // TODO: Send notification to distributor

        logger.info('Admin: Distributor assigned successfully', { orderId, distributorId, adminId: adminUserId });
        return NextResponse.json({
            message: `Distributor assigned to order ${orderId}.`,
            order: updatedOrder // Return updated order data
        });

    } catch (error: any) {
        logger.error(`Admin: Failed to assign distributor to order ${params.orderId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        // Handle specific errors from service (e.g., not found, invalid status, invalid distributor)
        if (error.message?.includes('not found') || error.message?.includes('Invalid status') || error.message?.includes('not a distributor')) {
            return NextResponse.json({ message: error.message }, { status: 400 }); // Or 404
        }
        return NextResponse.json({ message: 'Internal Server Error assigning distributor.' }, { status: 500 });
    }
}
