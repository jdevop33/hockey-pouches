import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

// TODO: Add JWT verification + Admin role check

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
    const body: ShipBody = await request.json().catch(() => ({})); 
    const trackingNumber = body.trackingNumber || null;

    const orderCheck = await sql`SELECT status, user_id FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    
    const currentStatus = orderCheck[0].status;
    const customerUserId = orderCheck[0].user_id;

    // Allow shipping from 'Awaiting Shipment' or potentially directly after verification
    if (!['Awaiting Shipment', 'Verified - Awaiting Shipment'].includes(currentStatus)) { 
        return NextResponse.json({ message: `Order cannot be marked as shipped. Current status: ${currentStatus}` }, { status: 400 });
    }

    const newStatus = 'Shipped';
    console.log(`Updating order ${orderId} status to ${newStatus} with tracking: ${trackingNumber || 'N/A'}`);
    
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, tracking_number = ${trackingNumber}, updated_at = CURRENT_TIMESTAMP 
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
