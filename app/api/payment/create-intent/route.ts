import { NextResponse, type NextRequest } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe-server';
import { getUserFromRequest } from '@/lib/auth';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ message: 'Invalid request parameters' }, { status: 400 });
    }

    // Verify the order exists and belongs to the user
    const orderResult = await sql`
      SELECT id, user_id, total_amount, payment_status 
      FROM orders 
      WHERE id = ${orderId}
    `;

    if (orderResult.length === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const order = orderResult[0];
    
    // Verify the order belongs to the user
    if (order.user_id !== user.id) {
      return NextResponse.json({ message: 'Unauthorized access to order' }, { status: 403 });
    }

    // Check if payment is already completed
    if (order.payment_status === 'Completed') {
      return NextResponse.json({ message: 'Payment already completed' }, { status: 400 });
    }

    // Create a payment intent with Stripe
    const amountInCents = Math.round(parseFloat(amount) * 100);
    const result = await createPaymentIntent({
      amount: amountInCents,
      currency: 'cad',
      metadata: {
        orderId: orderId.toString(),
        userId: user.id,
      },
      description: `Payment for Order #${orderId}`,
    });

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 500 });
    }

    // Store the payment intent ID in the database
    await sql`
      INSERT INTO payments (
        order_id, 
        user_id, 
        amount, 
        payment_method, 
        transaction_id, 
        status,
        payment_intent_id
      ) VALUES (
        ${orderId}, 
        ${user.id}, 
        ${amount}, 
        'credit-card', 
        ${result.paymentIntentId}, 
        'Processing',
        ${result.paymentIntentId}
      )
    `;

    // Update order payment status
    await sql`
      UPDATE orders 
      SET payment_status = 'Processing'
      WHERE id = ${orderId}
    `;

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
