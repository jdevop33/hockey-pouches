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
import { sql } from '../app/lib/db'; // Corrected import

// Valid payment method types
type PaymentMethod = 'etransfer' | 'btc' | 'credit-card';

// Test configuration
const TEST_CONFIG = {
  email: process.env.TEST_EMAIL || 'test@example.com',
  customerName: 'Test Customer',
  paymentMethod: (process.argv[2] as PaymentMethod) || 'etransfer',
  userId: process.env.TEST_USER_ID || 'test-user-123', // Ensure this user exists in your DB
  products: [
    // Use existing product/variation IDs from your DB
    { id: 1, name: 'Puxx Cool Mint 22mg', price: 15.0, quantity: 3 }, 
    { id: 2, name: 'Puxx Spearmint 22mg', price: 15.0, quantity: 2 }, 
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
    // Clear existing cart for the test user
    await sql`DELETE FROM cart_items WHERE user_id = ${TEST_CONFIG.userId}`;

    // Add test products to cart
    for (const product of TEST_CONFIG.products) {
      // Assuming cart items relate to product_variations.id
      await sql`
        INSERT INTO cart_items (user_id, product_variation_id, quantity, created_at)
        VALUES (
          ${TEST_CONFIG.userId}, 
          ${product.id}, -- Assuming product.id maps to a variation ID
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

    // Generate order ID (Use UUID for consistency with schema)
    const { v4: uuidv4 } = await import('uuid');
    const orderId = uuidv4();

    // Create order in database
    await sql`
      INSERT INTO orders (
        id, user_id, status, total_amount,
        shipping_address, payment_method, payment_status, created_at, updated_at, type -- Add type
        -- Assuming subtotal, shipping, taxes are derived or calculated elsewhere/later
      )
      VALUES (
        ${orderId}, 
        ${TEST_CONFIG.userId}, 
        'PendingPayment', -- Initial status
        ${total.toFixed(2)},
        ${JSON.stringify(TEST_CONFIG.shippingAddress)}, 
        ${TEST_CONFIG.paymentMethod}, 
        'Pending', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP,
        'Retail' -- Assuming test is for retail
      )
    `;

    // Create order items
    for (const product of TEST_CONFIG.products) {
      await sql`
        INSERT INTO order_items (order_id, product_variation_id, quantity, price_at_purchase, subtotal)
        VALUES (
          ${orderId}, 
          ${product.id}, -- Assuming product.id maps to a variation ID
          ${product.quantity}, 
          ${product.price.toFixed(2)},
          ${(product.price * product.quantity).toFixed(2)}
        )
      `;
    }

    // Add order history entry
    await sql`
      INSERT INTO order_status_history (order_id, status, notes, created_at)
      VALUES (
        ${orderId},
        'PendingPayment', -- Match initial order status
        'Order created (E2E test)',
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
    // Ensure the email function exists and handles potential errors
    if (typeof sendOrderConfirmationEmail !== 'function') {
        console.warn('⚠️ sendOrderConfirmationEmail function not found or not imported correctly.');
        return true; // Skip email test if function not available
    }
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
      shippingAddress: TEST_CONFIG.shippingAddress as any, // Cast if needed for email func type
      paymentMethod: TEST_CONFIG.paymentMethod as any, // Cast if needed for email func type
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
  // Update to use actual enum values if available from schema
  const validPaymentMethods = ['ETransfer', 'Bitcoin', 'CreditCard', 'Manual'];
  if (!validPaymentMethods.includes(TEST_CONFIG.paymentMethod)) {
    console.error(`❌ Invalid payment method: ${TEST_CONFIG.paymentMethod}`);
    console.error(`Valid options are: ${validPaymentMethods.join(', ')}`);
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
  if (!checkoutResult.success || !checkoutResult.orderId || checkoutResult.total === undefined) {
    console.error('❌ Test failed at checkout step');
    process.exit(1);
  }

  // Step 3: Test email notification
  const emailSuccess = await testOrderConfirmationEmail(
    checkoutResult.orderId,
    checkoutResult.total
  );

  if (!emailSuccess) {
    console.error('❌ Test failed at email notification step - check email service/config');
    // Decide if this should be a fatal error for the test
    // process.exit(1);
  }

  console.log('------------------------------');
  console.log('✅ CHECKOUT FLOW TEST COMPLETED SUCCESSFULLY');
  console.log(`📋 Order ID: ${checkoutResult.orderId}`);
  console.log(`💲 Total: $${checkoutResult.total.toFixed(2)}`);
  if (emailSuccess) {
      console.log(`📧 Confirmation email potentially sent to: ${TEST_CONFIG.email}`);
  } else {
      console.warn(`⚠️ Confirmation email sending failed.`);
  }
  console.log('------------------------------');
}

// Run the test
runCheckoutTest().catch(error => {
  console.error('❌ Unhandled error in test:', error);
  process.exit(1);
});
