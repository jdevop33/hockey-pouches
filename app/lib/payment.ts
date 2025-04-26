// app/lib/payment.ts
import sql from '@/lib/db';
import { getRows } from '@/lib/db-types';

// Payment status types
export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'Awaiting Confirmation';

// Payment method types
export type PaymentMethod = 'credit-card' | 'etransfer' | 'btc';

// Payment processing result
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  message: string;
  error?: any;
}

/**
 * Process a payment based on the payment method
 * @param orderId The order ID
 * @param amount The payment amount
 * @param paymentMethod The payment method
 * @param userId The user ID
 * @returns PaymentResult with status and transaction ID
 */
export async function processPayment(
  orderId: number,
  amount: number,
  paymentMethod: PaymentMethod,
  userId: string
): Promise<PaymentResult> {
  console.log(`Processing payment for order ${orderId} with method ${paymentMethod}`);

  try {
    // Different handling based on payment method
    switch (paymentMethod) {
      case 'credit-card':
        return await processCreditCardPayment(orderId, amount, userId);

      case 'etransfer':
        return await processETransferPayment(orderId, amount, userId);

      case 'btc':
        return await processBitcoinPayment(orderId, amount, userId);

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error(`Payment processing error for order ${orderId}:`, error);
    return {
      success: false,
      status: 'Failed',
      message: error instanceof Error ? error.message : 'Unknown payment error',
      error,
    };
  }
}

/**
 * Process a credit card payment
 * In a real implementation, this would integrate with a payment gateway
 */
async function processCreditCardPayment(
  orderId: number,
  amount: number,
  userId: string
): Promise<PaymentResult> {
  try {
    // In a real implementation, this would call a payment gateway API
    // For now, we'll simulate a successful payment

    // Generate a fake transaction ID
    const transactionId = `cc_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    // Record the payment in the database
    await sql`
      INSERT INTO payments (
        order_id, 
        user_id, 
        amount, 
        payment_method, 
        transaction_id, 
        status
      ) VALUES (
        ${orderId}, 
        ${userId}, 
        ${amount}, 
        'credit-card', 
        ${transactionId}, 
        'Completed'
      )
    `;

    // Update the order payment status
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

    return {
      success: true,
      transactionId,
      status: 'Completed',
      message: 'Credit card payment processed successfully',
    };
  } catch (error) {
    console.error(`Credit card payment failed for order ${orderId}:`, error);
    return {
      success: false,
      status: 'Failed',
      message: 'Credit card payment processing failed',
      error,
    };
  }
}

/**
 * Process an e-transfer payment
 * This creates a pending payment that requires manual confirmation
 */
async function processETransferPayment(
  orderId: number,
  amount: number,
  userId: string
): Promise<PaymentResult> {
  try {
    // Generate a reference number for the e-transfer
    const referenceNumber = `ET${orderId}-${Math.floor(Math.random() * 10000)}`;

    // Record the pending payment in the database
    await sql`
      INSERT INTO payments (
        order_id, 
        user_id, 
        amount, 
        payment_method, 
        transaction_id, 
        status
      ) VALUES (
        ${orderId}, 
        ${userId}, 
        ${amount}, 
        'etransfer', 
        ${referenceNumber}, 
        'Awaiting Confirmation'
      )
    `;

    // Create a task for payment verification
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
        'Verify e-transfer payment', 
        'Check for e-transfer payment with reference ${referenceNumber} for order #${orderId}.', 
        'Pending', 
        'High', 
        'Payment', 
        'Order', 
        ${orderId}
      )
    `;

    return {
      success: true,
      transactionId: referenceNumber,
      status: 'Awaiting Confirmation',
      message:
        'E-transfer payment instructions created. Please send payment with the provided reference number.',
    };
  } catch (error) {
    console.error(`E-transfer setup failed for order ${orderId}:`, error);
    return {
      success: false,
      status: 'Failed',
      message: 'Failed to set up e-transfer payment',
      error,
    };
  }
}

/**
 * Process a Bitcoin payment
 * This creates a pending payment that requires manual confirmation
 */
async function processBitcoinPayment(
  orderId: number,
  amount: number,
  userId: string
): Promise<PaymentResult> {
  try {
    // Generate a Bitcoin address (in a real implementation, this would come from a BTC payment processor)
    const btcAddress = `bc1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // Record the pending payment in the database
    await sql`
      INSERT INTO payments (
        order_id, 
        user_id, 
        amount, 
        payment_method, 
        transaction_id, 
        status
      ) VALUES (
        ${orderId}, 
        ${userId}, 
        ${amount}, 
        'btc', 
        ${btcAddress}, 
        'Awaiting Confirmation'
      )
    `;

    // Create a task for payment verification
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
        'Verify Bitcoin payment', 
        'Check for Bitcoin payment to address ${btcAddress} for order #${orderId}.', 
        'Pending', 
        'High', 
        'Payment', 
        'Order', 
        ${orderId}
      )
    `;

    return {
      success: true,
      transactionId: btcAddress,
      status: 'Awaiting Confirmation',
      message: 'Bitcoin payment address created. Please send payment to the provided address.',
    };
  } catch (error) {
    console.error(`Bitcoin payment setup failed for order ${orderId}:`, error);
    return {
      success: false,
      status: 'Failed',
      message: 'Failed to set up Bitcoin payment',
      error,
    };
  }
}

/**
 * Confirm a manual payment (e-transfer or Bitcoin)
 * @param orderId The order ID
 * @param transactionId The transaction ID or reference number
 * @param adminUserId The admin user ID confirming the payment
 * @returns PaymentResult with status
 */
export async function confirmManualPayment(
  orderId: number,
  transactionId: string,
  adminUserId: string
): Promise<PaymentResult> {
  try {
    // Verify the payment exists and is awaiting confirmation
    const paymentResult = await sql`
      SELECT * FROM payments 
      WHERE order_id = ${orderId} 
      AND transaction_id = ${transactionId} 
      AND status = 'Awaiting Confirmation'
    `;

    const paymentRows = getRows(paymentResult);
    if (paymentRows.length === 0) {
      return {
        success: false,
        status: 'Failed',
        message: 'Payment not found or already processed',
      };
    }

    const payment = paymentRows[0];

    // Update the payment status
    await sql`
      UPDATE payments 
      SET status = 'Completed', 
          updated_at = CURRENT_TIMESTAMP, 
          notes = CONCAT(COALESCE(notes, ''), ' Confirmed by admin ${adminUserId} on ', CURRENT_TIMESTAMP)
      WHERE order_id = ${orderId} 
      AND transaction_id = ${transactionId}
    `;

    // Update the order payment status
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
        '${payment.payment_method} payment confirmed. Process order for shipping.', 
        'Pending', 
        'High', 
        'Order', 
        'Order', 
        ${orderId}
      )
    `;

    // Close the payment verification task
    await sql`
      UPDATE tasks 
      SET status = 'Completed', 
          updated_at = CURRENT_TIMESTAMP, 
          notes = CONCAT(COALESCE(notes, ''), ' Payment confirmed by admin ${adminUserId} on ', CURRENT_TIMESTAMP)
      WHERE related_to = 'Order' 
      AND related_id = ${orderId} 
      AND category = 'Payment' 
      AND status = 'Pending'
    `;

    return {
      success: true,
      transactionId,
      status: 'Completed',
      message: `${payment.payment_method} payment confirmed successfully`,
    };
  } catch (error) {
    console.error(`Manual payment confirmation failed for order ${orderId}:`, error);
    return {
      success: false,
      status: 'Failed',
      message: 'Failed to confirm payment',
      error,
    };
  }
}
