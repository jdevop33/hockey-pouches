// app/lib/stripe-server.ts
import Stripe from 'stripe';

// Initialize Stripe with the secret key
let stripe: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('Stripe secret key is missing');
    }
    stripe = new Stripe(key, {
      apiVersion: '2023-10-16', // Use the latest API version
    });
  }
  return stripe;
}

export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
  currency?: string;
  metadata?: Record<string, string>;
  customer?: string;
  description?: string;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const stripe = getStripeInstance();
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'cad',
      metadata: params.metadata || {},
      description: params.description,
      customer: params.customer,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  const stripe = getStripeInstance();
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
