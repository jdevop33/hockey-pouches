import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

// Force dynamic rendering
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

  // TODO: Add Admin Auth Check here!
  // const isAdmin = await checkAdminAuth(request);
  // if (!isAdmin) { return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); }
  // const adminUserId = ... // For history logging

  console.log(`POST /api/admin/orders/${orderId}/verify-fulfillment request`);

  try {
    // 1. Fetch the current order status
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;

    // 2. Check if the order can be verified
    if (currentStatus !== 'Pending Fulfillment Verification') {
        return NextResponse.json({ message: `Order cannot be verified. Current status: ${currentStatus}` }, { status: 400 });
    }

    // 3. Update the order status
    // Consider if this should go directly to 'Shipped' or an intermediate step like 'Awaiting Shipment'
    const newStatus = 'Awaiting Shipment'; 
    console.log(`Updating order ${orderId} status from ${currentStatus} to ${newStatus}...`);
    
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    // TODO: Add entry to order_history table (e.g., "Fulfillment verified by Admin Y")

    // 4. TODO: Update/Close the 'Fulfillment Verification' task associated with this order.
    console.log(`Placeholder: Update/Close task for verifying order ${orderId}`);
    
    // 5. TODO: Create Task: Generate a 'Shipping Confirmation' task or handle next step.
    console.log(`Placeholder: Create task 'Confirm Shipment for Order ${orderId}'`);

    return NextResponse.json({ message: `Fulfillment for order ${orderId} verified. Status updated to ${newStatus}.` });

  } catch (error: any) {
    console.error(`Admin: Failed to verify fulfillment for order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
