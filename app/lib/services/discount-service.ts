// app/lib/services/discount-service.ts
import { db } from '@/lib/db';
import { discountCodes } from '@/lib/schema/discounts';
import { discountCodes } from '@/lib/schema/discountCodes';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
import { eq, and, or, ilike, count, desc, asc, not, sql } from 'drizzle-orm'; // Added sql import
import { logger } from '@/lib/logger';

// Types
export type DiscountCodeSelect = typeof schema.discountCodes.$inferSelect;
type DiscountCodeInsert = typeof schema.discountCodes.$inferInsert;
type DiscountType = (typeof schema.discountTypeEnum.enumValues)[number];

export interface ListDiscountCodesOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}
export interface ListDiscountCodesResult {
  discountCodes: DiscountCodeSelect[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
export interface CreateDiscountCodeParams {
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: Date;
  endDate?: Date | null;
  usageLimit?: number | null;
  isActive?: boolean;
}
// Interface for Update (make fields optional)
export type UpdateDiscountCodeParams = Partial<Omit<CreateDiscountCodeParams, 'code'>>; // Cannot change code, other fields optional

export class DiscountService {
  async listDiscountCodes(options: ListDiscountCodesOptions): Promise<ListDiscountCodesResult> {
    /* ... implementation ... */
  }
  async createDiscountCode(params: CreateDiscountCodeParams): Promise<DiscountCodeSelect> {
    /* ... implementation ... */
  }

  // --- NEW: Get Single Discount Code ---
  async getDiscountCodeById(id: number): Promise<DiscountCodeSelect | null> {
    try {
      const result = await db.query.discountCodes.findFirst({
        where: eq(schema.discountCodes.id, id),
      });
      return result || null;
    } catch (error) {
      logger.error('Error fetching discount code by ID:', { id, error });
      throw new Error('Failed to fetch discount code.');
    }
  }

  // --- NEW: Update Discount Code ---
  async updateDiscountCode(
    id: number,
    params: UpdateDiscountCodeParams
  ): Promise<DiscountCodeSelect> {
    try {
      // Prepare update data
      const updateData: Partial<DiscountCodeInsert> = {
        description: params.description,
        discountType: params.discountType,
        discountValue: params.discountValue ? params.discountValue.toFixed(2) : undefined,
        minOrderAmount: params.minOrderAmount ? params.minOrderAmount.toFixed(2) : undefined,
        maxDiscountAmount: params.maxDiscountAmount
          ? params.maxDiscountAmount.toFixed(2)
          : undefined,
        startDate: params.startDate,
        endDate: params.endDate,
        usageLimit: params.usageLimit,
        isActive: params.isActive,
        updatedAt: new Date(), // Always update timestamp
      };

      // Remove undefined fields to avoid accidentally setting columns to null
      Object.keys(updateData).forEach(
        key =>
          updateData[key as keyof typeof updateData] === undefined &&
          delete updateData[key as keyof typeof updateData]
      );

      if (Object.keys(updateData).length <= 1 && updateData.updatedAt) {
        // Only updatedAt
        // Fetch and return current data if no actual change
        const currentCode = await this.getDiscountCodeById(id);
        if (!currentCode) throw new Error('Discount code not found.');
        return currentCode;
      }

      const result = await db
        .update(schema.discountCodes)
        .set(updateData)
        .where(eq(schema.discountCodes.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Discount code not found or update failed.');
      }
      return result[0];
    } catch (error) {
      logger.error('Error updating discount code:', { id, params, error });
      throw new Error('Failed to update discount code.');
    }
  }

  // --- NEW: Delete Discount Code ---
  async deleteDiscountCode(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(schema.discountCodes)
        .where(eq(schema.discountCodes.id, id))
        .returning({ id: schema.discountCodes.id });

      return result.length > 0; // Return true if a row was deleted
    } catch (error) {
      logger.error('Error deleting discount code:', { id, error });
      throw new Error('Failed to delete discount code.');
    }
  }

  // --- Validation and Usage ---
  async validateDiscountCode(
    code: string,
    orderAmount: number
  ): Promise<{
    valid: boolean;
    discountType?: DiscountType;
    discountValue?: number;
    message: string;
  }> {
    /* ... implementation ... */
  }
  async incrementDiscountCodeUsage(code: string, transaction?: unknown): Promise<boolean> {
    const dbOrTx = transaction ?? db;
    try {
      const result = await dbOrTx
        .update(schema.discountCodes)
        .set({ timesUsed: sql`${schema.discountCodes.timesUsed} + 1`, updatedAt: new Date() })
        .where(eq(schema.discountCodes.code, code));
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error incrementing discount code usage:', { code, error });
      // Don't throw, allow main operation (like order creation) to succeed
      return false;
    }
  }
}

export const discountService = new DiscountService();

// NOTE: Ellipses (...) indicate unchanged or previously provided implementation code for brevity.
