// app/lib/payment.ts
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema/tasks';
import { orders } from '@/lib/schema/orders';
import { tasks } from '@/lib/schema/tasks';
import { orders } from '@/lib/schema/orders';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Use central schema index
import { eq, and, sql } from 'drizzle-orm';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

// Re-export enums from schema
export { paymentMethodEnum, paymentStatusEnum, orderStatusEnum } from '@/lib/schema';

// Types
type PaymentStatus = typeof schema.paymentStatusEnum.enumValues[number];
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];
type TaskStatus = typeof schema.taskStatusEnum.enumValues[number];
type TaskCategory = typeof schema.taskCategoryEnum.enumValues[number];
type TaskRelatedEntity = typeof schema.taskRelatedEntityEnum.enumValues[number];

type PaymentInsert = typeof schema.payments.$inferInsert;
type TaskInsert = typeof schema.tasks.$inferInsert;

export interface PaymentResult {
    success: boolean; transactionId?: string; status: PaymentStatus;
    message: string; error?: any;
}

/**
 * Confirm a manual payment (e-transfer or Bitcoin).
 */
export async function confirmManualPayment(
    orderId: string, transactionIdOrRef: string, adminUserId: string
): Promise<PaymentResult> {
    logger.info('Confirming manual payment', { orderId, transactionIdOrRef, adminUserId });
    try {
        const result = await db.transaction(async (tx) => {
            // Check for Pending status, not Awaiting Confirmation
            const payment = await tx.query.payments.findFirst({ 
                where: and(
                    eq(schema.payments.orderId, orderId), 
                    eq(schema.payments.transactionId, transactionIdOrRef),
                    eq(schema.payments.status, 'Pending') // Corrected status check
                )
            });
            if (!payment) throw new Error('Payment record not found, not pending confirmation, or reference mismatch.');

            const updatedPayment = await tx.update(schema.payments).set({
                    status: 'Completed', 
                    updatedAt: new Date(),
                    // Embed adminUserId directly, remove .val
                    notes: sql`COALESCE(${schema.payments.notes}, '') || ' Confirmed by admin ${adminUserId} on ' || NOW()` 
                }).where(eq(schema.payments.id, payment.id)).returning({ id: schema.payments.id, paymentMethod: schema.payments.paymentMethod });
             if (updatedPayment.length === 0) throw new Error('Failed to update payment status.');

            const nextOrderStatus: OrderStatus = 'Processing';
            await tx.update(schema.orders).set({ paymentStatus: 'Completed', status: nextOrderStatus, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));

            const processingTask: TaskInsert = {
                title: 'Process paid order',
                description: `${updatedPayment[0].paymentMethod} payment confirmed. Process order #${orderId} for shipping.`,
                status: 'Pending',
                priority: 'High',
                category: 'OrderReview', // Corrected category
                relatedTo: 'Order',
                relatedId: orderId,
            };
            await tx.insert(schema.tasks).values(processingTask);

            // Update the payment confirmation task
            const verificationTaskUpdate = await tx.update(schema.tasks).set({
                     status: 'Completed',
                     updatedAt: new Date(),
                     // Embed adminUserId directly, remove .val
                     notes: sql`COALESCE(${schema.tasks.notes}, '') || ' Payment confirmed by admin ${adminUserId} on ' || NOW()` 
                 }).where(and( 
                    eq(schema.tasks.relatedTo, 'Order'), 
                    eq(schema.tasks.relatedId, orderId),
                    eq(schema.tasks.category, 'Payment'), // Use correct category enum
                    eq(schema.tasks.status, 'Pending') // Use correct status enum
                 ));
            logger.info('Closed payment verification task(s)', { orderId, count: verificationTaskUpdate.rowCount });

            return { success: true, transactionId: transactionIdOrRef, status: 'Completed', message: `${updatedPayment[0].paymentMethod} payment confirmed successfully` };
        });
        return result;
    } catch (error) {
        logger.error('Manual payment confirmation failed:', { orderId, transactionIdOrRef, error });
        return { success: false, status: 'Failed', message: error instanceof Error ? error.message : 'Failed to confirm payment due to internal error', error };
    }
}

// Dummy implementations using Drizzle - Added basic return values
async function processETransferPayment(orderId: string, amount: number, userId: string): Promise<PaymentResult> { 
    logger.info('Processing E-Transfer Payment (Dummy)', { orderId, amount, userId });
    // TODO: Implement actual e-transfer logic (e.g., create pending payment record, instructions)
    return { 
        success: true, // Assume success for now, triggers task creation
        transactionId: `et-${uuidv4()}`,
        status: 'Pending', 
        message: 'E-transfer instructions pending.'
    };
}
async function processBitcoinPayment(orderId: string, amount: number, userId: string): Promise<PaymentResult> { 
    logger.info('Processing Bitcoin Payment (Dummy)', { orderId, amount, userId });
    // TODO: Implement actual Bitcoin logic (e.g., generate address, create pending payment record)
    return { 
        success: true, // Assume success for now, triggers task creation
        transactionId: `btc-${uuidv4()}`,
        status: 'Pending',
        message: 'Bitcoin payment instructions pending.'
    };
}

// NOTE: Ellipses (...) indicate unchanged dummy function implementations
