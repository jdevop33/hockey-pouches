// app/api/payments/create-payment-intent/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema/orders';
import { cart } from '@/lib/schema/cart';
import { orders } from '@/lib/schema/orders';
import { cart } from '@/lib/schema/cart';
import { orders } from '@/lib/schema/orders';
import { cart } from '@/lib/schema/cart';
import { orders } from '@/lib/schema/orders';
import { cart } from '@/lib/schema/cart';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use central schema index
import { eq, and } from 'drizzle-orm';
import { cartService } from '@/lib/services/cart-service'; // Use refactored cart service
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

let stripe: Stripe | undefined;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (stripeSecretKey) {
  // Dynamically import Stripe to avoid making it a hard dependency if not configured
  import('stripe').then(StripeModule => {
    stripe = new StripeModule.default(stripeSecretKey, {
        apiVersion: '2025-03-31.basil', // Match the type definition expectation
        typescript: true,
    });
  }).catch(err => {
      logger.error('Failed to import or initialize Stripe', { error: err });
      stripe = undefined; // Ensure stripe is undefined if import fails
  });
} else {
    logger.warn('STRIPE_SECRET_KEY environment variable not set. Stripe payments disabled.');
}

export const dynamic = 'force-dynamic';

// TODO: Move calculation logic to a shared place (e.g., order service)
function calculateFinalAmount(subtotal: number): number {
    const shippingCost = 5.00; // Placeholder
    const taxRate = 0.13; // Placeholder
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxes;
    // Ensure amount is at least 50 cents (Stripe minimum)
    return Math.max(50, Math.round(totalAmount * 100));
}

export async function POST(request: NextRequest) {
    if (!stripe) {
        logger.warn('Stripe not configured for createPaymentIntent');
        return NextResponse.json(
            { message: 'Online payments are currently unavailable.', useManualPayment: true },
            { status: 503 } // Service Unavailable
        );
    }
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;
        const body = await request.json();
        const { orderId } = body; // Optional order ID
        let amountInCents = 0;
        let orderMetadataId: string | undefined = orderId;

        // Scenario 1: Payment intent for an existing order (e.g., user retries payment)
        if (orderId && typeof orderId === 'string') {
            logger.info(`Creating payment intent for existing order`, { userId, orderId });
            const order = await db.query.orders.findFirst({
                where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)),
                columns: { totalAmount: true }
            });
            if (!order || !order.totalAmount) {
                 logger.warn('Order not found or amount missing when creating payment intent', { userId, orderId });
                return NextResponse.json({ message: 'Order not found or amount missing.' }, { status: 404 });
            }
            // Use the total amount from the existing order
            amountInCents = Math.max(50, Math.round(parseFloat(order.totalAmount) * 100));

        // Scenario 2: Payment intent for a new checkout based on cart
        } else {
            logger.info(`Creating payment intent for current cart`, { userId });
            const cartSummary = await cartService.getCartSummary(userId); // Assuming cartService exists
            if (cartSummary.itemCount === 0) {
                logger.warn('Attempted to create payment intent for empty cart', { userId });
                return NextResponse.json({ message: 'Cannot create payment intent for an empty cart.' }, { status: 400 });
            }
            // Calculate amount based on current cart subtotal + taxes/shipping
            amountInCents = calculateFinalAmount(cartSummary.subtotal);
            orderMetadataId = undefined; // No order ID yet
        }

        // Final validation on amount
        if (amountInCents < 50) { // Stripe minimum is usually $0.50 CAD
             logger.warn('Calculated amount too low for payment intent', { userId, orderId, amountInCents });
             return NextResponse.json({ message: 'Invalid amount for payment intent (minimum $0.50).' }, { status: 400 });
        }

        // Create Payment Intent parameters
        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount: amountInCents,
            currency: 'cad',
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: userId,
                ...(orderMetadataId && { orderId: orderMetadataId }) // Add orderId if available
            },
            // Add customer ID if available to link payments
            // customer: stripeCustomerId, 
        };

        logger.info('Creating Stripe payment intent', { userId, amount: amountInCents, orderId: orderMetadataId });
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
        logger.info('Stripe payment intent created successfully', { userId, paymentIntentId: paymentIntent.id });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });

    } catch (error: any) {
        logger.error('Error creating payment intent:', { error: error?.message ?? error });
         if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        // Provide a user-friendly error and suggest manual payment
        return NextResponse.json(
            { message: 'Failed to initialize payment. Please try again or use a manual payment method.', useManualPayment: true },
            { status: 500 }
        );
    }
}
