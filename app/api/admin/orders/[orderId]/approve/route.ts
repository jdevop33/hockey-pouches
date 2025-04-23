import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest, 
    { params }: { params: { orderId: string } } // Correct standard signature
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);

  if (isNaN(orderId)) {
      return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
  }

  // TODO: Add Admin Auth Check here!
  // const isAdmin = await checkAdminAuth(request); 
  // if (!isAdmin) { return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); }

  console.log(`POST /api/admin/orders/${orderId}/approve request`);

  try {
    // 1. Fetch the current order status
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;

    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    const currentStatus = orderCheck[0].status;

    // 2. Check if the order can be approved
    if (currentStatus !== 'Pending Approval') {
        return NextResponse.json({ message: `Order cannot be approved. Current status: ${currentStatus}` }, { status: 400 }); // Bad Request
    }

    // 3. Update the order status
    const newStatus = 'Awaiting Fulfillment';
    console.log(`Updating order ${orderId} status from ${currentStatus} to ${newStatus}...`);
    
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    // TODO: Add entry to order_history table

    // 4. TODO: Create Task: Generate a 'Distributor Assignment' task for admin/owner.
    console.log(`Placeholder: Create task 'Assign distributor for Order ${orderId}'`);
    // await createTask({ title: `Assign distributor for Order ${orderId}`, ... });

    return NextResponse.json({ message: `Order ${orderId} approved. Status updated to ${newStatus}.` });

  } catch (error: any) {
    console.error(`Admin: Failed to approve order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
