// app/lib/services/commission-service.ts
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, or, ilike, count, desc, asc, gte, lte, sum, sql as dSql, inArray, sql, ne } from 'drizzle-orm'; // Added ne
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

// Types
type CommissionInsert = typeof schema.commissions.$inferInsert;
export type CommissionSelect = typeof schema.commissions.$inferSelect;
export type CommissionStatus = typeof schema.commissionStatusEnum.enumValues[number]; // Export Enum type
type TaskInsert = typeof schema.tasks.$inferInsert;

export type UserCommissionStats = { pendingAmount: number; approvedAmount: number; paidAmount: number; totalLifetimeAmount: number; recentCommissions: CommissionSelect[]; };
export type PayoutResult = { success: boolean; batchId?: string; totalAmount: number; processedCount: number; message: string; };
export interface AdminCommissionListItem extends CommissionSelect { user: { name: string | null; email: string; } | null; }
export interface ListCommissionsOptions { page?: number; limit?: number; status?: CommissionStatus; userId?: string; }
export interface ListCommissionsResult { commissions: AdminCommissionListItem[]; pagination: { total: number; page: number; limit: number; totalPages: number; }; }

// --- Service Class ---
export class CommissionService {

    async createCommission(params: Omit<CommissionInsert, 'id' | 'createdAt' | 'updatedAt' | 'paymentDate' | 'paymentReference' | 'payoutBatchId'>, transaction?: any): Promise<CommissionSelect> { /* ... */ }
    async calculateCommissionForOrder(orderId: string, transaction?: any): Promise<{ amount: number } | null> { /* ... */ }
    async getPayableCommissions(): Promise<Array<CommissionSelect & { user: { name: string | null, email: string } | null }>> { /* ... */ }
    async processCommissionPayout(commissionIds: number[], payoutMethod: string, payoutReference: string): Promise<PayoutResult> { /* ... */ }
    async getUserCommissionStats(userId: string): Promise<UserCommissionStats> { /* ... */ }
    async listCommissions(options: ListCommissionsOptions): Promise<ListCommissionsResult> { /* ... */ }

    // --- NEW: Get Commissions for a specific user ---
    async getUserCommissions(userId: string, options: { page?: number; limit?: number; status?: CommissionStatus }): Promise<ListCommissionsResult> {
         const { page = 1, limit = 10, status } = options;
         // Reuse the listCommissions logic, just force the userId filter
         const result = await this.listCommissions({
             ...options, // Pass page, limit, status
             userId: userId, // Force the user ID
         });
         // The listCommissions result includes user details which aren't strictly needed here,
         // but it simplifies code reuse. We can adjust the return type if needed.
         return result;
    }
    // --- END NEW METHOD ---
}

export const commissionService = new CommissionService();
// NOTE: Ellipses (...) indicate unchanged code from previous version for brevity.
