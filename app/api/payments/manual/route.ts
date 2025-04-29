import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db'; // Corrected import, added db
import * as schema from '@/lib/schema'; // Import schema
import { eq, and } from 'drizzle-orm'; // Import operators
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger'; // Added logger

export const dynamic = 'force-dynamic';

// Define types based on schema enums
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];

interface ManualPaymentBody {
  orderId: string;
  paymentMethod: 'ETransfer' | 'Bitcoin'; // Use specific allowed values
}

/**
 * Handles initiation of manual payment methods (e-transfer, bitcoin)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    if (!userId) {
        logger.error('Manual Payment: User ID missing from auth token');
        return NextResponse.json({ message: 'Authentication error' }, { status: 401 });
    }

    const body: ManualPaymentBody = await request.json();
    const { orderId, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    if (!paymentMethod || (paymentMethod !== 'ETransfer' && paymentMethod !== 'Bitcoin')) {
      return NextResponse.json(
        { message: 'Valid payment method is required (ETransfer or Bitcoin)' },
        { status: 400 }
      );
    }

    logger.info('Initiating manual payment', { userId, orderId, paymentMethod });

    // Use Drizzle transaction for atomicity
    const result = await db.transaction(async (tx) => {
        // Get the order to verify it belongs to the user and is in a valid state
        const order = await tx.query.orders.findFirst({
            where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)),
            columns: { id: true, status: true, paymentStatus: true, totalAmount: true }
        });

        if (!order) {
            logger.warn('Manual Payment: Order not found or doesnt belong to user', { userId, orderId });
            // Throw error to rollback transaction and return 404
            throw { status: 404, message: 'Order not found or not owned by the current user' }; 
        }

        // Allow initiating manual payment only if payment is Pending
        if (order.paymentStatus !== 'Pending') {
             logger.warn('Manual Payment: Order payment status not Pending', { userId, orderId, status: order.paymentStatus });
             throw { status: 400, message: 'This order has already been processed for payment or is awaiting confirmation.' };
        }

        // Generate payment reference ID (using transactionId field in payments table)
        const paymentTransactionId = `${paymentMethod.substring(0, 3).toLowerCase()}-${uuidv4()}`;

        // Create a payment record
        await tx.insert(schema.payments).values({
            orderId: orderId,
            amount: order.totalAmount, // Use totalAmount from order
            paymentMethod: paymentMethod,
            status: 'Pending', // Payment itself is pending confirmation
            transactionId: paymentTransactionId,
            // referenceNumber: paymentReference, // Use transactionId for reference
            notes: `Manual ${paymentMethod} payment initiated by user.`,
        });

        // Update order status to reflect pending payment confirmation
        const updatedOrder = await tx.update(schema.orders)
            .set({ 
                paymentStatus: 'Pending', // Keep payment status pending overall
                status: 'PendingPayment', // Order moves to PendingPayment
                paymentMethod: paymentMethod, // Record the chosen method
                updatedAt: new Date()
            })
            .where(eq(schema.orders.id, orderId))
            .returning({ id: schema.orders.id });
            
        if (updatedOrder.length === 0) {
             throw new Error('Failed to update order status for manual payment.');
        }

        // Create task for admin to confirm payment
        const taskTitle = `Confirm ${paymentMethod} Payment for Order ${orderId}`;
        await tx.insert(schema.tasks).values({
            // id: uuidv4(), // Use default serial
            title: taskTitle,
            category: 'Payment', // Use enum value
            status: 'Pending',
            priority: 'High',
            // assigned_user_id: // Assign to admin group?
            relatedTo: 'Order',
            relatedId: orderId,
            // due_date: // Set due date?
        });

        // Add entry to order history
        await tx.insert(schema.orderStatusHistory).values({
            orderId: orderId,
            status: 'PendingPayment',
            paymentStatus: 'Pending', // Reflect order's payment status
            notes: `Manual ${paymentMethod} payment initiated. Ref: ${paymentTransactionId}. Awaiting confirmation.`,
            // changedByUserId: userId // Log user initiating
        });

        logger.info('Manual payment initiated successfully', { userId, orderId, paymentMethod, paymentTransactionId });

        // Return necessary info for frontend instructions
        return { paymentMethod, paymentTransactionId };
    }); // End transaction

    // Generate payment instructions based on payment method
    let paymentInstructions = '';
    if (result.paymentMethod === 'ETransfer') {
      paymentInstructions = `
        Please send your e-transfer to payments@nicotinetins.com with the reference code: ${result.paymentTransactionId}
        
        Important instructions:
        1. Use the exact reference code as your e-transfer message/memo.
        2. Ensure the amount matches your order total.
        3. You will receive a confirmation email once we've verified your payment.
      `;
    } else if (result.paymentMethod === 'Bitcoin') {
      // TODO: Get actual BTC address from config/env
      const btcAddress = process.env.BITCOIN_ADDRESS || 'YOUR_PLACEHOLDER_BTC_ADDRESS'; 
      paymentInstructions = `
        Please send the exact Bitcoin amount for your order total to the following address:
        ${btcAddress}
        
        Important instructions:
        1. Include the reference code ${result.paymentTransactionId} in the transaction memo/note if possible.
        2. Transaction fees are your responsibility. Ensure the received amount matches your order total.
        3. Email payments@nicotinetins.com with your reference code (${result.paymentTransactionId}) and the transaction ID/hash after sending.
        4. You will receive a confirmation email once we've verified your payment (this may take time due to blockchain confirmations).
      `;
    }

    return NextResponse.json({
      success: true,
      paymentMethod: result.paymentMethod,
      paymentReference: result.paymentTransactionId, // Return the generated ID as reference
      paymentInstructions,
      message: 'Payment initiated. Please follow the instructions provided.',
    });

  } catch (error: any) {
    logger.error('Error processing manual payment request:', { error });
    // Handle custom errors thrown from transaction
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
         return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Failed to process payment request' }, { status: 500 });
  }
}
