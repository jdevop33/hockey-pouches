import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db'; // Default import sql

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest, 
    { params }: { params: { orderId: string } } 
) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);

  if (isNaN(orderId)) return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });
  
  // TODO: Add Admin Auth Check here!

  console.log(`POST /api/admin/orders/${orderId}/approve request`);

  try {
    // Use sql tag directly
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;

    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;

    if (currentStatus !== 'Pending Approval') {
        return NextResponse.json({ message: `Order cannot be approved. Current status: ${currentStatus}` }, { status: 400 });
    }

    const newStatus = 'Awaiting Fulfillment';
    console.log(`Updating order ${orderId} status from ${currentStatus} to ${newStatus}...`);
    
    // Use sql tag directly
    await sql`
        UPDATE orders 
        SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    console.log(`Placeholder: Create task 'Assign distributor for Order ${orderId}'`);

    return NextResponse.json({ message: `Order ${orderId} approved. Status updated to ${newStatus}.` });

  } catch (error: any) {
    console.error(`Admin: Failed to approve order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
