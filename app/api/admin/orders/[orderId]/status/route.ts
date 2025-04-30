import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { inventory } from '@/lib/schema/inventory';
import { commissions } from '@/lib/schema/commissions';
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { inventory } from '@/lib/schema/inventory';
import { commissions } from '@/lib/schema/commissions';
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import { orderItems } from '@/lib/schema/orderItems';
import { inventory } from '@/lib/schema/inventory';
import { commissions } from '@/lib/schema/commissions';
import { tasks } from '@/lib/schema/tasks';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import the schema namespace

export const dynamic = 'force-dynamic';

// Use the generated enum type for status
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];

interface StatusUpdateBody {
  status?: OrderStatus;
  reason?: string;
}

// Use the enum values directly
const ALLOWED_STATUSES: OrderStatus[] = schema.orderStatusEnum.enumValues;

export async function PUT(request: NextRequest, { params }: { params: { orderId: string } }) {
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
    console.log(`PUT /api/admin/orders/${orderId}/status request by admin: ${adminUserId}`);

    const body: StatusUpdateBody = await request.json();
    const { status: newStatus, reason } = body;

    // Validation
    if (
      !newStatus ||
      !reason ||
      typeof newStatus !== 'string' ||
      typeof reason !== 'string' ||
      reason.trim().length === 0
    ) {
      return NextResponse.json(
        { message: 'Missing or invalid status or reason for update.' },
        { status: 400 }
      );
    }
    // Type assertion to ensure newStatus is compatible with OrderStatus enum
    if (!ALLOWED_STATUSES.includes(newStatus as OrderStatus)) {
      return NextResponse.json({ message: `Invalid status value: ${newStatus}.` }, { status: 400 });
    }

    // Fetch current order (optional, but good for logging)
    const orderCheck = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderCheck.length === 0)
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    const currentStatus = orderCheck[0].status;
    console.log(
      `Attempting to manually update order ${orderId} from ${currentStatus} to ${newStatus}. Reason: ${reason}`
    );

    // Update Order Status
    await sql`
        UPDATE orders SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP WHERE id = ${orderId}
    `;

    // TODO: Log Action in order_history
    console.log(
      `Placeholder: Log manual status change for order ${orderId} to ${newStatus} by Admin ${adminUserId} with reason: ${reason}`
    );

    // --- CRITICAL: Handle Side Effects ---
    if (newStatus === 'Cancelled') {
      console.log(`Processing side effects for cancelled order ${orderId}`);

      try {
        // Restock inventory
        const orderItems = await sql`
                SELECT oi.product_id, oi.quantity, o.shipping_address
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.order_id = ${orderId}
            `;

        if (orderItems.length > 0) {
          // Parse shipping address to determine location
          const shippingAddress = JSON.parse(orderItems[0].shipping_address);
          // Default to main warehouse if no specific location can be determined
          const location = 'Main Warehouse';

          // Restock each item
          for (const item of orderItems) {
            await sql`
                        UPDATE inventory
                        SET quantity = quantity + ${item.quantity},
                            last_updated = CURRENT_TIMESTAMP,
                            notes = CONCAT(COALESCE(notes, ''), ' | Restocked due to order cancellation')
                        WHERE product_id = ${item.product_id}
                        AND location = ${location}
                    `;
            console.log(`Restocked ${item.quantity} of product ${item.product_id} at ${location}`);
          }
        }

        // Cancel commissions
        const { cancelCommissionsForOrder } = await import('@/lib/commission');
        const commissionResult = await cancelCommissionsForOrder(orderId);
        console.log(`Commission cancellation result:`, commissionResult);
      } catch (sideEffectError) {
        console.error(
          `Error processing side effects for cancelled order ${orderId}:`,
          sideEffectError
        );
        // We don't throw here to avoid preventing the status update
      }
    }

    if (newStatus === 'Refunded') {
      console.log(`Processing side effects for refunded order ${orderId}`);

      try {
        // Get payment information
        const paymentInfo = await sql`
                SELECT payment_method, payment_status
                FROM orders
                WHERE id = ${orderId}
            `;

        if (paymentInfo.length > 0) {
          const { payment_method, payment_status } = paymentInfo[0];

          // Only process refund if payment was completed
          if (payment_status === 'Completed') {
            // Create a task for manual refund processing
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
                            'Process refund',
                            'Process refund for order #${orderId} with payment method ${payment_method}',
                            'Pending',
                            'High',
                            'Payment',
                            'Order',
                            ${orderId}
                        )
                    `;
            console.log(`Created refund task for order ${orderId}`);
          }
        }

        // Cancel commissions (same as for cancelled orders)
        const { cancelCommissionsForOrder } = await import('@/lib/commission');
        const commissionResult = await cancelCommissionsForOrder(orderId);
        console.log(`Commission cancellation result:`, commissionResult);
      } catch (sideEffectError) {
        console.error(
          `Error processing side effects for refunded order ${orderId}:`,
          sideEffectError
        );
        // We don't throw here to avoid preventing the status update
      }
    }

    // Handle commission calculation for shipped orders
    if (newStatus === 'Shipped') {
      console.log(`Processing commissions for shipped order ${orderId}`);

      try {
        // Get order details including referral code and total amount
        const orderDetails = await sql`
                SELECT o.total_amount, o.user_id, u.referred_by_code
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = ${orderId}
            `;

        if (orderDetails.length > 0) {
          const { total_amount, referred_by_code } = orderDetails[0];

          // Calculate referral commission if applicable
          if (referred_by_code) {
            const { calculateOrderReferralCommission } = await import('@/lib/commission');
            const referralResult = await calculateOrderReferralCommission(
              orderId,
              parseFloat(total_amount),
              referred_by_code
            );
            console.log(`Referral commission result:`, referralResult);
          }

          // Calculate distributor fulfillment commission if applicable
          // First check if a distributor was assigned to this order
          const distributorAssignment = await sql`
                    SELECT distributor_id
                    FROM order_assignments
                    WHERE order_id = ${orderId}
                    AND status = 'Completed'
                `;

          if (distributorAssignment.length > 0 && distributorAssignment[0].distributor_id) {
            const { calculateDistributorFulfillmentCommission } = await import('@/lib/commission');
            const fulfillmentResult = await calculateDistributorFulfillmentCommission(
              orderId,
              parseFloat(total_amount),
              distributorAssignment[0].distributor_id
            );
            console.log(`Fulfillment commission result:`, fulfillmentResult);
          }
        }
      } catch (commissionError) {
        console.error(`Error calculating commissions for order ${orderId}:`, commissionError);
        // We don't throw here to avoid preventing the status update
      }
    }

    return NextResponse.json({
      message: `Order ${orderId} status manually updated to ${newStatus}.`,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    console.error(`Admin: Failed to manually update status for order ${orderId}:`, error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
