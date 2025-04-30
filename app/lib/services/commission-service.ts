// app/lib/services/commission-service.ts
import { db } from '@/lib/db';
import { commissions } from '@/lib/schema/commissions';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import { commissions } from '@/lib/schema/commissions';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
import { commissions } from '@/lib/schema/commissions'; // Only import the table
import { users } from '@/lib/schema/users'; // Only import the table
import { orders } from '@/lib/schema/orders'; // Add orders table import
import { COMMISSION_STATUS, type CommissionStatus } from '@/lib/constants/commission-status';
import { eq, and, count, desc, sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { type DbTransaction } from '@/lib/db-types';

// Types
type CommissionInsert = typeof schema.commissions.$inferInsert;
export type CommissionSelect = typeof schema.commissions.$inferSelect;
// Export the type from constants
export { CommissionStatus };

export type UserCommissionStats = {
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  totalLifetimeAmount: number;
  recentCommissions: CommissionSelect[];
};
export type PayoutResult = {
  success: boolean;
  batchId?: string;
  totalAmount: number;
  processedCount: number;
  message: string;
};
export interface AdminCommissionListItem extends CommissionSelect {
  user: { name: string | null; email: string | null } | null;
}
export interface ListCommissionsOptions {
  page?: number;
  limit?: number;
  status?: CommissionStatus;
  userId?: string;
}
export interface ListCommissionsResult {
  commissions: AdminCommissionListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// --- Service Class ---
export class CommissionService {
  async createCommission(
    params: Omit<
      CommissionInsert,
      'id' | 'createdAt' | 'updatedAt' | 'paymentDate' | 'paymentReference' | 'payoutBatchId'
    >,
    transaction?: DbTransaction
  ): Promise<CommissionSelect> {
    const executor = transaction || db;
    try {
      const result = await executor
        .insert(commissions)
        .values({
          ...params,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return result[0];
    } catch (error) {
      logger.error('Error creating commission:', { error, params });
      throw new Error('Failed to create commission');
    }
  }

  async calculateCommissionForOrder(
    orderId: string,
    transaction?: DbTransaction
  ): Promise<{ amount: number } | null> {
    logger.info('Calculating commission for order', { orderId });
    const executor = transaction || db;

    try {
      // Get order details with user information
      const orderResult = await executor.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: {
          id: true,
          userId: true,
          totalAmount: true,
          appliedReferralCode: true,
          status: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              referredBy: true,
            },
          },
        },
      });

      if (!orderResult) {
        logger.warn('Order not found when calculating commission', { orderId });
        return null;
      }

      // Only calculate commissions for completed orders
      const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Completed'];
      if (!validStatuses.includes(orderResult.status)) {
        logger.info('Order status not eligible for commission calculation', {
          orderId,
          status: orderResult.status,
        });
        return null;
      }

      // Check if commission already exists for this order to prevent duplicates
      const existingCommission = await executor
        .select({ id: commissions.id })
        .from(commissions)
        .where(and(eq(commissions.orderId, orderId), eq(commissions.type, 'OrderReferral')));

      if (existingCommission.length > 0) {
        logger.info('Commission already exists for this order', { orderId });
        return null;
      }

      // Determine referrer - either from applied code or user's referredBy field
      let referrerId = null;

      // First check if a referral code was applied to this order
      if (orderResult.appliedReferralCode) {
        const referrer = await executor.query.users.findFirst({
          where: eq(users.referralCode, orderResult.appliedReferralCode),
          columns: {
            id: true,
            commissionRate: true,
          },
        });

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // If no applied referral code, check if user was referred on registration
      if (!referrerId && orderResult.user?.referredBy) {
        const referrer = await executor.query.users.findFirst({
          where: eq(users.referralCode, orderResult.user.referredBy),
          columns: {
            id: true,
            commissionRate: true,
          },
        });

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      if (!referrerId) {
        logger.info('No referrer found for order', { orderId });
        return null;
      }

      // Get referrer's commission rate
      const referrerData = await executor.query.users.findFirst({
        where: eq(users.id, referrerId),
        columns: {
          commissionRate: true,
        },
      });

      if (!referrerData || !referrerData.commissionRate) {
        logger.warn('Referrer has no commission rate set', { referrerId });
        return null;
      }

      // Calculate commission (default to 5% if rate is not set)
      const commissionRate = parseFloat(referrerData.commissionRate.toString()) / 100 || 0.05;
      const orderAmount = parseFloat(orderResult.totalAmount.toString());
      const commissionAmount = orderAmount * commissionRate;

      // Round to 2 decimal places
      const roundedAmount = Math.round(commissionAmount * 100) / 100;

      if (roundedAmount <= 0) {
        logger.info('Calculated commission is zero or negative', {
          orderId,
          amount: roundedAmount,
        });
        return null;
      }

      // Create the commission record if transaction provided
      if (transaction) {
        await this.createCommission(
          {
            userId: referrerId,
            orderId: orderId,
            amount: roundedAmount.toString(),
            rate: commissionRate.toString(),
            status: COMMISSION_STATUS.PENDING,
            type: 'OrderReferral',
            relatedTo: 'Order',
            relatedId: orderId,
          },
          transaction
        );
      }

      return { amount: roundedAmount };
    } catch (error) {
      logger.error('Error calculating commission for order:', { orderId, error });
      return null;
    }
  }

  async getPayableCommissions(): Promise<
    Array<CommissionSelect & { user: { name: string | null; email: string } | null }>
  > {
    const payableStatus = COMMISSION_STATUS.PAYABLE;

    try {
      const results = await db
        .select({
          commission: commissions,
          userName: users.name,
          userEmail: users.email,
        })
        .from(commissions)
        .leftJoin(users, eq(commissions.userId, users.id))
        .where(eq(commissions.status, payableStatus))
        .orderBy(desc(commissions.createdAt));

      return results.map(r => ({
        ...r.commission,
        user: {
          name: r.userName,
          email: r.userEmail as string, // Email is required for payment
        },
      }));
    } catch (error) {
      logger.error('Error getting payable commissions:', { error });
      return [];
    }
  }

  async processCommissionPayout(
    commissionIds: number[],
    payoutMethod: string,
    payoutReference: string
  ): Promise<PayoutResult> {
    try {
      const batchId = uuidv4();

      if (!commissionIds.length) {
        return {
          success: false,
          totalAmount: 0,
          processedCount: 0,
          message: 'No commission IDs provided',
        };
      }

      // Get commissions to pay out
      const commissionsToPay = await db
        .select({
          id: commissions.id,
          amount: commissions.amount,
          status: commissions.status,
        })
        .from(commissions)
        .where(
          and(
            eq(commissions.status, COMMISSION_STATUS.PAYABLE),
            sql`${commissions.id} = ANY(${commissionIds})`
          )
        );

      if (!commissionsToPay.length) {
        return {
          success: false,
          totalAmount: 0,
          processedCount: 0,
          message: 'No payable commissions found with the provided IDs',
        };
      }

      // Calculate total payout amount
      let totalAmount = 0;
      for (const commission of commissionsToPay) {
        totalAmount += parseFloat(commission.amount.toString());
      }
      totalAmount = Math.round(totalAmount * 100) / 100;

      // Update commissions to paid status
      const updateResult = await db
        .update(commissions)
        .set({
          status: COMMISSION_STATUS.PAID,
          paymentDate: new Date(),
          paymentReference: payoutReference,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(commissions.status, COMMISSION_STATUS.PAYABLE),
            sql`${commissions.id} = ANY(${commissionIds})`
          )
        )
        .returning({ id: commissions.id });

      return {
        success: true,
        batchId,
        totalAmount,
        processedCount: updateResult.length,
        message: `Successfully processed ${updateResult.length} commissions for payout.`,
      };
    } catch (error) {
      logger.error('Error processing commission payout:', { error, commissionIds });
      return {
        success: false,
        totalAmount: 0,
        processedCount: 0,
        message: 'Failed to process commission payout',
      };
    }
  }

  async getUserCommissionStats(userId: string): Promise<UserCommissionStats> {
    try {
      // Get pending amount
      const pendingResult = await db
        .select({
          totalAmount: sql`COALESCE(SUM(CAST(${commissions.amount} AS FLOAT)), 0)`,
        })
        .from(commissions)
        .where(
          and(eq(commissions.userId, userId), eq(commissions.status, COMMISSION_STATUS.PENDING))
        );

      // Get payable amount
      const approvedResult = await db
        .select({
          totalAmount: sql`COALESCE(SUM(CAST(${commissions.amount} AS FLOAT)), 0)`,
        })
        .from(commissions)
        .where(
          and(eq(commissions.userId, userId), eq(commissions.status, COMMISSION_STATUS.PAYABLE))
        );

      // Get paid amount
      const paidResult = await db
        .select({
          totalAmount: sql`COALESCE(SUM(CAST(${commissions.amount} AS FLOAT)), 0)`,
        })
        .from(commissions)
        .where(and(eq(commissions.userId, userId), eq(commissions.status, COMMISSION_STATUS.PAID)));

      // Get total lifetime amount (pending + payable + paid)
      const totalResult = await db
        .select({
          totalAmount: sql`COALESCE(SUM(CAST(${commissions.amount} AS FLOAT)), 0)`,
        })
        .from(commissions)
        .where(
          and(
            eq(commissions.userId, userId),
            sql`${commissions.status} != ${COMMISSION_STATUS.CANCELLED}`
          )
        );

      // Get 5 most recent commissions
      const recentCommissions = await db
        .select()
        .from(commissions)
        .where(eq(commissions.userId, userId))
        .orderBy(desc(commissions.createdAt))
        .limit(5);

      // Parse numeric values safely
      const pendingAmount = parseFloat(pendingResult[0]?.totalAmount?.toString() || '0');
      const approvedAmount = parseFloat(approvedResult[0]?.totalAmount?.toString() || '0');
      const paidAmount = parseFloat(paidResult[0]?.totalAmount?.toString() || '0');
      const totalLifetimeAmount = parseFloat(totalResult[0]?.totalAmount?.toString() || '0');

      return {
        pendingAmount: Math.round(pendingAmount * 100) / 100,
        approvedAmount: Math.round(approvedAmount * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        totalLifetimeAmount: Math.round(totalLifetimeAmount * 100) / 100,
        recentCommissions,
      };
    } catch (error) {
      logger.error('Error getting user commission stats:', { userId, error });
      return {
        pendingAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        totalLifetimeAmount: 0,
        recentCommissions: [],
      };
    }
  }

  async listCommissions(options: ListCommissionsOptions): Promise<ListCommissionsResult> {
    const { page = 1, limit = 20, status, userId } = options;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(commissions.status, status));
    }
    if (userId) {
      conditions.push(eq(commissions.userId, userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count first
    const countResult = await db.select({ count: count() }).from(commissions).where(whereClause);

    const total = Number(countResult[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    // Get commissions with user details
    const results = await db
      .select({
        commission: commissions,
        userName: users.name,
        userEmail: users.email,
      })
      .from(commissions)
      .leftJoin(users, eq(commissions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(commissions.createdAt))
      .limit(limit)
      .offset(offset);

    const commissionsList = results.map(r => ({
      ...r.commission,
      user: {
        name: r.userName,
        email: r.userEmail,
      },
    }));

    return {
      commissions: commissionsList,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // --- NEW: Get Commissions for a specific user ---
  async getUserCommissions(
    userId: string,
    options: { page?: number; limit?: number; status?: CommissionStatus }
  ): Promise<ListCommissionsResult> {
    const { page = 1, limit = 10, status } = options;
    // Reuse the listCommissions logic, just force the userId filter
    const result = await this.listCommissions({
      page,
      limit,
      status,
      userId, // Force the user ID
    });
    return result;
  }
  // --- END NEW METHOD ---
}

export const commissionService = new CommissionService();
// NOTE: Ellipses (...) indicate unchanged code from previous version for brevity.
