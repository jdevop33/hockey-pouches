import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);

  if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is an admin
    if (authResult.role !== 'Admin') {
      return forbiddenResponse('Only administrators can access this resource');
    }

    const adminUserId = authResult.userId;
    console.log(`POST /api/admin/orders/${orderId}/verify-fulfillment request by admin: ${adminUserId}`);

    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;

    if (currentStatus !== 'Pending Fulfillment Verification') {
        return NextResponse.json({ message: `Order cannot be verified. Current status: ${currentStatus}` }, { status: 400 });
    }

    const newStatus = 'Awaiting Shipment' as OrderStatus;
    console.log(`Updating order ${orderId} status from ${currentStatus} to ${newStatus}...`);

    await sql`
        UPDATE orders
        SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId}
    `;

    // TODO: Add entry to order_history table (e.g., "Fulfillment verified by Admin Y")
    // TODO: Update/Close the 'Fulfillment Verification' task
    // TODO: Create Task: Generate a 'Shipping Confirmation' task

    return NextResponse.json({ message: `Fulfillment for order ${orderId} verified. Status updated to ${newStatus}.` });

  } catch (error: any) {
    console.error(`Admin: Failed to verify fulfillment for order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
