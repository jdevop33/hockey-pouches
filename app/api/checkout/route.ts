import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db'; // Corrected import
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { users } from '@/lib/schema/users';
import { products } from '@/lib/schema/products';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { cart } from '@/lib/schema/cart';
import { users } from '@/lib/schema/users';
import { products } from '@/lib/schema/products';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { cart } from '@/lib/schema/cart';
import { users } from '@/lib/schema/users';
import { products } from '@/lib/schema/products';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { cart } from '@/lib/schema/cart';
import { users } from '@/lib/schema/users';
import { products } from '@/lib/schema/products';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { cart } from '@/lib/schema/cart';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import schema namespace
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// Define types based on schema enums
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];
type PaymentStatus = typeof schema.paymentStatusEnum.enumValues[number];
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];

// Define Address interface (assuming basic structure)
// TODO: Verify if a more specific definition exists elsewhere
interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  name?: string; // Optional name
  phone?: string; // Optional phone
}

interface CheckoutBody {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod; // Use enum type
  referralCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    if (!userId) {
        // This case should theoretically not happen if verifyAuth passes
        return NextResponse.json({ message: 'User ID not found in token' }, { status: 401 });
    }

    // Parse request body
    const body: CheckoutBody = await request.json();
    const { shippingAddress, billingAddress, paymentMethod, referralCode } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        {
          message: 'Shipping address and payment method are required',
        },
        { status: 400 }
      );
    }
    // Validate payment method against enum
    if (!schema.paymentMethodEnum.enumValues.includes(paymentMethod)) {
      return NextResponse.json({ message: `Invalid payment method: ${paymentMethod}` }, { status: 400 });
    }

    console.log(`POST /api/checkout - User: ${userId}, Payment Method: ${paymentMethod}`);

    // Get cart items
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

    // Calculate order totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 10.0; // Fixed shipping cost for now
    const taxRate = 0.13; // 13% tax rate for Canada
    const taxes = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxes;

    // Create order
    const orderId = uuidv4();
    // Set initial statuses based on enums
    const initialOrderStatus: OrderStatus = 'PendingPayment';
    const initialPaymentStatus: PaymentStatus = 'Pending'; 

    await sql`
      INSERT INTO orders (
        id, user_id, status, subtotal, shipping_cost, taxes, total_amount,
        shipping_address, billing_address, payment_method, payment_status,
        referral_code, created_at, updated_at
      )
      VALUES (
        ${orderId}, ${userId}, ${initialOrderStatus}, ${subtotal}, ${shippingCost}, ${taxes}, ${totalAmount},
        ${JSON.stringify(shippingAddress)}, ${billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress)},
        ${paymentMethod}, ${initialPaymentStatus}, ${referralCode || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `;

    // Create order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
        VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.price})
      `;
    }

    // Add order history entry
    await sql`
      INSERT INTO order_history (order_id, status, user_id, notes, timestamp)
      VALUES (
        ${orderId},
        ${initialOrderStatus},
        ${userId},
        ${'Order created'},
        CURRENT_TIMESTAMP
      )
    `;

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;

    // Create task for admin to approve order (Consider if needed for all orders)
    // If payment is processed immediately, maybe only create task if payment pending?
    // Let's keep it for now for consistency.
    await sql`
      INSERT INTO tasks (
        title, category, status, priority, assigned_user_id,
        related_entity_type, related_entity_id, due_date, created_at
      )
      VALUES (
        ${`Review Order ${orderId}`}, -- Changed title slightly
        ${'OrderReview'}, -- Using enum value
        ${'Pending'}, -- Using enum value
        ${'High'}, -- Using enum value
        (SELECT id FROM users WHERE role = 'Admin' LIMIT 1),
        ${'Order'},
        ${orderId},
        (CURRENT_DATE + INTERVAL '1 day'),
        CURRENT_TIMESTAMP
      )
    `;
    console.log(`Created task 'Review Order ${orderId}'`);

    // Process payment based on payment method
    let paymentResult = { success: false, message: '', transactionId: '' };

    switch (paymentMethod) {
      case 'CreditCard': // Match enum value
        // In a real implementation, this would call a payment gateway API
        console.log(`Processing credit card payment for order ${orderId}`);
        paymentResult = {
          success: true,
          message: 'Payment processed successfully',
          transactionId: `cc-${uuidv4()}`,
        };
        break;

      case 'ETransfer': // Match enum value
        console.log(`Creating pending e-transfer payment for order ${orderId}`);
        paymentResult = {
          success: true,
          message: 'E-transfer instructions sent',
          transactionId: `et-${uuidv4()}`,
        };
        // Create task for admin to confirm e-transfer
        await sql`
          INSERT INTO tasks (title, category, status, priority, assigned_user_id, related_entity_type, related_entity_id, due_date, created_at)
          VALUES (${`Confirm E-Transfer for Order ${orderId}`}, ${'Payment'}, ${'Pending'}, ${'Medium'}, (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), ${'Order'}, ${orderId}, (CURRENT_DATE + INTERVAL '3 days'), CURRENT_TIMESTAMP)
        `;
        break;

      case 'Bitcoin': // Match enum value
        console.log(`Creating pending bitcoin payment for order ${orderId}`);
        paymentResult = {
          success: true,
          message: 'Bitcoin payment instructions sent',
          transactionId: `btc-${uuidv4()}`,
        };
        // Create task for admin to confirm bitcoin payment
        await sql`
          INSERT INTO tasks (title, category, status, priority, assigned_user_id, related_entity_type, related_entity_id, due_date, created_at)
          VALUES (${`Confirm Bitcoin Payment for Order ${orderId}`}, ${'Payment'}, ${'Pending'}, ${'Medium'}, (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), ${'Order'}, ${orderId}, (CURRENT_DATE + INTERVAL '3 days'), CURRENT_TIMESTAMP)
        `;
        break;

      case 'Manual': // Match enum value
        console.log(`Creating manual payment task for order ${orderId}`);
        paymentResult = { success: true, message: 'Manual payment noted', transactionId: `man-${uuidv4()}` };
         // Create task for admin to process manual payment
        await sql`
          INSERT INTO tasks (title, category, status, priority, assigned_user_id, related_entity_type, related_entity_id, due_date, created_at)
          VALUES (${`Process Manual Payment for Order ${orderId}`}, ${'Payment'}, ${'Pending'}, ${'High'}, (SELECT id FROM users WHERE role = 'Admin' LIMIT 1), ${'Order'}, ${orderId}, (CURRENT_DATE + INTERVAL '1 day'), CURRENT_TIMESTAMP)
        `;
        break;

      default:
        // This should not happen due to earlier validation
        console.error(`Unsupported payment method reached switch: ${paymentMethod}`);
        paymentResult = { success: false, message: 'Unsupported payment method', transactionId: '' };
    }

    // Update order with payment result
    if (paymentResult.success) {
      // Determine payment status based on method
      const finalPaymentStatus: PaymentStatus = paymentMethod === 'CreditCard' ? 'Completed' : 'Pending';
      const finalOrderStatus: OrderStatus = paymentMethod === 'CreditCard' ? 'Processing' : 'PendingPayment'; // Update order status too
      await sql`
        UPDATE orders
        SET payment_status = ${finalPaymentStatus}, 
            status = ${finalOrderStatus}, 
            payment_transaction_id = ${paymentResult.transactionId}
        WHERE id = ${orderId}
      `;
       // Log the status change
        await sql`
          INSERT INTO order_history (order_id, status, payment_status, user_id, notes, timestamp)
          VALUES (${orderId}, ${finalOrderStatus}, ${finalPaymentStatus}, ${userId}, ${'Payment initiated'}, CURRENT_TIMESTAMP)
        `;
    } else {
        // Handle payment failure (though current logic always sets success=true for non-CC)
        await sql`
            UPDATE orders SET payment_status = 'Failed', status = 'PendingPayment' WHERE id = ${orderId}
        `;
        await sql`
          INSERT INTO order_history (order_id, status, payment_status, user_id, notes, timestamp)
          VALUES (${orderId}, 'PendingPayment', 'Failed', ${userId}, ${'Payment processing failed: ' + paymentResult.message}, CURRENT_TIMESTAMP)
        `;
    }

    return NextResponse.json(
      {
        message: 'Order created successfully',
        orderId,
        status: initialOrderStatus,
        total: totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to process checkout:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
