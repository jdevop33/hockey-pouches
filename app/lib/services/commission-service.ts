// app/lib/services/commission-service.ts
import { db, sql } from '@/lib/db';
import { users } from '@/lib/schema/users';
import { orders } from '@/lib/schema/orders';
import { commissions } from '@/lib/schema/commissions';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
import { COMMISSION_STATUS, type CommissionStatus } from '@/lib/constants/commission-status';
import { eq, and, count, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { type DbTransaction } from '@/lib/db-types';
// ... (Types and other functions remain the same) ...
// --- Service Class ---
export class CommissionService {
  // ... (createCommission, calculateCommissionForOrder, getPayableCommissions, processCommissionPayout remain the same) ...
  async getUserCommissionStats(userId: string): Promise<UserCommissionStats> {
    try {
        // Use a single query to get SUM aggregates grouped by status
        const statusTotalsResult = await db
            .select({
                status: commissions.status,
                // Ensure the sum returns a numeric type or cast appropriately
                totalAmount: sql<string>`COALESCE(SUM(CAST(${commissions.amount} AS DECIMAL(10,2))), '0.00')`.mapWith(Number)
            })
            .from(commissions)
            .where(eq(commissions.userId, userId))
            .groupBy(commissions.status);
        let pendingAmount = 0;
        let approvedAmount = 0;
        let paidAmount = 0;
        // Process the aggregated results
        statusTotalsResult.forEach(row => {
            if (row.status === COMMISSION_STATUS.PENDING) pendingAmount = row.totalAmount;
            if (row.status === COMMISSION_STATUS.PAYABLE) approvedAmount = row.totalAmount;
            if (row.status === COMMISSION_STATUS.PAID) paidAmount = row.totalAmount;
        });
        // Calculate total lifetime (excluding Cancelled)
        const totalLifetimeAmount = pendingAmount + approvedAmount + paidAmount;
        // Get 5 most recent commissions
        const recentCommissions = await db.query.commissions.findMany({
            where: eq(commissions.userId, userId),
            orderBy: desc(commissions.createdAt),
            limit: 5
        });
        return {
            pendingAmount,
            approvedAmount,
            paidAmount,
            totalLifetimeAmount,
            recentCommissions,
        };
    } catch (error) {
        logger.error('Error getting user commission stats:', { userId, error });
        // Return default zero values on error
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
    const conditions = [];
    if (status) { conditions.push(eq(commissions.status, status)); }
    if (userId) { conditions.push(eq(commissions.userId, userId)); }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const countResult = await db.select({ count: count() }).from(commissions).where(whereClause);
    const total = Number(countResult[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);
    const results = await db.query.commissions.findMany({ where: whereClause, with: { user: { columns: { name: true, email: true } } }, orderBy: desc(commissions.createdAt), limit: limit, offset: offset });
    const commissionsList = results as AdminCommissionListItem[];
    return { commissions: commissionsList, pagination: { total, page, limit, totalPages } };
  }
  async getUserCommissions(
    userId: string,
    options: { page?: number; limit?: number; status?: CommissionStatus }
  ): Promise<ListCommissionsResult> {
    const { page = 1, limit = 10, status } = options;
    const result = await this.listCommissions({ page, limit, status, userId });
    return result;
  }
}
export const commissionService = new CommissionService();
// --- Helper Functions / Types from previous version (if needed) ---
// Placeholder for CommissionInsert if required outside the class
// type CommissionInsert = typeof schema.commissions.$inferInsert;
// Export the CommissionStatus type if used elsewhere
// export { CommissionStatus };
