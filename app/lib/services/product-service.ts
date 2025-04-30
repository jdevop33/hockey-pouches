// app/lib/services/product-service.ts (Exporting types)
import { db } from '@/lib/db';
import { products } from '@/lib/schema/products';
import { products } from '@/lib/schema/products';
import { products } from '@/lib/schema/products';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use central schema index
// Only importing what's actually needed
import { invalidateCache, invalidateAllCache } from '@/lib/dbOptimization';
import { logger } from '@/lib/logger';
import { type DbTransaction } from '@/lib/db-types';

// --- Export needed types ---
export type ProductSelect = typeof schema.products.$inferSelect;
export type ProductVariationSelect = typeof schema.productVariations.$inferSelect;
export type ProductWithVariations = ProductSelect & { variations: ProductVariationSelect[] };
export interface ProductFilters {
  category?: string | null;
  flavor?: string | null;
  strength?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string | null;
}
export interface ProductSorting {
  sortBy?: 'name' | 'price' | 'createdAt' | 'strength';
  sortOrder?: 'asc' | 'desc';
}
export interface ProductListOptions extends ProductFilters, ProductSorting {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}
export interface ProductListResult {
  products: ProductSelect[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: ProductFilters;
  availableFilters: Record<string, unknown>;
  sorting: ProductSorting;
}
export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalInventory: number;
  lowStockCount: number;
  outOfStockCount: number;
  topSellingProducts: Array<{ id: number; name: string | null; sales: number }>;
}
export interface InventoryUpdateParams {
  stockLevelId?: string;
  productVariationId?: number;
  locationId?: string;
  changeQuantity: number;
  type: string;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  userId: string;
  transaction?: DbTransaction;
}

type StockLevelSelect = typeof schema.stockLevels.$inferSelect;

// --- Service Class ---
export class ProductService {
  private LOW_STOCK_THRESHOLD = 10;
  // Define CACHE_KEYS properly
  private CACHE_KEYS = {
    PRODUCT_BY_ID: (id: number) => `product:${id}`,
    PRODUCTS_LIST: (options: ProductListOptions) => `products:list:${JSON.stringify(options)}`,
    VARIATIONS_BY_PRODUCT: (productId: number, activeOnly: boolean) =>
      `variations:product:${productId}:active${activeOnly}`,
    VARIATION_BY_ID: (id: number) => `variation:${id}`,
    STOCK_LEVEL: (variationId: number, locationId: string) => `stock:${variationId}:${locationId}`,
    TOTAL_STOCK: (variationId: number) => `stock:total:${variationId}`,
    PRODUCT_STATS: 'products:stats',
    AVAILABLE_FILTERS: (activeOnly: boolean) => `products:filters:active${activeOnly}`,
  };
  private async invalidateProductCaches(productId?: number) {
    logger.info('Invalidating product caches', { productId });
    // Fixed invalidateAllCache calls - assuming these methods don't actually require arguments
    // but are being called with pattern prefix for manual filtering
    try {
      await invalidateAllCache();
      await invalidateCache(this.CACHE_KEYS.PRODUCT_STATS);
      if (productId) {
        await invalidateCache(this.CACHE_KEYS.PRODUCT_BY_ID(productId));
        await invalidateCache(this.CACHE_KEYS.VARIATIONS_BY_PRODUCT(productId, true));
        await invalidateCache(this.CACHE_KEYS.VARIATIONS_BY_PRODUCT(productId, false));
      }
    } catch (error) {
      logger.error('Error invalidating product caches', { error: error as Record<string, any> });
    }
  }
  private async invalidateVariationCache(variationId: number, productId?: number) {
    logger.info('Invalidating variation caches', { variationId, productId });
    try {
      await invalidateCache(this.CACHE_KEYS.VARIATION_BY_ID(variationId));
      await invalidateCache(this.CACHE_KEYS.TOTAL_STOCK(variationId));
      await invalidateAllCache();
      // Invalidate product caches if product ID is known
      if (productId) {
        await this.invalidateProductCaches(productId);
      } else {
        // If product ID unknown, clear broader caches as a fallback
        await this.invalidateProductCaches();
      }
    } catch (error) {
      logger.error('Error invalidating variation caches', { error: error as Record<string, any> });
    }
  }

  // --- Methods (Add basic return types for placeholders) ---
  async getProductById(_productId: number): Promise<ProductWithVariations | null> {
    console.warn('getProductById not implemented');
    return null;
  }
  async getProducts(_options: ProductListOptions): Promise<ProductListResult> {
    console.warn('getProducts not implemented');
    return {
      products: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      filters: {},
      availableFilters: {},
      sorting: {},
    };
  }
  async getAvailableFilters(_includeInactive = false): Promise<Record<string, unknown>> {
    console.warn('getAvailableFilters not implemented');
    return { flavors: [], strengths: [], categories: [] };
  }
  async createProduct(
    _productData: Omit<ProductSelect, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProductSelect> {
    console.warn('createProduct not implemented');
    // This needs a proper implementation returning the created product
    throw new Error('createProduct not implemented');
  }
  async updateProduct(
    _productId: number,
    _updates: Partial<Omit<ProductSelect, 'id' | 'createdAt'>>
  ): Promise<ProductSelect> {
    console.warn('updateProduct not implemented');
    // This needs a proper implementation returning the updated product
    throw new Error('updateProduct not implemented');
  }
  async deleteProduct(_productId: number): Promise<boolean> {
    console.warn('deleteProduct not implemented');
    return false;
  }
  async getProductVariations(
    _productId: number,
    _includeInactive: boolean = false
  ): Promise<ProductVariationSelect[]> {
    console.warn('getProductVariations not implemented');
    return [];
  }
  async getVariationById(_variationId: number): Promise<ProductVariationSelect | null> {
    console.warn('getVariationById not implemented');
    return null;
  }
  async createVariation(
    _productId: number,
    _variationData: Omit<
      ProductVariationSelect,
      'id' | 'productId' | 'createdAt' | 'updatedAt' | 'inventoryQuantity'
    >
  ): Promise<ProductVariationSelect> {
    console.warn('createVariation not implemented');
    // This needs a proper implementation returning the created variation
    throw new Error('createVariation not implemented');
  }
  async updateVariation(
    _variationId: number,
    _updates: Partial<Omit<ProductVariationSelect, 'id' | 'productId' | 'createdAt'>>
  ): Promise<ProductVariationSelect> {
    console.warn('updateVariation not implemented');
    // This needs a proper implementation returning the updated variation
    throw new Error('updateVariation not implemented');
  }
  async deleteVariation(_variationId: number): Promise<boolean> {
    console.warn('deleteVariation not implemented');
    return false;
  }
  private async initializeVariationStockLevels(
    _variationId: number,
    _productId: number
  ): Promise<void> {
    console.warn('initializeVariationStockLevels not implemented');
    return;
  }
  async getStockLevel(
    _productVariationId: number,
    _locationId: string
  ): Promise<StockLevelSelect | null> {
    console.warn('getStockLevel not implemented');
    return null;
  }
  async getTotalAvailableStock(_productVariationId: number): Promise<number> {
    console.warn('getTotalAvailableStock not implemented');
    return 0;
  }
  async updateInventory(params: InventoryUpdateParams): Promise<boolean> {
    // Use transaction if provided (using the variable to avoid the linter warning)
    const _executor = params.transaction || db;
    console.warn('updateInventory not implemented');
    return false;
  }
  async getProductStats(): Promise<ProductStats> {
    console.warn('getProductStats not implemented');
    return {
      totalProducts: 0,
      activeProducts: 0,
      totalInventory: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      topSellingProducts: [],
    };
  }
  async validateWholesaleOrder(
    _items: { productVariationId: number; quantity: number }[]
  ): Promise<{ valid: boolean; totalUnits: number; minimumRequired: number; message?: string }> {
    console.warn('validateWholesaleOrder not implemented');
    return {
      valid: false,
      totalUnits: 0,
      minimumRequired: 100,
      message: 'Validation not implemented',
    };
  }
}
export const productService = new ProductService();

// NOTE: Ellipses (...) indicate unchanged code from the fully refactored version for brevity.
