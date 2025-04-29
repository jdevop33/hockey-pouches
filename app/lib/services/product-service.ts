// app/lib/services/product-service.ts (Exporting types)
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, or, ilike, count, desc, asc, gte, lte, sum, sql as dSql, gt, lt, sql, Placeholder, ne } from 'drizzle-orm'; // Added ne
import { logger } from '@/lib/logger';
import { cachedQuery, CACHE_DURATIONS, invalidateCache, invalidateAllCache } from '@/lib/dbOptimization';
import { alias } from 'drizzle-orm/pg-core';

// --- Export needed types ---
export type ProductSelect = typeof schema.products.$inferSelect;
export type ProductVariationSelect = typeof schema.productVariations.$inferSelect;
export type ProductWithVariations = ProductSelect & { variations: ProductVariationSelect[]; };
export interface ProductFilters { category?: string | null; flavor?: string | null; strength?: number | null; minPrice?: number | null; maxPrice?: number | null; search?: string | null; }
export interface ProductSorting { sortBy?: 'name' | 'price' | 'createdAt' | 'strength'; sortOrder?: 'asc' | 'desc'; }
export interface ProductListOptions extends ProductFilters, ProductSorting { page?: number; limit?: number; includeInactive?: boolean; }
export interface ProductListResult { products: ProductSelect[]; pagination: { page: number; limit: number; total: number; totalPages: number; }; filters: ProductFilters; availableFilters: any; sorting: ProductSorting; }
export interface ProductStats { totalProducts: number; activeProducts: number; totalInventory: number; lowStockCount: number; outOfStockCount: number; topSellingProducts: Array<{ id: number; name: string | null; sales: number }>; }
export interface InventoryUpdateParams { stockLevelId?: string; productVariationId?: number; locationId?: string; changeQuantity: number; type: string; referenceId?: string; referenceType?: string; notes?: string; userId: string; }

type StockLevelSelect = typeof schema.stockLevels.$inferSelect;

// --- Service Class ---
export class ProductService {
    private LOW_STOCK_THRESHOLD = 10;
    private CACHE_KEYS = { /* ... */ };
    private async invalidateProductCaches(productId?: number) { /* ... */ }
    private async invalidateVariationCache(variationId: number, productId?: number) { /* ... */ }

    // --- Methods (Implementations as refactored) ---
    async getProductById(productId: number): Promise<ProductWithVariations | null> { /* ... */ }
    async getProducts(options: ProductListOptions): Promise<ProductListResult> { /* ... */ }
    async getAvailableFilters(includeInactive = false) { /* ... */ }
    async createProduct(productData: Omit<ProductSelect, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductSelect> { /* ... */ }
    async updateProduct(productId: number, updates: Partial<Omit<ProductSelect, 'id' | 'createdAt'>>): Promise<ProductSelect> { /* ... */ }
    async deleteProduct(productId: number): Promise<boolean> { /* ... */ }
    async getProductVariations(productId: number, includeInactive: boolean = false): Promise<ProductVariationSelect[]> { /* ... */ }
    async getVariationById(variationId: number): Promise<ProductVariationSelect | null> { /* ... */ }
    async createVariation(productId: number, variationData: Omit<ProductVariationSelect, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'inventoryQuantity'>): Promise<ProductVariationSelect> { /* ... */ }
    async updateVariation(variationId: number, updates: Partial<Omit<ProductVariationSelect, 'id' | 'productId' | 'createdAt'>>): Promise<ProductVariationSelect> { /* ... */ }
    async deleteVariation(variationId: number): Promise<boolean> { /* ... */ }
    private async initializeVariationStockLevels(variationId: number, productId: number): Promise<void> { /* ... */ }
    async getStockLevel(productVariationId: number, locationId: string): Promise<StockLevelSelect | null> { /* ... */ }
    async getTotalAvailableStock(productVariationId: number): Promise<number> { /* ... */ }
    async updateInventory(params: InventoryUpdateParams): Promise<boolean> { /* ... */ }
    async getProductStats(): Promise<ProductStats> { /* ... */ }
    async validateWholesaleOrder(items: { productVariationId: number; quantity: number }[]): Promise<{ valid: boolean; totalUnits: number; minimumRequired: number; message?: string; }> { /* ... */ }
}
export const productService = new ProductService();

// NOTE: Ellipses (...) indicate unchanged code from the fully refactored version for brevity.
// Ensure all methods are fully implemented as shown in the previous refactoring steps.
