import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check

export const dynamic = 'force-dynamic';

interface ShipBody { trackingNumber?: string | null; }

export async function POST(
    request: NextRequest, 
    { params }: { params: { orderId: string } } 
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);
  if (isNaN(orderId)) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });

  // TODO: Admin Auth Check
  // const adminUserId = ...

  console.log(`POST /api/admin/orders/${orderId}/ship request`);

  try {
    // Tracking number might already be on the order from fulfillment step, 
    // but allow overriding/adding it here via optional body.
    const body: ShipBody = await request.json().catch(() => ({})); 
    const trackingNumber = body.trackingNumber || null; // Use body tracking if provided

    // Fetch order to check status and potentially get existing tracking
    const orderCheck = await sql`SELECT status, user_id, tracking_number FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    
    const currentStatus = orderCheck[0].status;
    const customerUserId = orderCheck[0].user_id;
    const existingTracking = orderCheck[0].tracking_number;
    const finalTrackingNumber = trackingNumber || existingTracking; // Prioritize tracking from request body

    if (!['Awaiting Shipment'].includes(currentStatus)) { 
        return NextResponse.json({ message: `Order cannot be marked as shipped. Current status: ${currentStatus}` }, { status: 400 });
    }

    const newStatus = 'Shipped';
    console.log(`Updating order ${orderId} status to ${newStatus} with tracking: ${finalTrackingNumber || 'N/A'}`);
    
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, 
            tracking_number = ${finalTrackingNumber},
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    // TODO: Add entry to order_history table
    // TODO: Update/Close the 'Shipping' task
    // TODO: Trigger Notifications: Send shipping confirmation email to customer.
    console.log(`Placeholder: Send shipping email to customer ${customerUserId} for order ${orderId}`);
    // TODO: Calculate & Record Commissions (CRITICAL!)
    console.log(`Placeholder: Trigger commission calculation for order ${orderId}`);

    return NextResponse.json({ message: `Order ${orderId} marked as shipped.` });

  } catch (error: any) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    console.error(`Admin: Failed to mark order ${orderId} as shipped:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
