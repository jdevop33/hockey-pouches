import { NextResponse, type NextRequest } from 'next/server';
import { getStripeInstance } from '@/lib/stripe-server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  const stripe = getStripeInstance();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    // Get the raw body as text
    const rawBody = await request.text();
    
    // Verify the webhook signature
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret is missing');
    }
    
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Webhook error' },
      { status: 400 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id, metadata } = paymentIntent;
  const { orderId, userId } = metadata || {};
  
  if (!orderId || !userId) {
    console.error('Missing metadata in payment intent:', id);
    return;
  }
  
  try {
    // Update payment record
    await sql`
      UPDATE payments 
      SET status = 'Completed', 
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_intent_id = ${id}
    `;
    
    // Update order status
    await sql`
      UPDATE orders 
      SET payment_status = 'Completed', 
          status = 'Processing'
      WHERE id = ${orderId}
    `;
    
    // Create a task for order processing
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
        'Process paid order', 
        'Credit card payment received. Process order for shipping.', 
        'Pending', 
        'High', 
        'Order', 
        'Order', 
        ${orderId}
      )
    `;
    
    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error(`Error processing successful payment for order ${orderId}:`, error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { id, metadata } = paymentIntent;
  const { orderId, userId } = metadata || {};
  
  if (!orderId || !userId) {
    console.error('Missing metadata in payment intent:', id);
    return;
  }
  
  try {
    // Update payment record
    await sql`
      UPDATE payments 
      SET status = 'Failed', 
          updated_at = CURRENT_TIMESTAMP
      WHERE payment_intent_id = ${id}
    `;
    
    // Update order status
    await sql`
      UPDATE orders 
      SET payment_status = 'Failed'
      WHERE id = ${orderId}
    `;
    
    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error(`Error processing failed payment for order ${orderId}:`, error);
  }
}
