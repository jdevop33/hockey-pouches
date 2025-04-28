import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', // Use the latest API version
});

export const dynamic = 'force-dynamic';

/**
 * Creates a Stripe Payment Intent for the current cart
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
    const { orderId } = body;

    // If there's an orderId, fetch the order total
    let amount = 0;

    if (orderId) {
      // Get the order total from the database
      const order = await sql`
        SELECT total_amount
        FROM orders
        WHERE id = ${orderId} AND user_id = ${userId}
      `;

      if (order.length === 0) {
        return NextResponse.json(
          { message: 'Order not found or not owned by the current user' },
          { status: 404 }
        );
      }

      amount = Math.round(order[0].total_amount * 100); // Convert to cents
    } else {
      // Get cart items and calculate total
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

      // Calculate cart total
      const subtotal = cartItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = 10.0; // Fixed shipping cost for now
      const taxRate = 0.13; // 13% tax rate for Canada
      const taxes = subtotal * taxRate;
      const totalAmount = subtotal + shippingCost + taxes;

      amount = Math.round(totalAmount * 100); // Convert to cents
    }

    // Create a Payment Intent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        orderId: orderId || '',
      },
    });

    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ message: 'Failed to create payment intent' }, { status: 500 });
  }
}
