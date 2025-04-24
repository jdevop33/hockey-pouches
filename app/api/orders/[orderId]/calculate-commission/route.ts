import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';

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
    if (authResult.role !== 'Admin' && authResult.role !== 'Owner') {
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can calculate commissions' },
        { status: 403 }
      );
    }

    const orderId = params.orderId;
    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log(`Calculating commissions for order: ${orderId}`);

    // 1. Get order details
    const orderResult = await sql`
      SELECT 
        o.id, 
        o.customer_id, 
        CAST(o.total_amount AS FLOAT) as total_amount,
        o.status,
        u.referred_by_user_id,
        u.referred_by_code
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = ${orderId}
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0];
    
    // Only calculate commissions for shipped or delivered orders
    if (order.status !== 'Shipped' && order.status !== 'Delivered') {
      return NextResponse.json(
        { message: 'Commissions can only be calculated for shipped or delivered orders' },
        { status: 400 }
      );
    }

    // 2. Check if commission already exists for this order
    const existingCommission = await sql`
      SELECT id FROM commissions 
      WHERE related_to = 'Order' AND related_id = ${orderId}
    `;

    if (existingCommission.length > 0) {
      return NextResponse.json(
        { message: 'Commission already calculated for this order', commissionId: existingCommission[0].id },
        { status: 200 }
      );
    }

    // 3. Check if customer was referred by someone
    if (!order.referred_by_user_id) {
      return NextResponse.json(
        { message: 'No referrer found for this customer' },
        { status: 200 }
      );
    }

    // 4. Calculate commission amount (5% of order total)
    const commissionRate = 0.05; // 5%
    const commissionAmount = order.total_amount * commissionRate;
    
    // Round to 2 decimal places
    const roundedCommissionAmount = Math.round(commissionAmount * 100) / 100;

    // 5. Create commission record
    const commissionResult = await sql`
      INSERT INTO commissions (
        user_id, 
        type, 
        amount, 
        status, 
        related_to, 
        related_id, 
        notes
      )
      VALUES (
        ${order.referred_by_user_id},
        'Order Referral',
        ${roundedCommissionAmount},
        'Pending',
        'Order',
        ${orderId},
        'Commission for referred customer order'
      )
      RETURNING id
    `;

    const commissionId = commissionResult[0].id;

    console.log(`Commission calculated successfully: $${roundedCommissionAmount} for referrer ID: ${order.referred_by_user_id}`);

    return NextResponse.json({
      message: 'Commission calculated successfully',
      commissionId,
      referrerId: order.referred_by_user_id,
      referralCode: order.referred_by_code,
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
