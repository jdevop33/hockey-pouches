/**
 * Test script for order confirmation emails
 *
 * Usage:
 * 1. Run with npm run test:emails
 * 2. Optionally specify payment method: npm run test:emails -- etransfer
 */

import { sendOrderConfirmationEmail } from '../app/lib/email';

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

async function testOrderEmails() {
  const paymentMethod = process.argv[2] || 'etransfer';
  if (!['etransfer', 'btc', 'credit-card'].includes(paymentMethod)) {
    console.error(`Invalid payment method: ${paymentMethod}`);
    console.error('Valid options are: etransfer, btc, credit-card');
    process.exit(1);
  }

  console.log(`Testing order confirmation email with payment method: ${paymentMethod}`);

  try {
    const result = await sendOrderConfirmationEmail({
      customerEmail: TEST_EMAIL,
      customerName: 'Test Customer',
      orderId: '1001-TEST',
      orderTotal: 149.95,
      orderItems: [
        { name: 'Hockey Pouches - Super Strong', price: 14.99, quantity: 5 },
        { name: 'Hockey Pouches - Medium Strength', price: 14.99, quantity: 5 },
      ],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'Customer',
        address1: '123 Test Street',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        country: 'Canada',
      },
      paymentMethod: paymentMethod as 'etransfer' | 'btc' | 'credit-card',
    });

    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testOrderEmails();
