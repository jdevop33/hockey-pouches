/**
 * Comprehensive E2E test for checkout flow and email notifications
 *
 * This script tests the complete checkout process including:
 * - Adding items to cart
 * - Proceeding through checkout
 * - Testing different payment methods
 * - Verifying email notifications
 *
 * Usage:
 * 1. Run with npm run test:checkout
 * 2. Optionally specify payment method: npm run test:checkout -- etransfer|btc|credit-card
 */

import { sendOrderConfirmationEmail } from '../app/lib/email';
import sql from '../app/lib/db';

// Valid payment method types
type PaymentMethod = 'etransfer' | 'btc' | 'credit-card';

// Test configuration
const TEST_CONFIG = {
  email: process.env.TEST_EMAIL || 'test@example.com',
  customerName: 'Test Customer',
  paymentMethod: (process.argv[2] as PaymentMethod) || 'etransfer',
  userId: process.env.TEST_USER_ID || 'test-user-123',
  products: [
    { id: 'product-1', name: 'Hockey Pouches - Super Strong', price: 15.0, quantity: 3 },
    { id: 'product-2', name: 'Hockey Pouches - Medium Strength', price: 15.0, quantity: 2 },
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
};

// Define checkout result interface
interface CheckoutResult {
  success: boolean;
  orderId?: string;
  total?: number;
}

/**
 * Simulates adding products to the cart
 */
async function addToCart() {
  console.log('🛒 Adding products to cart...');
  try {
    // Clear existing cart
    await sql`DELETE FROM cart_items WHERE user_id = ${TEST_CONFIG.userId}`;

    // Add test products to cart
    for (const product of TEST_CONFIG.products) {
      await sql`
        INSERT INTO cart_items (user_id, product_id, quantity, created_at)
        VALUES (
          ${TEST_CONFIG.userId}, 
          ${product.id}, 
          ${product.quantity}, 
          CURRENT_TIMESTAMP
        )
      `;
    }

    console.log('✅ Products added to cart successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to add products to cart:', error);
    return false;
  }
}

/**
 * Simulates checkout process
 */
async function processCheckout(): Promise<CheckoutResult> {
  console.log(`🔄 Processing checkout with ${TEST_CONFIG.paymentMethod} payment method...`);

  try {
    // Calculate order totals
    const subtotal = TEST_CONFIG.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = 10.0;
    const tax = subtotal * 0.13; // 13% tax rate
    const total = subtotal + shipping + tax;

    // Generate order ID
    const orderId = `TEST-${Date.now().toString().slice(-6)}`;

    // Create order in database
    await sql`
      INSERT INTO orders (
        id, user_id, status, subtotal, shipping_cost, taxes, total_amount,
        shipping_address, payment_method, payment_status, created_at, updated_at
      )
      VALUES (
        ${orderId}, 
        ${TEST_CONFIG.userId}, 
        ${'Pending Approval'}, 
        ${subtotal}, 
        ${shipping}, 
        ${tax}, 
        ${total},
        ${JSON.stringify(TEST_CONFIG.shippingAddress)}, 
        ${TEST_CONFIG.paymentMethod}, 
        ${'Pending'}, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
    `;

    // Create order items
    for (const product of TEST_CONFIG.products) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
        VALUES (
          ${orderId}, 
          ${product.id}, 
          ${product.quantity}, 
          ${product.price}
        )
      `;
    }

    // Add order history entry
    await sql`
      INSERT INTO order_history (order_id, status, user_id, notes, timestamp)
      VALUES (
        ${orderId},
        ${'Pending Approval'},
        ${TEST_CONFIG.userId},
        ${'Order created (test)'},
        CURRENT_TIMESTAMP
      )
    `;

    console.log(`✅ Order created successfully: ${orderId}`);
    return { success: true, orderId, total };
  } catch (error) {
    console.error('❌ Failed to process checkout:', error);
    return { success: false };
  }
}

/**
 * Tests the order confirmation email
 */
async function testOrderConfirmationEmail(orderId: string, total: number) {
  console.log('📧 Testing order confirmation email...');

  try {
    const result = await sendOrderConfirmationEmail({
      customerEmail: TEST_CONFIG.email,
      customerName: TEST_CONFIG.customerName,
      orderId,
      orderTotal: total,
      orderItems: TEST_CONFIG.products.map(p => ({
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
      shippingAddress: TEST_CONFIG.shippingAddress,
      paymentMethod: TEST_CONFIG.paymentMethod as PaymentMethod,
    });

    console.log('✅ Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

/**
 * Main test function
 */
async function runCheckoutTest() {
  console.log('🧪 STARTING CHECKOUT FLOW TEST');
  console.log('------------------------------');
  console.log(`🔹 Payment method: ${TEST_CONFIG.paymentMethod}`);
  console.log(`🔹 Test email: ${TEST_CONFIG.email}`);
  console.log('------------------------------');

  // Validate payment method
  if (!['etransfer', 'btc', 'credit-card'].includes(TEST_CONFIG.paymentMethod)) {
    console.error(`❌ Invalid payment method: ${TEST_CONFIG.paymentMethod}`);
    console.error('Valid options are: etransfer, btc, credit-card');
    process.exit(1);
  }

  // Step 1: Add to cart
  const cartSuccess = await addToCart();
  if (!cartSuccess) {
    console.error('❌ Test failed at cart step');
    process.exit(1);
  }

  // Step 2: Process checkout
  const checkoutResult = await processCheckout();
  if (!checkoutResult.success || !checkoutResult.orderId || !checkoutResult.total) {
    console.error('❌ Test failed at checkout step');
    process.exit(1);
  }

  // Step 3: Test email notification
  const emailSuccess = await testOrderConfirmationEmail(
    checkoutResult.orderId,
    checkoutResult.total
  );

  if (!emailSuccess) {
    console.error('❌ Test failed at email notification step');
    process.exit(1);
  }

  console.log('------------------------------');
  console.log('✅ CHECKOUT FLOW TEST COMPLETED SUCCESSFULLY');
  console.log(`📋 Order ID: ${checkoutResult.orderId}`);
  console.log(`💲 Total: $${checkoutResult.total.toFixed(2)}`);
  console.log(`📧 Confirmation email sent to: ${TEST_CONFIG.email}`);
  console.log('------------------------------');
}

// Run the test
runCheckoutTest().catch(error => {
  console.error('❌ Unhandled error in test:', error);
  process.exit(1);
});
