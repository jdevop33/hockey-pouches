// app/api/admin/orders/[orderId]/approve/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { orderService } from '@/lib/services/order-service'; // Use service
import { logger } from '@/lib/logger';
import { orders } from '@/lib/schema/orders';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use schema for enum
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { orderId } = params;
        if (!orderId || orderId.length !== 36) { // UUID validation
            return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
        }
        const adminUserId = authResult.userId;
        logger.info(`Admin POST /api/admin/orders/${orderId}/approve request`, { adminId: adminUserId });
        // --- Core Logic (Simplified by using OrderService) ---
        // Determine the target status after approval
        // Use the actual enum values type for annotation
        const approvedStatus: typeof schema.orderStatusEnum.enumValues[number] = 'ReadyForFulfillment'; // Or 'Processing'?
        // Call the service method to update the status.
        const updatedOrder = await orderService.updateOrderStatus(
            orderId,
            approvedStatus,
            `Order approved by admin (${adminUserId})`,
            adminUserId
        );
        // TODO: Ensure task creation for distributor assignment happens.
        logger.info('Admin: Order approved successfully', { orderId, newStatus: approvedStatus, adminId: adminUserId });
        return NextResponse.json({
            message: `Order ${orderId} approved. Status updated to ${approvedStatus}.`,
            order: updatedOrder, // Return updated order data
        });
    } catch (error: any) {
        logger.error(`Admin: Failed to approve order ${params.orderId}:`, { error });
        // Handle specific errors from service (e.g., not found, invalid transition)
        if (error.message?.includes('not found') || error.message?.includes('Invalid status transition')) {
            return NextResponse.json({ message: error.message }, { status: 400 }); // Or 404
        }
        return NextResponse.json({ message: 'Internal Server Error approving order.' }, { status: 500 });
    }
}
