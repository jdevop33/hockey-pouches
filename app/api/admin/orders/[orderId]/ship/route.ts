import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ShipBody {
    trackingNumber?: string | null;
    // Add other relevant info if needed (e.g., shipping carrier)
}

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
  // const adminUserId = ...

  console.log(`POST /api/admin/orders/${orderId}/ship request`);

  try {
    const body: ShipBody = await request.json().catch(() => ({})); // Allow empty body
    const trackingNumber = body.trackingNumber || null;

    // 1. Fetch the current order status
    const orderCheck = await sql`SELECT status, user_id FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;
    const customerUserId = orderCheck[0].user_id;

    // 2. Check if the order can be marked as shipped
    // Adjust expected status if needed (e.g., if verification step is skipped)
    if (currentStatus !== 'Awaiting Shipment') { 
        return NextResponse.json({ message: `Order cannot be marked as shipped. Current status: ${currentStatus}` }, { status: 400 });
    }

    // 3. Update the order status and tracking number
    const newStatus = 'Shipped';
    console.log(`Updating order ${orderId} status to ${newStatus} with tracking: ${trackingNumber || 'N/A'}`);
    
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, 
            tracking_number = ${trackingNumber},
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    // TODO: Add entry to order_history table (e.g., "Order shipped by Admin Y with tracking Z")

    // 4. TODO: Update/Close the 'Shipping' task if one exists.
    console.log(`Placeholder: Update/Close task for shipping order ${orderId}`);

    // 5. TODO: Trigger Notifications: Send shipping confirmation email to customer.
    console.log(`Placeholder: Send shipping email to customer ${customerUserId} for order ${orderId}`);
    // await sendShippingConfirmationEmail(customerEmail, orderId, trackingNumber);
    
    // 6. TODO: Calculate & Record Commissions (This is a crucial step!)
    console.log(`Placeholder: Trigger commission calculation for order ${orderId}`);
    // await calculateAndRecordCommissions(orderId);

    return NextResponse.json({ message: `Order ${orderId} marked as shipped.` });

  } catch (error: any) {
    if (error instanceof SyntaxError) {
         return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to mark order ${orderId} as shipped:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
