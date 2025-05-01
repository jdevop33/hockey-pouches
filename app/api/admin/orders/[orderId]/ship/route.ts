import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { sendShippingConfirmationEmail } from '../../../../../lib/email';
import { getRowCount, getFirstRow } from '@/lib/db-types';

export const dynamic = 'force-dynamic';

interface ShipBody {
  trackingNumber?: string | null;
  trackingUrl?: string | null;
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
    

    // Tracking number might already be on the order from fulfillment step,
    // but allow overriding/adding it here via optional body.
    const body: ShipBody = await request.json().catch(() => ({}));
    const trackingNumber = body.trackingNumber || null; // Use body tracking if provided

    // Fetch order to check status and potentially get existing tracking
    const orderCheck =
      await sql`SELECT status, user_id, tracking_number FROM orders WHERE id = ${orderId}`;
    if (getRowCount(orderCheck) === 0)
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });

    const orderCheckData = getFirstRow(orderCheck);
    const currentStatus = orderCheckData.status;
    const customerUserId = orderCheckData.user_id;
    const existingTracking = orderCheckData.tracking_number;
    const finalTrackingNumber = trackingNumber || existingTracking; // Prioritize tracking from request body

    if (!['Awaiting Shipment'].includes(currentStatus)) {
      return NextResponse.json(
        { message: `Order cannot be marked as shipped. Current status: ${currentStatus}` },
        { status: 400 }
      );
    }

    const newStatus = 'Shipped';
    

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

    // Calculate referral commissions for this order
    try {
      

      // Call the commission calculation endpoint
      const commissionResponse = await fetch(
        `${request.nextUrl.origin}/api/orders/${orderId}/calculate-commission`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers.get('Authorization') || '',
          },
        }
      );

      if (commissionResponse.ok) {
        const commissionResult = await commissionResponse.json();
        
      } else {
        console.error(
          `Failed to calculate commissions for order ${orderId}:`,
          await commissionResponse.text()
        );
      }
    } catch (commissionError) {
      console.error(`Error calculating commissions for order ${orderId}:`, commissionError);
      // Don't throw here to avoid preventing the status update
    }

    // Trigger Notifications: Send shipping confirmation email to customer
    

    try {
      // Get customer details
      const customer = await sql`
        SELECT email, "firstName", "lastName"
        FROM users
        WHERE id = ${customerUserId}
        LIMIT 1
      `;

      if (getRowCount(customer) > 0) {
        const customerData = getFirstRow(customer);
        await sendShippingConfirmationEmail({
          customerEmail: customerData.email,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          orderId: orderIdString,
          trackingNumber: finalTrackingNumber || undefined,
          trackingUrl: body.trackingUrl || undefined,
        });
        
      }
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error(`Failed to send shipping email for order ${orderId}:`, emailError);
    }

    // Calculate & Record Commissions
    

    // Get order details including referral code
    const orderDetails = await sql`
      SELECT o.*, u.referrer_id
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `;

    if (getRowCount(orderDetails) > 0) {
      const order = getFirstRow(orderDetails);
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

          if (getRowCount(referrerResult) > 0) {
            referrerUserId = getFirstRow(referrerResult).id;
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

          } for user ${referrerUserId} from order ${orderId}`
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
  } catch (error: unknown) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    console.error(`Admin: Failed to mark order ${orderId} as shipped:`, error);
    return NextResponse.json(
      { message: (error as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
