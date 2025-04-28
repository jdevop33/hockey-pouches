import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

/**
 * Handles manual payment methods (e-transfer, bitcoin) since Stripe isn't approved yet
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;

    // Get the request body
    const body = await request.json();
    const { orderId, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    if (!paymentMethod || !['etransfer', 'bitcoin'].includes(paymentMethod)) {
      return NextResponse.json(
        { message: 'Valid payment method is required (etransfer or bitcoin)' },
        { status: 400 }
      );
    }

    // Get the order to verify it belongs to the user and is in a valid state
    const order = await sql`
      SELECT id, status, total_amount, payment_status
      FROM orders
      WHERE id = ${orderId} AND user_id = ${userId}
    `;

    if (order.length === 0) {
      return NextResponse.json(
        { message: 'Order not found or not owned by the current user' },
        { status: 404 }
      );
    }

    if (order[0].payment_status !== 'Pending') {
      return NextResponse.json(
        { message: 'This order has already been processed for payment' },
        { status: 400 }
      );
    }

    // Generate payment reference ID
    const paymentReference = `${paymentMethod.substring(0, 3)}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    // Update order with payment method and reference
    await sql`
      UPDATE orders
      SET 
        payment_status = 'Processing',
        payment_method = ${paymentMethod},
        payment_reference = ${paymentReference},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;

    // Create task for admin to confirm payment
    const taskTitle =
      paymentMethod === 'etransfer'
        ? `Confirm E-Transfer Payment for Order ${orderId}`
        : `Confirm Bitcoin Payment for Order ${orderId}`;

    await sql`
      INSERT INTO tasks (
        id, title, category, status, priority, assigned_user_id,
        related_entity_type, related_entity_id, due_date, created_at, updated_at
      )
      VALUES (
        ${uuidv4()},
        ${taskTitle},
        ${'Payment'},
        ${'Pending'},
        ${'High'},
        (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
        ${'Order'},
        ${orderId},
        (CURRENT_DATE + INTERVAL '2 days'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;

    // Add entry to order history
    await sql`
      INSERT INTO order_history (
        order_id, status, user_id, notes, timestamp
      )
      VALUES (
        ${orderId},
        ${'Payment Processing'},
        ${userId},
        ${`Manual ${paymentMethod} payment initiated with reference: ${paymentReference}`},
        CURRENT_TIMESTAMP
      )
    `;

    // Generate payment instructions based on payment method
    let paymentInstructions = '';
    if (paymentMethod === 'etransfer') {
      paymentInstructions = `
        Please send your e-transfer to payments@nicotinetins.com with the reference code: ${paymentReference}
        
        Important instructions:
        1. Use the exact reference code as your e-transfer message
        2. Do not use password protection for the transfer
        3. You will receive a confirmation email once we've verified your payment
      `;
    } else if (paymentMethod === 'bitcoin') {
      paymentInstructions = `
        Please send Bitcoin to the following address:
        bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
        
        Important instructions:
        1. Include the reference code ${paymentReference} in the transaction memo if possible
        2. Send us a notification email at payments@nicotinetins.com with:
           - Your reference code: ${paymentReference}
           - Transaction hash/ID
           - Amount sent
        3. You will receive a confirmation email once we've verified your payment
      `;
    }

    return NextResponse.json({
      success: true,
      paymentMethod,
      paymentReference,
      paymentInstructions,
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    console.error('Error processing manual payment:', error);
    return NextResponse.json({ message: 'Failed to process payment request' }, { status: 500 });
  }
}
