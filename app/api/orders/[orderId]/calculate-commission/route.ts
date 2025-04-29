import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { sql } from '@/lib/db'; // Corrected import

export const dynamic = 'force-dynamic';

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
    // TODO: Define system roles or use API keys for system-to-system calls
    if (authResult.role !== 'Admin') { 
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can trigger commission calculation' },
        { status: 403 }
      );
    }

    const orderId = params.orderId;
    if (!orderId || typeof orderId !== 'string') { // Basic validation
      return NextResponse.json(
        { message: 'Valid Order ID is required' },
        { status: 400 }
      );
    }

    console.log(`Calculating commissions for order: ${orderId}`);

    // 1. Get order details (including user info)
    const orderResult = await sql`
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
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0];
    
    // Only calculate commissions for shipped, delivered or completed orders
    if (!['Shipped', 'Delivered', 'Completed'].includes(order.status)) {
      return NextResponse.json(
        { message: `Commissions cannot be calculated for orders with status: ${order.status}` },
        { status: 400 }
      );
    }

    // 2. Check if commission already exists for this order
    // Assuming only one commission per order based on this structure
    const existingCommission = await sql`
      SELECT id FROM commissions 
      WHERE related_to = 'Order' AND related_id = ${orderId}
    `;

    if (existingCommission.length > 0) {
      console.log(`Commission already exists for order ${orderId}`);
      return NextResponse.json(
        { message: 'Commission already calculated for this order', commissionId: existingCommission[0].id },
        { status: 200 } // Not an error, just informing
      );
    }

    // 3. Check if the customer who placed the order was referred by someone
    const referrerUserId = order.referred_by_user_id;
    if (!referrerUserId) {
      console.log(`No referrer found for user ${order.user_id} who placed order ${orderId}`);
      return NextResponse.json(
        { message: 'No referrer found for the customer of this order' },
        { status: 200 } // Not an error, just no commission to create
      );
    }

    // 4. Get referrer's commission rate
    const referrerResult = await sql`SELECT commission_rate FROM users WHERE id = ${referrerUserId}`;
    const commissionRateDecimal = referrerResult.length > 0 ? parseFloat(referrerResult[0].commission_rate) : null;
    
    if (commissionRateDecimal === null || isNaN(commissionRateDecimal)) {
         console.warn(`Referrer ${referrerUserId} does not have a valid commission rate set. Skipping commission.`);
         return NextResponse.json({ message: 'Referrer commission rate not set.' }, { status: 200 });
    }
    const commissionRate = commissionRateDecimal / 100; // Convert percentage to decimal

    // 5. Calculate commission amount
    const commissionAmount = order.total_amount * commissionRate;
    
    // Round to 2 decimal places
    const roundedCommissionAmount = Math.round(commissionAmount * 100) / 100;
    
    if (roundedCommissionAmount <= 0) {
        console.log(`Calculated commission is zero or negative ($${roundedCommissionAmount}) for order ${orderId}. Skipping.`);
        return NextResponse.json({ message: 'Calculated commission is zero or negative.' }, { status: 200 });
    }

    // 6. Create commission record
    const commissionResult = await sql`
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
        'OrderReferral', -- Use specific type
        ${roundedCommissionAmount},
        'Pending', -- Initial status is Pending
        'Order', -- Related entity type
        ${orderId}, -- Related entity ID
        'Commission for referred customer order',
        ${commissionRateDecimal} -- Store rate as percentage (e.g., 5.00)
      )
      RETURNING id
    `;

    const commissionId = commissionResult[0].id;

    console.log(`Commission calculated successfully: $${roundedCommissionAmount} for referrer ID: ${referrerUserId}`);

    // 7. Create Task for Admin to Approve Commission Payout (Optional)
    await sql`
      INSERT INTO tasks (
        title, description, category, status, priority, 
        related_to, related_id, assigned_to
      )
      VALUES (
        'Approve Commission Payout', 
        ${`Approve commission ID ${commissionId} ($${roundedCommissionAmount}) for referrer ${referrerUserId} from order ${orderId}`},
        'Payout', 'Pending', 'Medium', 
        'Commission', ${commissionId},
        (SELECT id FROM users WHERE role = 'Admin' LIMIT 1)
      )
    `;
    console.log(`Created task to approve commission payout (ID: ${commissionId})`);

    return NextResponse.json({
      message: 'Commission calculated successfully',
      commissionId,
      referrerId: referrerUserId,
      // referralCode: order.referred_by_code, // This was the *customer's* code, not the referrer's
      amount: roundedCommissionAmount,
      status: 'Pending'
    });
  } catch (error) {
    console.error('Error calculating commission:', error);
    return NextResponse.json(
      { message: 'Failed to calculate commission' },
      { status: 500 }
    );
  }
}
