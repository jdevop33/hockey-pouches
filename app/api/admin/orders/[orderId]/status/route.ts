import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

interface StatusUpdateBody { status?: OrderStatus; reason?: string; }

const ALLOWED_STATUSES: OrderStatus[] = [
    'Pending Approval', 'Awaiting Fulfillment', 'Pending Fulfillment Verification',
    'Awaiting Shipment', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'On Hold - Stock Issue'
];

export async function PUT(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);
  if (isNaN(orderId)) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });

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
    console.log(`PUT /api/admin/orders/${orderId}/status request by admin: ${adminUserId}`);

    const body: StatusUpdateBody = await request.json();
    const { status: newStatus, reason } = body;

    // Validation
    if (!newStatus || !reason || typeof newStatus !== 'string' || typeof reason !== 'string' || reason.trim().length === 0) {
       return NextResponse.json({ message: 'Missing or invalid status or reason for update.' }, { status: 400 });
    }
    if (!ALLOWED_STATUSES.includes(newStatus)) {
        return NextResponse.json({ message: `Invalid status value: ${newStatus}.` }, { status: 400 });
    }

    // Fetch current order (optional, but good for logging)
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    const currentStatus = orderCheck[0].status;
    console.log(`Attempting to manually update order ${orderId} from ${currentStatus} to ${newStatus}. Reason: ${reason}`);

    // Update Order Status
    await sql`
        UPDATE orders SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP WHERE id = ${orderId}
    `;

    // TODO: Log Action in order_history
    console.log(`Placeholder: Log manual status change for order ${orderId} to ${newStatus} by Admin ${adminUserId} with reason: ${reason}`);

    // --- CRITICAL: Handle Side Effects ---
    if (newStatus === 'Cancelled') {
        console.warn(`SIDE EFFECT TODO: Order ${orderId} Cancelled. Need to restock inventory and potentially void commissions.`);
        // await restockInventoryForOrder(orderId); // Need more info like items/location
        // await voidCommissionsForOrder(orderId);
    }
     if (newStatus === 'Refunded') {
         console.warn(`SIDE EFFECT TODO: Order ${orderId} Refunded. Need to process refund via payment gateway.`);
         // await processRefund(orderId);
     }

    return NextResponse.json({ message: `Order ${orderId} status manually updated to ${newStatus}.` });

  } catch (error: any) {
     if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
     console.error(`Admin: Failed to manually update status for order ${orderId}:`, error);
     return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
