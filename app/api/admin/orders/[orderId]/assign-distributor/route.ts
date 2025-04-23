import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface AssignBody {
    distributorId?: string;
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
  // const isAdmin = await checkAdminAuth(request); 
  // if (!isAdmin) { return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); }
  // const adminUserId = ... // Get admin user ID if needed for history

  console.log(`POST /api/admin/orders/${orderId}/assign-distributor request`);

  try {
    const body: AssignBody = await request.json();
    const { distributorId } = body;

    // 1. Validate Input
    if (!distributorId || typeof distributorId !== 'string') {
      return NextResponse.json({ message: 'Missing or invalid distributor ID.' }, { status: 400 });
    }

    // 2. Fetch the order and verify its status
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) {
        return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;
    if (currentStatus !== 'Awaiting Fulfillment') {
        return NextResponse.json({ message: `Order cannot be assigned. Current status: ${currentStatus}` }, { status: 400 });
    }
    
    // 3. Validate the distributor ID exists and has the correct role
    console.log(`Validating distributor ID: ${distributorId}...`);
    const distributorCheck = await sql`
        SELECT id FROM users 
        WHERE id = ${distributorId} AND role = 'Distributor' AND status = 'Active'
    `;
    if (distributorCheck.length === 0) {
        console.error(`Distributor validation failed for ID: ${distributorId}`);
        return NextResponse.json({ message: 'Invalid or inactive distributor ID provided.' }, { status: 400 });
    }
    console.log(`Distributor ID ${distributorId} validated.`);

    // 4. Update the order with the assigned distributor ID
    console.log(`Assigning distributor ${distributorId} to order ${orderId}...`);
    await sql`
        UPDATE orders 
        SET assigned_distributor_id = ${distributorId}, 
            status = 'Awaiting Fulfillment', -- Keep status or update if needed?
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${orderId}
    `;
    
    // TODO: Add entry to order_history table (e.g., "Assigned to Distributor X by Admin Y")

    // 5. TODO: Update/Close the 'Distributor Assignment' task associated with this order.
    console.log(`Placeholder: Update/Close task for assigning order ${orderId}`);
    
    // 6. TODO: Optionally notify the distributor (e.g., create a task for *them*, send email/notification)
    console.log(`Placeholder: Notify distributor ${distributorId} about new assignment`);

    return NextResponse.json({ message: `Distributor ${distributorId} assigned to order ${orderId}.` });

  } catch (error: any) {
     if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to assign distributor to order ${orderId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
