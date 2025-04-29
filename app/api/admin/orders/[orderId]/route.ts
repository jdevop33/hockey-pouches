// app/api/admin/orders/[orderId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { orderService } from '@/lib/services/order-service'; // Use refactored service
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler (Get Detailed Order Info) ---
export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { orderId } = params;
        if (!orderId || orderId.length !== 36) {
            return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
        }
        logger.info(`Admin GET /api/admin/orders/${orderId} request`, { adminId: authResult.userId });

        const orderDetails = await db.query.orders.findFirst({
            where: eq(schema.orders.id, orderId),
            with: {
                user: { columns: { name: true, email: true } },
                distributor: { columns: { name: true } },
                items: {
                    with: {
                        productVariation: {
                            columns: { name: true, imageUrl: true, sku: true },
                            with: { product: { columns: { name: true } } }
                        }
                    }
                },
                statusHistory: {
                    orderBy: [desc(schema.orderStatusHistory.createdAt)]
                },
                fulfillments: {
                     orderBy: [desc(schema.orderFulfillments.createdAt)]
                }
            }
        });
        if (!orderDetails) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }
        return NextResponse.json(orderDetails);
    } catch (error: any) {
        logger.error(`Admin: Failed to get order ${params.orderId}:`, { error });
        return NextResponse.json({ message: 'Internal Server Error fetching order details.' }, { status: 500 });
    }
}

// --- PATCH Handler (Update Order - e.g., Status, Distributor) ---
const updateOrderSchema = z.object({
    status: z.enum(schema.orderStatusEnum.enumValues).optional(),
    distributorId: z.string().uuid("Invalid Distributor ID format").nullable().optional(),
}).strict();

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
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
        const validation = updateOrderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const updateData = validation.data;
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
        }
        logger.info(`Admin PATCH /api/admin/orders/${orderId} request`, { adminId: authResult.userId, updateData });

        let updatedOrder: schema.OrderSelect | null = null;
        if (updateData.status) {
            updatedOrder = await orderService.updateOrderStatus(orderId, updateData.status, `Status updated by admin ${authResult.userId}`, authResult.userId);
        }
        if (updateData.distributorId !== undefined) {
            if (updateData.distributorId === null) {
                 logger.warn('Unassigning distributor logic not implemented yet in OrderService', { orderId });
                 const result = await db.update(schema.orders).set({ distributorId: null, updatedAt: new Date() }).where(eq(schema.orders.id, orderId)).returning();
                 updatedOrder = result[0];
            } else {
                 updatedOrder = await orderService.assignDistributor(orderId, updateData.distributorId);
            }
        }
        if (!updatedOrder && Object.keys(updateData).length > 0) {
            logger.warn('Direct order update in API route - consider moving to service', { orderId, updateData });
             return NextResponse.json({ message: 'Update type not fully handled by service yet.' }, { status: 501 });
        }
        if (!updatedOrder) {
            return NextResponse.json({ message: 'Order not found or update failed.' }, { status: 404 });
        }
        logger.info('Admin: Order updated successfully', { orderId, adminId: authResult.userId });
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        logger.error(`Admin: Failed to update order ${params.orderId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
         if (error.message?.includes('not found') || error.message?.includes('Invalid status transition')) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error updating order.' }, { status: 500 });
    }
}

// DELETE commented out
