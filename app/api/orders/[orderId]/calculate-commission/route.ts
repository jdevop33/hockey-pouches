import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db'; // Import db instance and sql helper
import { logger } from '@/lib/logger'; // Import logger
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import { commissions } from '@/lib/schema/commissions';
import { tasks } from '@/lib/schema/tasks';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Import schema

export const dynamic = 'force-dynamic';

// Define expected row structures from queries
interface OrderQueryResultRow {
    id: number;
    user_id: string;
    total_amount: number;
    status: string;
    referred_by_user_id: string | null;
    user_referral_code: string | null;
}

interface CommissionQueryResultRow {
    id: number;
}

interface ReferrerQueryResultRow {
    commission_rate: string | null; // Assuming commission_rate is stored as string/numeric
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Verify authentication (only admin or system should call this)
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Only allow admin users to calculate commissions
    if (authResult.role !== 'Admin') {
      logger.warn('Non-admin attempted commission calculation', { userId: String(authResult.userId), role: authResult.role });
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can trigger commission calculation' },
        { status: 403 }
      );
    }

    const orderId = params.orderId;
    // Validate orderId format (e.g., is it a number or UUID?)
    if (!orderId || typeof orderId !== 'string') { // Basic validation
        logger.warn('Invalid orderId format received for commission calculation', { orderId });
      return NextResponse.json(
        { message: 'Valid Order ID is required' },
        { status: 400 }
      );
    }

    logger.info('Calculating commissions for order', { orderId });

    // 1. Get order details (including user info)
    const orderQueryResult = await db.execute(sql`
      SELECT
        o.id,
        o.user_id, -- Changed from customer_id
        CAST(o.total_amount AS FLOAT) as total_amount,
        o.status,
        u.referred_by as referred_by_user_id, -- Get referrer ID directly from user table
        u.referral_code as user_referral_code -- Get the customer's own code (if any)
        -- Potentially get the code used for the order: o.applied_referral_code
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `);

    if (orderQueryResult.rows.length === 0) {
      logger.warn('Order not found for commission calculation', { orderId });
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderQueryResult.rows[0] as OrderQueryResultRow;

    // Only calculate commissions for shipped, delivered or completed orders
    if (!['Shipped', 'Delivered', 'Completed'].includes(order.status)) {
        logger.info('Commission calculation skipped: Order status not eligible', { orderId, status: order.status });
      return NextResponse.json(
        { message: `Commissions cannot be calculated for orders with status: ${order.status}` },
        { status: 400 }
      );
    }

    // 2. Check if commission already exists for this order
    const existingCommissionResult = await db.execute(sql`
      SELECT id FROM commissions
      WHERE related_to = 'Order' AND related_id = ${orderId}
    `);

    if (existingCommissionResult.rows.length > 0) {
      const existingCommissionId = (existingCommissionResult.rows[0] as CommissionQueryResultRow).id;
      logger.info('Commission already exists for order', { orderId, commissionId: existingCommissionId });
      return NextResponse.json(
        { message: 'Commission already calculated for this order', commissionId: existingCommissionId },
        { status: 200 } // Not an error, just informing
      );
    }

    // 3. Check if the customer who placed the order was referred by someone
    const referrerUserId = order.referred_by_user_id;
    if (!referrerUserId) {
      logger.info('No referrer found for user of order, skipping commission', { orderId, userId: order.user_id });
      return NextResponse.json(
        { message: 'No referrer found for the customer of this order' },
        { status: 200 } // Not an error, just no commission to create
      );
    }

    // 4. Get referrer's commission rate
    const referrerResult = await db.execute(sql`SELECT commission_rate FROM users WHERE id = ${referrerUserId}`);
    const commissionRateStr = referrerResult.rows.length > 0 ? (referrerResult.rows[0] as ReferrerQueryResultRow).commission_rate : null;
    const commissionRateDecimal = commissionRateStr ? parseFloat(commissionRateStr) : null;

    if (commissionRateDecimal === null || isNaN(commissionRateDecimal) || commissionRateDecimal <= 0) {
         logger.warn(`Referrer does not have a valid positive commission rate set. Skipping commission.`, { orderId, referrerUserId, rate: commissionRateStr });
         return NextResponse.json({ message: 'Referrer commission rate not set or invalid.' }, { status: 200 });
    }
    const commissionRate = commissionRateDecimal / 100; // Convert percentage to decimal

    // 5. Calculate commission amount
    const commissionAmount = order.total_amount * commissionRate;

    // Round to 2 decimal places
    const roundedCommissionAmount = Math.round(commissionAmount * 100) / 100;

    if (roundedCommissionAmount <= 0) {
        logger.info(`Calculated commission is zero or negative. Skipping.`, { orderId, referrerUserId, calculatedAmount: roundedCommissionAmount });
        return NextResponse.json({ message: 'Calculated commission is zero or negative.' }, { status: 200 });
    }

    // 6. Create commission record
    const commissionInsertResult = await db.execute(sql`
      INSERT INTO commissions (
        user_id,
        type,
        amount,
        status,
        related_to,
        related_id,
        notes,
        rate -- Store the rate used for calculation
      )
      VALUES (
        ${referrerUserId},
        ${schema.commissionTypeEnum.enumValues[0]}, -- Use enum value, e.g., OrderReferral
        ${roundedCommissionAmount},
        ${schema.commissionStatusEnum.enumValues[0]}, -- Use enum value, e.g., Pending
        ${schema.commissionRelatedEntityEnum.enumValues[0]}, -- Use enum value, e.g., Order
        ${orderId}, -- Related entity ID
        ${`Commission for referred order ${orderId}`},
        ${commissionRateDecimal} -- Store rate as percentage (e.g., 5.00)
      )
      RETURNING id
    `);

    const commissionId = (commissionInsertResult.rows[0] as CommissionQueryResultRow).id;

    logger.info(`Commission created successfully`, { orderId, commissionId, referrerUserId, amount: roundedCommissionAmount });

    // 7. Create Task for Admin to Approve Commission Payout (Optional)
    // Find an admin user ID to assign the task to
    const adminUserResult = await db.execute(sql`SELECT id FROM users WHERE role = 'Admin' LIMIT 1`);
    const adminUserId = adminUserResult.rows.length > 0 ? (adminUserResult.rows[0] as { id: string }).id : null;

    if (adminUserId) {
        await db.execute(sql`
          INSERT INTO tasks (
            title, description, category, status, priority,
            related_to, related_id, assigned_to
          )
          VALUES (
            'Approve Commission Payout',
            ${`Approve commission ID ${commissionId} ($${roundedCommissionAmount}) for referrer ${referrerUserId} from order ${orderId}`},
            ${schema.taskCategoryEnum.Payout}, -- Use enum
            ${schema.taskStatusEnum.Pending}, -- Use enum
            ${schema.taskPriorityEnum.Medium}, -- Use enum
            ${schema.taskRelatedEntityEnum.Commission}, -- Use enum
             ${commissionId},
            ${adminUserId}
          )
        `);
        logger.info(`Created task to approve commission payout`, { commissionId, adminUserId });
    } else {
        logger.warn('Could not find an Admin user to assign commission approval task', { commissionId });
    }

    return NextResponse.json({
      message: 'Commission calculated successfully',
      commissionId,
      referrerId: String(referrerUserId),
      amount: roundedCommissionAmount,
      status: schema.commissionStatusEnum.Pending // Return enum value
    });
  } catch (error) {
    logger.error('Error calculating commission', { orderId: String(params.orderId), error });
    return NextResponse.json(
      { message: 'Failed to calculate commission' },
      { status: 500 }
    );
  }
}
