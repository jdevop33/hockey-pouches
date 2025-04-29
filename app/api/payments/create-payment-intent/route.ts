// app/api/payments/create-payment-intent/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and } from 'drizzle-orm';
import { cartService } from '@/lib/services/cart-service'; // Use refactored cart service
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

let stripe: Stripe | undefined;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (stripeSecretKey) {
  import('stripe').then(StripeModule => {
    stripe = new StripeModule.default(stripeSecretKey, {
        apiVersion: '2024-06-20', // Use a fixed version
        typescript: true,
    });
  });
} else {
    logger.warn('STRIPE_SECRET_KEY environment variable not set.');
}

export const dynamic = 'force-dynamic';

function calculateFinalAmount(subtotal: number): number {
    const shippingCost = 10.00;
    const taxRate = 0.13;
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxes;
    return Math.round(totalAmount * 100);
}

export async function POST(request: NextRequest) {
    if (!stripe) {
        logger.warn('Stripe not configured for createPaymentIntent');
        return NextResponse.json(
            { message: 'Online payments are currently unavailable.', useManualPayment: true },
            { status: 503 }
        );
    }
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;
        const body = await request.json();
        const { orderId } = body;
        let amountInCents = 0;
        let orderMetadataId: string | undefined = orderId;

        if (orderId) {
            logger.info(`Creating payment intent for existing order`, { userId, orderId });
            const order = await db.query.orders.findFirst({
                where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)),
                columns: { totalAmount: true }
            });
            if (!order || !order.totalAmount) {
                return NextResponse.json({ message: 'Order not found or amount missing.' }, { status: 404 });
            }
            amountInCents = Math.round(parseFloat(order.totalAmount) * 100);
        } else {
            logger.info(`Creating payment intent for current cart`, { userId });
            const cartSummary = await cartService.getCartItems(userId);
            if (cartSummary.itemCount === 0) {
                return NextResponse.json({ message: 'Cannot create payment intent for an empty cart.' }, { status: 400 });
            }
            amountInCents = calculateFinalAmount(cartSummary.subtotal);
            orderMetadataId = undefined;
        }
        if (amountInCents <= 0) {
             return NextResponse.json({ message: 'Invalid amount for payment intent.' }, { status: 400 });
        }
        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount: amountInCents, currency: 'cad', automatic_payment_methods: { enabled: true },
            metadata: { userId: userId, ...(orderMetadataId && { orderId: orderMetadataId }) },
        };
        logger.info('Creating Stripe payment intent', { userId, amount: amountInCents, orderId: orderMetadataId });
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
        logger.info('Stripe payment intent created successfully', { userId, paymentIntentId: paymentIntent.id });
        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        logger.error('Error creating payment intent:', { error });
         if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Failed to initialize payment. Please try again or use a manual method.', useManualPayment: true },
            { status: 500 }
        );
    }
}
