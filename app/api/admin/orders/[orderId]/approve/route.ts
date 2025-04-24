import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);

  if (isNaN(orderId))
    return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });

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
    console.log(`POST /api/admin/orders/${orderId}/approve request by admin: ${adminUserId}`);

    // Use sql tag directly
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;

    if (orderCheck.length === 0) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const currentStatus = orderCheck[0].status;

    if (currentStatus !== 'Pending Approval') {
      return NextResponse.json(
        { message: `Order cannot be approved. Current status: ${currentStatus}` },
        { status: 400 }
      );
    }

    const newStatus = 'Awaiting Fulfillment' as OrderStatus;
    console.log(`Updating order ${orderId} status from ${currentStatus} to ${newStatus}...`);

    // Use sql tag directly
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
            'Order approved by admin',
            ${adminUserId},
            'Admin',
            (SELECT name FROM users WHERE id = ${adminUserId})
        )
    `;

    // Create task for distributor assignment
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
            'Assign distributor',
            'Assign a distributor to fulfill order #${orderId}',
            'Pending',
            'High',
            'Order',
            'Order',
            ${orderId}
        )
    `;

    return NextResponse.json({
      message: `Order ${orderId} approved. Status updated to ${newStatus}.`,
    });
  } catch (error: any) {
    console.error(`Admin: Failed to approve order ${orderId}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
