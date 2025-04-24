import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { Address, OrderStatus, PaymentStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

interface CheckoutBody {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  referralCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    
    // Parse request body
    const body: CheckoutBody = await request.json();
    const { shippingAddress, billingAddress, paymentMethod, referralCode } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ 
        message: 'Shipping address and payment method are required' 
      }, { status: 400 });
    }

    console.log(`POST /api/checkout - User: ${userId}, Payment Method: ${paymentMethod}`);

    // Get cart items
    const cartItems = await sql`
      SELECT 
        c.product_id, c.quantity,
        p.name as product_name, CAST(p.price AS FLOAT) as price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ${userId}
    `;

    if (cartItems.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    // Calculate order totals
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shippingCost = 10.00; // Fixed shipping cost for now
    const taxRate = 0.13; // 13% tax rate for Canada
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxes;

    // Create order
    const orderId = uuidv4();
    const orderStatus = 'Pending Approval' as OrderStatus;
    const paymentStatus = 'Pending' as PaymentStatus;

    await sql`
      INSERT INTO orders (
        id, user_id, status, subtotal, shipping_cost, taxes, total_amount,
        shipping_address, billing_address, payment_method, payment_status,
        referral_code, created_at, updated_at
      )
      VALUES (
        ${orderId}, ${userId}, ${orderStatus}, ${subtotal}, ${shippingCost}, ${taxes}, ${totalAmount},
        ${JSON.stringify(shippingAddress)}, ${billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress)},
        ${paymentMethod}, ${paymentStatus}, ${referralCode || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;

    // Create order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
        VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.price})
      `;
    }

    // Add order history entry
    await sql`
      INSERT INTO order_history (order_id, status, user_id, notes, timestamp)
      VALUES (
        ${orderId}, 
        ${orderStatus}, 
        ${userId}, 
        ${'Order created'}, 
        CURRENT_TIMESTAMP
      )
    `;

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;

    // TODO: Create task for admin to approve order
    console.log(`Placeholder: Create task 'Approve Order ${orderId}'`);

    // TODO: Process payment based on payment method
    // This would typically involve calling a payment gateway API

    return NextResponse.json({ 
      message: 'Order created successfully',
      orderId,
      status: orderStatus,
      total: totalAmount
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to process checkout:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
