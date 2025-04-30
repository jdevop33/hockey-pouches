// app/lib/services/commission-service.ts
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Keep for other schema references
import { commissions } from '@/lib/schema/commissions'; // Only import the table
import { users } from '@/lib/schema/users'; // Only import the table
import { COMMISSION_STATUS, type CommissionStatus } from '@/lib/constants/commission-status';
import {
  eq,
  and,
  or,
  ilike,
  count,
  desc,
  asc,
  gte,
  lte,
  sum,
  sql as dSql,
  inArray,
  sql,
  ne,
} from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

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
    transaction?: any
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
    transaction?: any
  ): Promise<{ amount: number } | null> {
    logger.info('Calculating commission for order', { orderId });
    // Implementation would go here
    return { amount: 0 };
  }
  async getPayableCommissions(): Promise<
    Array<CommissionSelect & { user: { name: string | null; email: string } | null }>
  > {
    const payableStatus = COMMISSION_STATUS.PAYABLE;
    logger.warn('getPayableCommissions: Not fully implemented');
    return [];
  }
  async processCommissionPayout(
    commissionIds: number[],
    payoutMethod: string,
    payoutReference: string
  ): Promise<PayoutResult> {
    try {
      const batchId = uuidv4();
      logger.warn('processCommissionPayout: Not fully implemented');
      return {
        success: true,
        batchId,
        totalAmount: 0,
        processedCount: 0,
        message: `Successfully processed 0 commissions for payout.`,
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
    logger.warn('getUserCommissionStats: Not fully implemented');
    return {
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
      totalLifetimeAmount: 0,
      recentCommissions: [],
    };
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
