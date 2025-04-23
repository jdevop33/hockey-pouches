import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface StatusUpdateBody {
    status?: string;
    reason?: string;
}

// Define allowed statuses for validation (adjust as needed)
const ALLOWED_STATUSES = [
    'Pending Approval',
    'Awaiting Fulfillment',
    'Pending Fulfillment Verification',
    'Awaiting Shipment',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded',
    'On Hold - Stock Issue' // Example for handling issues
];

export async function PUT(
    request: NextRequest, 
    { params }: { params: { orderId: string } } 
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);

  if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
  }

  // TODO: Add Admin Auth Check here!
  // const adminUserId = ...

  console.log(`PUT /api/admin/orders/${orderId}/status request`);

  try {
    const body: StatusUpdateBody = await request.json();
    const { status: newStatus, reason } = body;

    // 1. Validate Input
    if (!newStatus || !reason || typeof newStatus !== 'string' || typeof reason !== 'string' || reason.trim().length === 0) {
       return NextResponse.json({ message: 'Missing or invalid status or reason for update.' }, { status: 400 });
    }
    if (!ALLOWED_STATUSES.includes(newStatus)) {
        return NextResponse.json({ message: `Invalid status value: ${newStatus}.` }, { status: 400 });
    }
    
    // 2. Fetch current order to check if update is valid (optional, but good practice)
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;
    console.log(`Attempting to update order ${orderId} from ${currentStatus} to ${newStatus}. Reason: ${reason}`);

    // 3. Update Order Status
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    // 4. TODO: Log Action: Record the manual change and reason in order history.
    console.log(`Placeholder: Log status change for order ${orderId} to ${newStatus} by Admin ${/*adminUserId*/'?'} with reason: ${reason}`);

    // 5. TODO: Handle Side Effects (CRITICAL!)
    if (newStatus === 'Cancelled') {
        console.warn(`SIDE EFFECT TODO: Order ${orderId} Cancelled. Need to restock inventory and potentially void commissions.`);
        // await restockInventoryForOrder(orderId);
        // await voidCommissionsForOrder(orderId);
    }
     if (newStatus === 'Refunded') {
         console.warn(`SIDE EFFECT TODO: Order ${orderId} Refunded. Need to process refund via payment gateway.`);
         // await processRefund(orderId);
         // Consider if commissions should also be voided for refunds.
     }
    // Add other side effect logic as needed

    return NextResponse.json({ message: `Order ${orderId} status manually updated to ${newStatus}.` });

  } catch (error: any) {
     if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to manually update status for order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
