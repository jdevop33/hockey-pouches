import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, or, ilike, count, desc, asc, gte, lte, sum, sql as dSql, inArray, sql, ne } from 'drizzle-orm'; // Added ne
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

// Types
type CommissionInsert = typeof schema.commissions.$inferInsert;
type CommissionSelect = typeof schema.commissions.$inferSelect;
type CommissionStatus = typeof schema.commissionStatusEnum.enumValues[number];
type TaskInsert = typeof schema.tasks.$inferInsert;

type UserCommissionStats = {
    pendingAmount: number; approvedAmount: number; paidAmount: number;
    totalLifetimeAmount: number; recentCommissions: CommissionSelect[];
};
type PayoutResult = { success: boolean; batchId?: string; totalAmount: number; processedCount: number; message: string; };

export class CommissionService {

    async createCommission(params: Omit<CommissionInsert, 'id' | 'createdAt' | 'updatedAt' | 'paymentDate' | 'paymentReference' | 'payoutBatchId'>, transaction?: any): Promise<CommissionSelect> {
        const { userId, amount, type, status = 'Pending', relatedTo, relatedId, notes, rate } = params;
        const dbOrTx = transaction ?? db;
        try {
            if (!userId || !amount || !type || !relatedTo || !relatedId || !rate) throw new Error('Missing required fields for commission');
            const amountStr = parseFloat(amount).toFixed(2);
            if (isNaN(parseFloat(amountStr))) throw new Error('Invalid commission amount');

            const commissionInsertData: CommissionInsert = {
                userId, amount: amountStr, type, status, relatedTo,
                relatedId: String(relatedId), notes, rate,
            };
            const result = await dbOrTx.insert(schema.commissions).values(commissionInsertData).returning();
            if (!result || result.length === 0) throw new Error('Failed to insert commission record');
            const newCommission = result[0];

            try {
                 const taskTitle = type === 'Order Referral' ? 'Review referral commission' : 'Review fulfillment commission';
                 const taskDescription = `Review and approve ${type ? type.toLowerCase() : 'commission'} for ${relatedTo} #${relatedId}`;
                 const taskData: TaskInsert = {
                     title: taskTitle, description: taskDescription, status: 'Pending',
                     priority: 'Medium', category: 'Commission', relatedTo: 'Commission',
                     relatedId: String(newCommission.id),
                 };
                 await dbOrTx.insert(schema.tasks).values(taskData);
             } catch (taskError) {
                 logger.error('Failed to create commission review task', { commissionId: newCommission.id, error: taskError });
             }
            logger.info('Commission created', { commissionId: newCommission.id, userId, amount, type });
            return newCommission;
        } catch (error) {
            logger.error('Error creating commission:', { params, error });
            throw error;
        }
    }

    async calculateCommissionForOrder(orderId: string, transaction?: any): Promise<{ amount: number } | null> {
        const dbOrTx = transaction ?? db;
        try {
            const order = await dbOrTx.query.orders.findFirst({
                where: eq(schema.orders.id, orderId),
                columns: { totalAmount: true, distributorId: true, userId: true }
            });
            if (!order || !order.totalAmount) throw new Error(`Order not found or missing total: ${orderId}`);

            let commissionAmount = 0;
            let commissionType: CommissionInsert['type'] | null = null;
            let commissionUserId: string | null = null;
            let rateStr = '0.00';

            if (order.distributorId) {
                const distributor = await dbOrTx.query.users.findFirst({ where: eq(schema.users.id, order.distributorId), columns: { role: true } });
                if (distributor?.role === 'Distributor') {
                    commissionAmount = parseFloat(order.totalAmount) * 0.10;
                    commissionType = 'Distributor Fulfillment';
                    commissionUserId = order.distributorId;
                    rateStr = '10.00';
                }
            }
            if (!commissionUserId) {
                 const orderUser = await dbOrTx.query.users.findFirst({ where: eq(schema.users.id, order.userId), columns: { referredBy: true } });
                 if (orderUser?.referredBy) {
                     commissionAmount = parseFloat(order.totalAmount) * 0.05;
                     commissionType = 'Order Referral';
                     commissionUserId = orderUser.referredBy;
                     rateStr = '5.00';
                 }
            }
            if (commissionUserId && commissionType && commissionAmount > 0) {
                const roundedAmount = Math.round(commissionAmount * 100) / 100;
                await this.createCommission({
                    userId: commissionUserId, amount: roundedAmount, rate: rateStr, type: commissionType,
                    status: 'Pending', relatedTo: 'Order', relatedId: orderId,
                    notes: `${commissionType} commission for order ${orderId}`,
                }, dbOrTx);
                return { amount: roundedAmount };
            } else {
                logger.info('No commission applicable for order', { orderId });
                return null;
            }
        } catch (error) {
             logger.error('Failed to calculate commission for order:', { orderId, error });
             throw new Error('Failed to calculate commission for order.');
        }
    }

    async getPayableCommissions(): Promise<Array<CommissionSelect & { user: { name: string | null, email: string } | null }>> {
        try {
            return await db.query.commissions.findMany({
                where: eq(schema.commissions.status, 'Approved'),
                with: { user: { columns: { name: true, email: true } } },
                orderBy: [asc(schema.commissions.createdAt)]
            });
        } catch (error) {
            logger.error('Failed to get payable commissions:', { error });
            throw new Error('Failed to get payable commissions.');
        }
    }

    async processCommissionPayout(commissionIds: number[], payoutMethod: string, payoutReference: string): Promise<PayoutResult> {
        if (!commissionIds || commissionIds.length === 0) return { success: false, totalAmount: 0, processedCount: 0, message: 'No commission IDs provided' };
        try {
            const result = await db.transaction(async (tx) => {
                const commissionsToPay = await tx.query.commissions.findMany({ where: and(inArray(schema.commissions.id, commissionIds), eq(schema.commissions.status, 'Approved')), columns: { id: true, amount: true, userId: true } });
                if (commissionsToPay.length === 0) throw new Error('No approved commissions found with provided IDs.');
                const totalAmount = commissionsToPay.reduce((sum, comm) => sum + parseFloat(comm.amount), 0);
                const roundedTotal = parseFloat(totalAmount.toFixed(2));
                const paidStatus: CommissionStatus = 'Paid';
                const updateResult = await tx.update(schema.commissions).set({
                        status: paidStatus, paymentDate: new Date(), paymentReference: payoutReference, updatedAt: new Date(),
                    }).where(inArray(schema.commissions.id, commissionsToPay.map(c => c.id))).returning({ id: schema.commissions.id });
                const batchId = `batch-${uuidv4()}`;
                // TODO: Insert payout batch record & Create notifications
                return { success: true, batchId, totalAmount: roundedTotal, processedCount: updateResult.length, message: `Processed ${updateResult.length} payouts.` };
            });
            return result;
        } catch (error) {
            logger.error('Failed to process commission payout:', { commissionIds, error });
            if (error instanceof Error && error.message.includes('No approved commissions')) return { success: false, totalAmount: 0, processedCount: 0, message: error.message };
            throw new Error('Failed to process commission payout.');
        }
    }

    async getUserCommissionStats(userId: string): Promise<UserCommissionStats> {
        try {
            const aggregateQuery = db.select({ status: schema.commissions.status, total: dSql<number>`COALESCE(SUM(${schema.commissions.amount}), 0)`.mapWith(Number) })
                .from(schema.commissions)
                // Use `ne` (not equal) operator from drizzle-orm
                .where(and(eq(schema.commissions.userId, userId), ne(schema.commissions.status, 'Cancelled')))
                .groupBy(schema.commissions.status);
            const recentCommissionsQuery = db.query.commissions.findMany({ where: eq(schema.commissions.userId, userId), orderBy: [desc(schema.commissions.createdAt)], limit: 10 });
            const [aggregates, recentCommissions] = await Promise.all([aggregateQuery, recentCommissionsQuery]);
            let pending = 0, approved = 0, paid = 0, lifetime = 0;
            for (const row of aggregates) {
                 lifetime += row.total;
                 switch (row.status) {
                    case 'Pending': pending = row.total; break;
                    case 'Approved': approved = row.total; break;
                    case 'Paid': paid = row.total; break;
                 }
            }
            return { pendingAmount: parseFloat(pending.toFixed(2)), approvedAmount: parseFloat(approved.toFixed(2)), paidAmount: parseFloat(paid.toFixed(2)), totalLifetimeAmount: parseFloat(lifetime.toFixed(2)), recentCommissions };
        } catch (error) {
            logger.error('Failed to get commission stats:', { userId, error });
            throw new Error('Failed to get commission stats.');
        }
    }
}

export const commissionService = new CommissionService();
