import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
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
    console.log(
      `POST /api/admin/orders/${orderId}/verify-fulfillment request by admin: ${adminUserId}`
    );

    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;

    if (currentStatus !== 'Pending Fulfillment Verification') {
      return NextResponse.json(
        { message: `Order cannot be verified. Current status: ${currentStatus}` },
        { status: 400 }
      );
    }

    const newStatus = 'Awaiting Shipment' as OrderStatus;
    console.log(`Updating order ${orderId} status from ${currentStatus} to ${newStatus}...`);

    await sql`
        UPDATE orders
        SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId}
    `;

    // Add history entry
    await sql`
        INSERT INTO order_history (order_id, status, notes, user_id, user_role, user_name)
        VALUES (
            ${orderId},
            ${newStatus},
            'Fulfillment verified by admin',
            ${adminUserId},
            'Admin',
            (SELECT name FROM users WHERE id = ${adminUserId})
        )
    `;

    // Update/Close the 'Fulfillment Verification' task
    await sql`
        UPDATE tasks
        SET status = 'Completed',
            updated_at = CURRENT_TIMESTAMP,
            notes = CONCAT(COALESCE(notes, ''), ' | Completed by admin ${adminUserId}')
        WHERE related_to = 'Order'
        AND related_id = ${orderId}
        AND title LIKE '%Verify fulfillment%'
        AND status = 'Pending'
    `;

    // Create shipping task
    await sql`
        INSERT INTO tasks (
            title,
            description,
            status,
            priority,
            category,
            related_to,
            related_id
        ) VALUES (
            'Ship order',
            'Prepare order #${orderId} for shipping',
            'Pending',
            'High',
            'Order',
            'Order',
            ${orderId}
        )
    `;

    return NextResponse.json({
      message: `Fulfillment for order ${orderId} verified. Status updated to ${newStatus}.`,
    });
  } catch (error: any) {
    console.error(`Admin: Failed to verify fulfillment for order ${orderId}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
