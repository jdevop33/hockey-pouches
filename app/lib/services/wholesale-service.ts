// app/lib/services/wholesale-service.ts
import { db } from '@/lib/db';
import { wholesaleApplications } from '@/lib/schema/wholesaleApplications';
import { users } from '@/lib/schema/users';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
import { eq, and, or, ilike, count, desc, asc, SQL } from 'drizzle-orm'; // Added SQL type
import { logger } from '@/lib/logger';
// Types
export type WholesaleApplicationSelect = typeof schema.wholesaleApplications.$inferSelect;
type WholesaleApplicationStatus = (typeof schema.wholesaleApplicationStatusEnum.enumValues)[number];
export interface ListWholesaleAppsOptions {
  page?: number;
  limit?: number;
  status?: WholesaleApplicationStatus;
  // Add other filters: search by company name?
}
export interface ListWholesaleAppsResult {
  applications: (WholesaleApplicationSelect & {
    // Augment type for relations
    applicant?: { name: string | null; email: string } | null;
    reviewer?: { name: string | null } | null;
  })[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
export class WholesaleService {
  // List applications (e.g., for admin view)
  async listApplications(
    options: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ListWholesaleAppsResult> {
    // TODO: Implement listApplications - Remove comment/block below?
    // return {
    //   // Default empty object for ListWholesaleAppsResult
    // };

    const { page = 1, limit = 20, status } = options;
    try {
      const offset = (page - 1) * limit;
      const conditions: SQL[] = []; // Ensure conditions is typed
      if (status) {
        // Use the correct WholesaleApplicationStatus type if possible, otherwise cast
        conditions.push(
          eq(schema.wholesaleApplications.status, status as WholesaleApplicationStatus)
        );
      }
      // Add other conditions like company name search

      // Fix the condition check here
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const query = db.query.wholesaleApplications.findMany({
        where: whereClause,
        with: {
          applicant: { columns: { name: true, email: true } }, // Include applicant basic info
          reviewer: { columns: { name: true } }, // Include reviewer name if needed
        },
        orderBy: [desc(schema.wholesaleApplications.submittedAt)],
        limit,
        offset,
      });

      const countQuery = db
        .select({ total: count() })
        .from(schema.wholesaleApplications)
        .where(whereClause);

      const [results, countResult] = await Promise.all([query, countQuery]);
      const total = countResult[0].total;

      return {
        // Cast results to the augmented type defined in ListWholesaleAppsResult
        applications: results as ListWholesaleAppsResult['applications'],
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error listing wholesale applications:', { options, error });
      throw new Error('Failed to list wholesale applications.');
    }
  }
  // Get a single application
  async getApplicationById(applicationId: string): Promise<
    | (WholesaleApplicationSelect & {
        // Add relation types
        applicant: typeof schema.users.$inferSelect | null;
        reviewer: typeof schema.users.$inferSelect | null;
      })
    | null
  > {
    // TODO: Implement getApplicationById - Remove comment/block below?
    // return {
    //   // Default empty object for WholesaleApplicationSelect | null
    // };

    try {
      const result = await db.query.wholesaleApplications.findFirst({
        where: eq(schema.wholesaleApplications.id, applicationId),
        with: { applicant: true, reviewer: true }, // Include related users
      });
      // Cast the result to include the explicit relation types
      return result
        ? (result as WholesaleApplicationSelect & {
            applicant: typeof schema.users.$inferSelect | null;
            reviewer: typeof schema.users.$inferSelect | null;
          })
        : null;
    } catch (error) {
      logger.error('Error fetching wholesale application by ID:', { applicationId, error });
      throw new Error('Failed to fetch wholesale application.');
    }
  }
  // Approve an application
  async approveApplication(
    applicationId: string,
    adminUserId: string,
    notes?: string
  ): Promise<WholesaleApplicationSelect> {
    try {
      return await db.transaction(async tx => {
        // 1. Update application status
        const updateResult = await tx
          .update(schema.wholesaleApplications)
          .set({
            status: 'Approved',
            reviewedAt: new Date(),
            reviewedBy: adminUserId,
            reviewerNotes: notes,
            updatedAt: new Date(),
          })
          .where(eq(schema.wholesaleApplications.id, applicationId))
          .returning();

        if (updateResult.length === 0)
          throw new Error('Application not found or already processed');
        const application = updateResult[0];

        // 2. Update user role and eligibility
        await tx
          .update(schema.users)
          .set({
            role: 'Wholesale Buyer',
            wholesaleEligibility: true,
            wholesaleApprovedAt: new Date(),
            wholesaleApprovedBy: adminUserId,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.id, application.userId));

        // TODO: 3. Send notification to applicant
        logger.info('Wholesale application approved', { applicationId, adminUserId });
        return application;
      });
    } catch (error) {
      logger.error('Error approving wholesale application:', { applicationId, adminUserId, error });
      throw new Error('Failed to approve wholesale application.');
    }
  }
  // Reject an application
  async rejectApplication(
    applicationId: string,
    adminUserId: string,
    reason: string
  ): Promise<WholesaleApplicationSelect> {
    // TODO: Implement rejectApplication - Remove comment/block below?
    // return {
    //   // Default empty object for WholesaleApplicationSelect
    // };

    try {
      const updateResult = await db
        .update(schema.wholesaleApplications)
        .set({
          status: 'Rejected',
          reviewedAt: new Date(),
          reviewedBy: adminUserId,
          reviewerNotes: reason,
          updatedAt: new Date(),
        })
        .where(eq(schema.wholesaleApplications.id, applicationId))
        .returning();

      if (updateResult.length === 0) throw new Error('Application not found or already processed');

      // TODO: Send notification to applicant
      logger.info('Wholesale application rejected', { applicationId, adminUserId });
      return updateResult[0];
    } catch (error) {
      logger.error('Error rejecting wholesale application:', { applicationId, adminUserId, error });
      throw new Error('Failed to reject wholesale application.');
    }
  }
}
export const wholesaleService = new WholesaleService();
