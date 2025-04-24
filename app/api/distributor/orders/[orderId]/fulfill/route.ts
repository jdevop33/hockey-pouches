import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyDistributor, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

interface FulfillBody {
  trackingNumber?: string | null;
  fulfillmentPhotoUrl?: string | null;
  notes?: string | null;
}

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId: orderIdString } = params;
  const orderId = parseInt(orderIdString);

  if (isNaN(orderId))
    return NextResponse.json({ message: 'Invalid Order ID format.' }, { status: 400 });

  try {
    // Verify distributor authentication
    const authResult = await verifyDistributor(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is a distributor
    if (authResult.role !== 'Distributor') {
      return forbiddenResponse('Only distributors can access this resource');
    }

    const distributorId = authResult.userId;
    console.log(
      `POST /api/distributor/orders/${orderId}/fulfill request by Distributor ${distributorId}`
    );

    // 2. Get request body
    const body: FulfillBody = await request.json();
    const { trackingNumber, fulfillmentPhotoUrl, notes } = body;
    if (!trackingNumber && !fulfillmentPhotoUrl) {
      return NextResponse.json(
        { message: 'Tracking number or fulfillment photo is required.' },
        { status: 400 }
      );
    }

    // 3. Fetch order, check status and assignment
    const orderCheck = await sql`
        SELECT status, assigned_distributor_id FROM orders WHERE id = ${orderId}
    `;
    if (orderCheck.length === 0)
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });

    const currentStatus = orderCheck[0].status;
    const assignedDistributor = orderCheck[0].assigned_distributor_id;

    if (assignedDistributor !== distributorId) {
      return NextResponse.json(
        { message: 'Order not assigned to this distributor.' },
        { status: 403 }
      );
    }
    if (currentStatus !== 'Awaiting Fulfillment') {
      return NextResponse.json(
        { message: `Order cannot be fulfilled. Current status: ${currentStatus}` },
        { status: 400 }
      );
    }

    // 4. Update Order Status and save fulfillment details
    const newStatus = 'Pending Fulfillment Verification' as OrderStatus;
    console.log(
      `Updating order ${orderId} status to ${newStatus} and saving fulfillment details...`
    );

    await sql`
        UPDATE orders
        SET status = ${newStatus},
            tracking_number = ${trackingNumber || null},
            fulfillment_photo_url = ${fulfillmentPhotoUrl || null},
            fulfillment_notes = ${notes || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId} AND assigned_distributor_id = ${distributorId}
    `;

    // Get distributor name for history
    const distributorInfo = await sql`SELECT name FROM users WHERE id = ${distributorId}`;
    const distributorName =
      distributorInfo.length > 0 ? distributorInfo[0].name : 'Unknown Distributor';

    // Add entry to order_history table
    await sql`
        INSERT INTO order_history (order_id, status, notes, user_id, user_role, user_name)
        VALUES (
            ${orderId},
            ${newStatus},
            ${`Order fulfilled by distributor. ${notes ? 'Notes: ' + notes : ''}`},
            ${distributorId},
            'Distributor',
            ${distributorName}
        )
    `;

    // Update distributor task
    await sql`
        UPDATE tasks
        SET status = 'Completed',
            updated_at = CURRENT_TIMESTAMP,
            notes = CONCAT(COALESCE(notes, ''), ' | Completed by distributor ${distributorId}')
        WHERE related_to = 'Order'
        AND related_id = ${orderId}
        AND title = 'Fulfill order'
        AND status = 'Pending'
    `;

    // Create verification task for admin
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
            'Verify fulfillment',
            'Verify fulfillment for order #${orderId} by distributor ${distributorName}',
            'Pending',
            'High',
            'Order',
            'Order',
            ${orderId}
        )
    `;

    return NextResponse.json({
      message: `Order ${orderId} marked as fulfilled. Awaiting verification.`,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    if (error.message?.includes('Server configuration error'))
      return NextResponse.json({ message: error.message }, { status: 500 });
    console.error(`Distributor: Failed to fulfill order ${orderId}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
