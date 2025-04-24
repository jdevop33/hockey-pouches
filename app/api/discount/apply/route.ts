import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Get the request body
    const body = await request.json();
    const { code, orderId } = body;

    if (!code || !orderId) {
      return NextResponse.json(
        { message: 'Discount code and order ID are required' },
        { status: 400 }
      );
    }

    // Get the order details
    const orderResult = await sql`
      SELECT id, subtotal, discount_code, discount_amount
      FROM orders
      WHERE id = ${orderId}
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Check if a discount code is already applied
    if (order.discount_code) {
      return NextResponse.json(
        { message: 'A discount code is already applied to this order' },
        { status: 400 }
      );
    }

    // Get the discount code details
    const discountResult = await sql`
      SELECT 
        id, code, description, discount_type, discount_value, 
        min_order_amount, max_discount_amount, start_date, end_date, 
        usage_limit, times_used, is_active
      FROM discount_codes
      WHERE code = ${code}
        AND is_active = TRUE
        AND start_date <= CURRENT_TIMESTAMP
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
        AND (usage_limit IS NULL OR times_used < usage_limit)
    `;

    if (discountResult.length === 0) {
      return NextResponse.json(
        { message: 'Invalid or expired discount code' },
        { status: 400 }
      );
    }

    const discountCode = discountResult[0];
    const subtotal = parseFloat(order.subtotal);

    // Check minimum order amount
    if (subtotal < discountCode.min_order_amount) {
      return NextResponse.json(
        { 
          message: `This code requires a minimum order of $${discountCode.min_order_amount.toFixed(2)}` 
        },
        { status: 400 }
      );
    }

    // Calculate the discount amount
    let discountAmount = 0;
    if (discountCode.discount_type === 'percentage') {
      discountAmount = subtotal * (discountCode.discount_value / 100);
      
      // Apply maximum discount if specified
      if (discountCode.max_discount_amount && discountAmount > discountCode.max_discount_amount) {
        discountAmount = discountCode.max_discount_amount;
      }
    } else if (discountCode.discount_type === 'fixed_amount') {
      discountAmount = discountCode.discount_value;
      
      // Ensure discount doesn't exceed order total
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    // Update the order with the discount code and amount
    await sql`
      UPDATE orders
      SET 
        discount_code = ${code},
        discount_amount = ${discountAmount},
        total_amount = total_amount - ${discountAmount}
      WHERE id = ${orderId}
    `;

    // Increment the usage count for the discount code
    await sql`
      UPDATE discount_codes
      SET times_used = times_used + 1
      WHERE code = ${code}
    `;

    return NextResponse.json({
      success: true,
      code: discountCode.code,
      description: discountCode.description,
      discountType: discountCode.discount_type,
      discountValue: discountCode.discount_value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      message: `Discount applied: ${
        discountCode.discount_type === 'percentage' 
          ? `${discountCode.discount_value}% off` 
          : `$${discountCode.discount_value.toFixed(2)} off`
      }`
    });
  } catch (error: any) {
    console.error('Error applying discount code:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
