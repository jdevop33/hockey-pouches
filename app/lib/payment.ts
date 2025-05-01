// app/lib/payment.ts
import { db, sql } from '@/lib/db'; // Keep imports from stash
import { logger } from './logger'; // Keep logger import
import { v4 as uuidv4 } from 'uuid';
 // Specific import from upstream
 // Specific import from upstream
import { payments } from '@/lib/schema/payments'; // Need payments schema
 // Need users schema for tx query
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep wildcard for enums
import { eq, and } from 'drizzle-orm';
// Re-export enums from schema for easier use
export { paymentMethodEnum, paymentStatusEnum, orderStatusEnum } from '@/lib/schema';
// Types defined using schema enums (from stash)
type PaymentStatus = typeof schema.paymentStatusEnum.enumValues[number];
type PaymentMethod = typeof schema.paymentMethodEnum.enumValues[number];
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];
type TaskStatus = typeof schema.taskStatusEnum.enumValues[number];
type TaskCategory = typeof schema.taskCategoryEnum.enumValues[number];
type TaskRelatedEntity = typeof schema.taskRelatedEntityEnum.enumValues[number];
type TaskInsert = typeof schema.tasks.$inferInsert;
// Define result interface with correct status type (from stash)
export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    status: PaymentStatus; // Use the enum-derived type
    message: string;
    error?: unknown;
}
/**
 * Confirm a manual payment (e-transfer or Bitcoin).
 * (Logic from stash)
 */
export async function confirmManualPayment(
    orderId: string,
    transactionIdOrRef: string,
    adminUserId: string
): Promise<PaymentResult> {
    logger.info('Confirming manual payment', { orderId, transactionIdOrRef, adminUserId });
    try {
        const result = await db.transaction(async (tx) => {
            const payment = await tx.query.payments.findFirst({
                where: and(
                    eq(payments.orderId, orderId),
                    eq(payments.status, schema.paymentStatusEnum.PendingConfirmation)
                ),
                columns: { id: true, paymentMethod: true }
            });
            if (!payment) {
                logger.warn('Payment record not found or not pending confirmation', { orderId, transactionIdOrRef });
                throw new Error('Payment record not found or not awaiting confirmation.');
            }
            const updatedPayment = await tx.update(payments)
                .set({
                    status: schema.paymentStatusEnum.Completed,
                    updatedAt: new Date(),
                    transactionId: String(transactionIdOrRef),
                    notes: sql`COALESCE(${payments.notes}, '') || ${` Confirmed by admin ${adminUserId} on `} || NOW()`
                })
                .where(eq(payments.id, payment.id))
                .returning({ id: payments.id, paymentMethod: payments.paymentMethod });
             if (updatedPayment.length === 0) {
                 throw new Error('Failed to update payment status.');
             }
            const nextOrderStatus: OrderStatus = schema.orderStatusEnum.Processing;
            await tx.update(orders)
                .set({ paymentStatus: schema.paymentStatusEnum.Completed, status: nextOrderStatus, updatedAt: new Date() })
                .where(eq(orders.id, orderId));
            logger.info('Order status updated after manual payment confirmation', { orderId, newStatus: nextOrderStatus });
            const verificationTaskUpdate = await tx.update(tasks)
                 .set({
                     status: schema.taskStatusEnum.Completed,
                     updatedAt: new Date(),
                     notes: sql`COALESCE(${tasks.notes}, '') || ${` Payment confirmed by admin ${adminUserId} on `} || NOW()`
                 })
                 .where(and(
                    eq(tasks.relatedTo, schema.taskRelatedEntityEnum.Order),
                    eq(tasks.relatedId, orderId),
                    eq(tasks.category, schema.taskCategoryEnum.PaymentReview),
                    eq(tasks.status, schema.taskStatusEnum.Pending)
                 ));
            logger.info('Closed payment verification task(s)', { orderId, count: verificationTaskUpdate.rowCount });
            return {
                success: true,
                transactionId: String(transactionIdOrRef),
                status: schema.paymentStatusEnum.Completed,
                message: `${payment.paymentMethod} payment confirmed successfully`
            };
        });
        return result;
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Manual payment confirmation failed:', { orderId, transactionIdOrRef, error });
        return {
            success: false,
            status: schema.paymentStatusEnum.Failed,
            message: error instanceof Error ? errorMessage : 'Failed to confirm payment due to internal error',
            error
        };
    }
}
// --- Other Dummy Functions --- (Keep as is)
async function processETransferPayment(orderId: string, amount: number, userId: string): Promise<PaymentResult> {
    logger.info('Processing E-Transfer Payment (Dummy)', { orderId, amount, userId });
    return {
        success: true,
        transactionId: String(`et-${uuidv4()}`),
        status: schema.paymentStatusEnum.Pending,
        message: 'E-transfer instructions pending.'
    };
}
async function processBitcoinPayment(orderId: string, amount: number, userId: string): Promise<PaymentResult> {
    logger.info('Processing Bitcoin Payment (Dummy)', { orderId, amount, userId });
    return {
        success: true,
        transactionId: String(`btc-${uuidv4()}`),
        status: schema.paymentStatusEnum.Pending,
        message: 'Bitcoin payment instructions pending.'
    };
}
