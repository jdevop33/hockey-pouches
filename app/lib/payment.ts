// app/lib/payment.ts
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, sql } from 'drizzle-orm';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

// Re-export enums from schema for consistency
export { paymentMethodEnum, paymentStatusEnum } from '@/lib/schema';

// Types
type PaymentStatus = typeof schema.paymentStatusEnum.enumValues[number];
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];
type PaymentInsert = typeof schema.payments.$inferInsert;
type TaskInsert = typeof schema.tasks.$inferInsert;

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    status: PaymentStatus;
    message: string;
    error?: any;
}

/**
 * Confirm a manual payment (e-transfer or Bitcoin).
 */
export async function confirmManualPayment(
    orderId: string, // Assuming order ID is UUID
    transactionIdOrRef: string,
    adminUserId: string
): Promise<PaymentResult> {
    logger.info('Confirming manual payment', { orderId, transactionIdOrRef, adminUserId });
    try {
        const result = await db.transaction(async (tx) => {
            const payment = await tx.query.payments.findFirst({
                where: and(
                    eq(schema.payments.orderId, orderId),
                    eq(schema.payments.transactionId, transactionIdOrRef),
                    eq(schema.payments.status, 'Awaiting Confirmation')
                )
            });
            if (!payment) {
                throw new Error('Payment record not found, not awaiting confirmation, or reference mismatch.');
            }

            const updatedPayment = await tx.update(schema.payments).set({
                    status: 'Completed',
                    updatedAt: new Date(),
                    notes: sql`${schema.payments.notes} || ' Confirmed by admin ${sql.val(adminUserId)} on ' || NOW()`
                })
                .where(eq(schema.payments.id, payment.id))
                .returning({ id: schema.payments.id, paymentMethod: schema.payments.paymentMethod });
             if (updatedPayment.length === 0) throw new Error('Failed to update payment status.');

            const nextOrderStatus: schema.OrderStatus = 'Processing';
            await tx.update(schema.orders).set({ paymentStatus: 'Completed', status: nextOrderStatus, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));

            const processingTask: TaskInsert = {
                title: 'Process paid order',
                description: `${updatedPayment[0].paymentMethod} payment confirmed. Process order #${orderId} for shipping.`,
                status: 'Pending', priority: 'High', category: 'Order',
                relatedTo: 'Order', relatedId: orderId,
            };
            await tx.insert(schema.tasks).values(processingTask);

            const verificationTaskUpdate = await tx.update(schema.tasks).set({
                     status: 'Completed', updatedAt: new Date(),
                     notes: sql`${schema.tasks.notes} || ' Payment confirmed by admin ${sql.val(adminUserId)} on ' || NOW()`
                 })
                 .where(and(
                     eq(schema.tasks.relatedTo, 'Order'),
                     eq(schema.tasks.relatedId, orderId),
                     eq(schema.tasks.category, 'Payment'),
                     eq(schema.tasks.status, 'Pending')
                 ));
            logger.info('Closed payment verification task(s)', { orderId, count: verificationTaskUpdate.rowCount });

            return {
                success: true, transactionId: transactionIdOrRef, status: 'Completed' as PaymentStatus,
                message: `${updatedPayment[0].paymentMethod} payment confirmed successfully`,
            };
        });
        return result;
    } catch (error) {
        logger.error('Manual payment confirmation failed:', { orderId, transactionIdOrRef, error });
        return {
            success: false, status: 'Failed',
            message: error instanceof Error ? error.message : 'Failed to confirm payment due to internal error',
            error,
        };
    }
}

// Dummy implementations using Drizzle
async function processETransferPayment(orderId: string, amount: number, userId: string): Promise<PaymentResult> {
    logger.info('Processing E-Transfer Setup', { orderId, amount });
    const referenceNumber = `ET-${orderId.substring(0,8)}-${Math.floor(Math.random() * 10000)}`;
    try {
        await db.insert(schema.payments).values({
            orderId, userId, amount: amount.toFixed(2), paymentMethod: 'ETransfer',
            transactionId: referenceNumber, status: 'Awaiting Confirmation'
        });
         await db.insert(schema.tasks).values({
             title: 'Verify e-transfer payment',
             description: `Check for e-transfer payment with reference ${referenceNumber} for order #${orderId}.`,
             status: 'Pending', priority: 'High', category: 'Payment',
             relatedTo: 'Order', relatedId: orderId,
         });
        return { success: true, transactionId: referenceNumber, status: 'Awaiting Confirmation', message: 'E-transfer payment instructions created.' };
    } catch (error) {
        logger.error('E-transfer setup failed', { orderId, error });
        return { success: false, status: 'Failed', message: 'Failed to setup E-transfer', error };
    }
}

async function processBitcoinPayment(orderId: string, amount: number, userId: string): Promise<PaymentResult> {
     logger.info('Processing Bitcoin Setup', { orderId, amount });
    const btcAddress = `dummy_btc_${uuidv4()}`;
     try {
        await db.insert(schema.payments).values({
            orderId, userId, amount: amount.toFixed(2), paymentMethod: 'Bitcoin',
            transactionId: btcAddress, status: 'Awaiting Confirmation'
        });
          await db.insert(schema.tasks).values({
             title: 'Verify Bitcoin payment',
             description: `Check for Bitcoin payment to address ${btcAddress} for order #${orderId}.`,
             status: 'Pending', priority: 'High', category: 'Payment',
             relatedTo: 'Order', relatedId: orderId,
         });
        return { success: true, transactionId: btcAddress, status: 'Awaiting Confirmation', message: 'Bitcoin payment address created.' };
    } catch (error) {
        logger.error('Bitcoin setup failed', { orderId, error });
        return { success: false, status: 'Failed', message: 'Failed to setup Bitcoin', error };
    }
}
