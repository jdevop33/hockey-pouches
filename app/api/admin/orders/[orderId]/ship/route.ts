import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ShipBody {
  trackingNumber?: string | null;
}

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
    console.log(`POST /api/admin/orders/${orderId}/ship request by admin: ${adminUserId}`);

    // Tracking number might already be on the order from fulfillment step,
    // but allow overriding/adding it here via optional body.
    const body: ShipBody = await request.json().catch(() => ({}));
    const trackingNumber = body.trackingNumber || null; // Use body tracking if provided

    // Fetch order to check status and potentially get existing tracking
    const orderCheck =
      await sql`SELECT status, user_id, tracking_number FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0)
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });

    const currentStatus = orderCheck[0].status;
    const customerUserId = orderCheck[0].user_id;
    const existingTracking = orderCheck[0].tracking_number;
    const finalTrackingNumber = trackingNumber || existingTracking; // Prioritize tracking from request body

    if (!['Awaiting Shipment'].includes(currentStatus)) {
      return NextResponse.json(
        { message: `Order cannot be marked as shipped. Current status: ${currentStatus}` },
        { status: 400 }
      );
    }

    const newStatus = 'Shipped';
    console.log(
      `Updating order ${orderId} status to ${newStatus} with tracking: ${finalTrackingNumber || 'N/A'}`
    );

    await sql`
        UPDATE orders
        SET status = ${newStatus},
            tracking_number = ${finalTrackingNumber},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId}
    `;

    // Add entry to order_history table
    await sql`
      INSERT INTO order_history (order_id, status, notes, user_id, user_role, user_name)
      VALUES (
        ${orderId},
        ${newStatus},
        ${`Order shipped with tracking number: ${finalTrackingNumber || 'N/A'}`},
        ${adminUserId},
        'Admin',
        (SELECT name FROM users WHERE id = ${adminUserId})
      )
    `;

    // Update/Close the 'Ship order' task
    await sql`
      UPDATE tasks
      SET status = 'Completed',
          updated_at = CURRENT_TIMESTAMP,
          notes = CONCAT(COALESCE(notes, ''), ' | Completed by admin ${adminUserId}')
      WHERE related_to = 'Order'
        AND related_id = ${orderId}
        AND title = 'Ship order'
        AND status = 'Pending'
    `;

    // Trigger Notifications: Send shipping confirmation email to customer
    console.log(`Sending shipping email to customer ${customerUserId} for order ${orderId}`);
    // In a real implementation, this would call an email service

    // Calculate & Record Commissions
    console.log(`Calculating commissions for order ${orderId}`);

    // Get order details including referral code
    const orderDetails = await sql`
      SELECT o.*, u.referrer_id
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `;

    if (orderDetails.length > 0) {
      const order = orderDetails[0];
      const referralCode = order.referral_code;
      const referrerId = order.referrer_id;
      const orderTotal = parseFloat(order.total_amount);

      // Calculate commission amount (5% of order total)
      const commissionRate = 0.05;
      const commissionAmount = orderTotal * commissionRate;

      // If order has a referral code or user has a referrer, create commission
      if (referralCode || referrerId) {
        // Determine the referrer user ID
        let referrerUserId = referrerId;

        // If referral code was used, find the user with that code
        if (referralCode && !referrerId) {
          const referrerResult = await sql`
            SELECT id FROM users WHERE referral_code = ${referralCode}
          `;

          if (referrerResult.length > 0) {
            referrerUserId = referrerResult[0].id;
          }
        }

        if (referrerUserId) {
          // Create commission record
          await sql`
            INSERT INTO commissions (
              user_id, order_id, amount, status, created_at, updated_at
            )
            VALUES (
              ${referrerUserId},
              ${orderId},
              ${commissionAmount},
              ${'Pending'},
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            )
          `;

          console.log(
            `Created commission of $${commissionAmount.toFixed(2)} for user ${referrerUserId} from order ${orderId}`
          );

          // Create task for admin to review commission
          await sql`
            INSERT INTO tasks (
              title,
              description,
              status,
              priority,
              category,
              related_to,
              related_id,
              assigned_to
            )
            VALUES (
              'Review Commission',
              ${`Review commission of $${commissionAmount.toFixed(2)} for order #${orderId}`},
              'Pending',
              'Medium',
              'Commission',
              'Order',
              ${orderId},
              (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)
            )
          `;
        }
      }
    }

    return NextResponse.json({ message: `Order ${orderId} marked as shipped.` });
  } catch (error: any) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    console.error(`Admin: Failed to mark order ${orderId} as shipped:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
