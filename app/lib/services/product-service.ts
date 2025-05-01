// app/lib/services/product-service.ts (Exporting types)
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import {
  eq,
  and,
  or,
  asc,
  desc,
  gte,
  lte,
  ilike,
  isNotNull,
  sql,
  count
} from 'drizzle-orm';
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
  type: 'Sale' | 'Return' | 'Restock' | 'Adjustment' | 'TransferOut' | 'TransferIn' | 'Initial';
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
      logger.error('Error invalidating product caches', { error: error as Error });
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
      logger.error('Error invalidating variation caches', { error: error as Error });
    }
  }
  // --- Methods (Add basic return types for placeholders) ---
  async getProductById(productId: number): Promise<ProductWithVariations | null> {
    try {
      logger.info(`Getting product by ID: ${productId}`);

      // Get the product
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
      });

      if (!product) {
        logger.info(`Product not found with ID: ${productId}`);
        return null;
      }

      // Get variations for the product
      const variations = await this.getProductVariations(productId, true);

      return {
        ...product,
        variations,
      };
    } catch (error) {
      logger.error(`Error getting product by ID: ${productId}`, { error });
      return null;
    }
  }
  async getProducts(options: ProductListOptions): Promise<ProductListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        flavor,
        strength,
        minPrice,
        maxPrice,
        search,
        includeInactive = false,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      logger.info('Getting products with options', { options });

      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];

      if (!includeInactive) {
        conditions.push(eq(schema.products.isActive, true));
      }

      if (category) {
        conditions.push(eq(schema.products.category, category));
      }

      if (flavor) {
        conditions.push(eq(schema.products.flavor, flavor));
      }

      if (strength) {
        conditions.push(eq(schema.products.strength, strength));
      }

      if (minPrice !== undefined && minPrice !== null) {
        conditions.push(gte(schema.products.price, minPrice.toString()));
      }

      if (maxPrice !== undefined && maxPrice !== null) {
        conditions.push(lte(schema.products.price, maxPrice.toString()));
      }

      if (search) {
        conditions.push(
          or(
            ilike(schema.products.name, `%${search}%`),
            ilike(schema.products.description || '', `%${search}%`)
          )
        );
      }

      // Execute query with conditions with safe sorting
      let productsQuery;

      // Handle sorting based on the column name
      if (sortBy === 'name') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset,
          orderBy: sortOrder === 'asc' ? asc(schema.products.name) : desc(schema.products.name),
        });
      } else if (sortBy === 'price') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset,
          orderBy: sortOrder === 'asc' ? asc(schema.products.price) : desc(schema.products.price),
        });
      } else if (sortBy === 'createdAt') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset,
          orderBy: sortOrder === 'asc' ? asc(schema.products.createdAt) : desc(schema.products.createdAt),
        });
      } else if (sortBy === 'strength') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset,
          orderBy: sortOrder === 'asc' ? asc(schema.products.strength) : desc(schema.products.strength),
        });
      } else {
        // Default to name if the specified column doesn't exist
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset,
          orderBy: sortOrder === 'asc' ? asc(schema.products.name) : desc(schema.products.name),
        });
      }

      // For the total count query, we need to handle the where clause differently
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const totalQuery = db.select({ count: count() })
        .from(schema.products)
        .where(whereClause);

      const [products, totalResult] = await Promise.all([productsQuery, totalQuery]);

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      // Get available filters
      const availableFilters = await this.getAvailableFilters(includeInactive);

      return {
        products,
        pagination: { page, limit, total, totalPages },
        filters: { category, flavor, strength, minPrice, maxPrice, search },
        availableFilters,
        sorting: { sortBy, sortOrder },
      };
    } catch (error) {
      logger.error('Error getting products', { options, error });
      return {
        products: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        filters: {},
        availableFilters: {},
        sorting: {},
      };
    }
  }
  async getAvailableFilters(includeInactive = false): Promise<Record<string, unknown>> {
    try {
      logger.info('Getting available filters', { includeInactive });

      // Build where condition for active products
      const whereCondition = includeInactive ? undefined : eq(schema.products.isActive, true);

      // Get unique categories
      const categoriesQuery = db
        .selectDistinct({ category: schema.products.category })
        .from(schema.products)
        .where(whereCondition)
        .orderBy(asc(schema.products.category));

      // Get unique flavors
      const flavorsQuery = db
        .selectDistinct({ flavor: schema.products.flavor })
        .from(schema.products)
        .where(
          and(
            whereCondition || undefined,
            isNotNull(schema.products.flavor)
          )
        )
        .orderBy(asc(schema.products.flavor));

      // Get unique strengths
      const strengthsQuery = db
        .selectDistinct({ strength: schema.products.strength })
        .from(schema.products)
        .where(
          and(
            whereCondition || undefined,
            isNotNull(schema.products.strength)
          )
        )
        .orderBy(asc(schema.products.strength));

      // Get min and max prices
      const priceRangeQuery = db
        .select({
          minPrice: sql<string>`MIN(${schema.products.price})`,
          maxPrice: sql<string>`MAX(${schema.products.price})`
        })
        .from(schema.products)
        .where(whereCondition);

      // Execute all queries in parallel
      const [categories, flavors, strengths, priceRange] = await Promise.all([
        categoriesQuery,
        flavorsQuery,
        strengthsQuery,
        priceRangeQuery
      ]);

      // Format the results
      return {
        categories: categories
          .filter(c => c.category !== null)
          .map(c => c.category),
        flavors: flavors
          .filter(f => f.flavor !== null)
          .map(f => f.flavor),
        strengths: strengths
          .filter(s => s.strength !== null)
          .map(s => s.strength),
        priceRange: priceRange.length > 0 ? {
          min: parseFloat(priceRange[0].minPrice || '0'),
          max: parseFloat(priceRange[0].maxPrice || '0')
        } : { min: 0, max: 0 }
      };
    } catch (error) {
      logger.error('Error getting available filters', { error });
      return { categories: [], flavors: [], strengths: [], priceRange: { min: 0, max: 0 } };
    }
  }
  async createProduct(
    productData: Omit<ProductSelect, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProductSelect> {
    try {
      logger.info('Creating new product', { productData });

      // Insert the product
      const insertedProducts = await db
        .insert(schema.products)
        .values({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          flavor: productData.flavor,
          strength: productData.strength,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice,
          imageUrl: productData.imageUrl,
          isActive: productData.isActive ?? true,
        })
        .returning();

      if (!insertedProducts || insertedProducts.length === 0) {
        throw new Error('Failed to create product');
      }

      const newProduct = insertedProducts[0];

      // Invalidate caches
      await this.invalidateProductCaches();

      logger.info('Product created successfully', { productId: newProduct.id });

      return newProduct;
    } catch (error) {
      logger.error('Error creating product', { error, productData });
      throw new Error('Failed to create product');
    }
  }
  async updateProduct(
    productId: number,
    updates: Partial<Omit<ProductSelect, 'id' | 'createdAt'>>
  ): Promise<ProductSelect> {
    try {
      logger.info('Updating product', { productId, updates });

      // Check if product exists
      const existingProduct = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
      });

      if (!existingProduct) {
        throw new Error(`Product not found with ID: ${productId}`);
      }

      // Update the product
      const updatedProducts = await db
        .update(schema.products)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, productId))
        .returning();

      if (!updatedProducts || updatedProducts.length === 0) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = updatedProducts[0];

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      logger.info('Product updated successfully', { productId });

      return updatedProduct;
    } catch (error) {
      logger.error('Error updating product', { error, productId, updates });
      throw new Error('Failed to update product');
    }
  }
  async deleteProduct(_productId: number): Promise<boolean> {
    console.warn('deleteProduct not implemented');
    return false;
  }
  async getProductVariations(
    productId: number,
    includeInactive: boolean = false
  ): Promise<ProductVariationSelect[]> {
    try {
      logger.info(`Getting product variations for product ID: ${productId}, includeInactive: ${includeInactive}`);

      // Build the query conditions
      const conditions = [eq(schema.productVariations.productId, productId)];

      // Only include active variations if specified
      if (!includeInactive) {
        conditions.push(eq(schema.productVariations.isActive, true));
      }

      // Get the variations
      const variations = await db.query.productVariations.findMany({
        where: and(...conditions),
        orderBy: [asc(schema.productVariations.name)],
      });

      return variations;
    } catch (error) {
      logger.error(`Error getting product variations for product ID: ${productId}`, { error });
      return [];
    }
  }
  async getVariationById(variationId: number): Promise<ProductVariationSelect | null> {
    try {
      logger.info(`Getting variation by ID: ${variationId}`);

      const variation = await db.query.productVariations.findFirst({
        where: eq(schema.productVariations.id, variationId),
      });

      return variation || null;
    } catch (error) {
      logger.error(`Error getting variation by ID: ${variationId}`, { error });
      return null;
    }
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
    // Use transaction if provided
    const executor = params.transaction || db;

    try {
      logger.info('Updating inventory', { params });

      const {
        stockLevelId,
        productVariationId,
        locationId,
        changeQuantity,
        type,
        referenceId,
        referenceType,
        notes,
        userId
      } = params;

      if (!stockLevelId && (!productVariationId || !locationId)) {
        throw new Error('Either stockLevelId or both productVariationId and locationId must be provided');
      }

      // Get the stock level
      let stockLevel: typeof schema.stockLevels.$inferSelect | null = null;

      if (stockLevelId) {
        stockLevel = await executor.query.stockLevels.findFirst({
          where: eq(schema.stockLevels.id, stockLevelId),
        }) || null;
      } else if (productVariationId && locationId) {
        stockLevel = await executor.query.stockLevels.findFirst({
          where: and(
            eq(schema.stockLevels.productVariationId, productVariationId),
            eq(schema.stockLevels.locationId, locationId)
          ),
        }) || null;
      }

      if (!stockLevel) {
        // If stock level doesn't exist and we have a product variation ID, create it
        if (productVariationId && locationId) {
          // Get the product ID from the variation
          const variation = await executor.query.productVariations.findFirst({
            where: eq(schema.productVariations.id, productVariationId),
            columns: { productId: true },
          });

          if (!variation) {
            throw new Error(`Product variation not found with ID: ${productVariationId}`);
          }

          // Create a new stock level
          const insertedStockLevels = await executor
            .insert(schema.stockLevels)
            .values({
              productId: variation.productId,
              productVariationId,
              locationId,
              quantity: Math.max(0, changeQuantity), // Only allow positive initial quantity
              reservedQuantity: 0,
            })
            .returning();

          if (!insertedStockLevels || insertedStockLevels.length === 0) {
            throw new Error('Failed to create stock level');
          }

          stockLevel = insertedStockLevels[0];
        } else {
          throw new Error('Stock level not found');
        }
      }

      // Calculate new quantity
      const newQuantity = Math.max(0, stockLevel.quantity + changeQuantity);

      // Update the stock level
      const updatedStockLevels = await executor
        .update(schema.stockLevels)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(schema.stockLevels.id, stockLevel.id))
        .returning();

      if (!updatedStockLevels || updatedStockLevels.length === 0) {
        throw new Error('Failed to update stock level');
      }

      // Record the stock movement
      await executor
        .insert(schema.stockMovements)
        .values({
          productId: stockLevel.productId,
          productVariationId: stockLevel.productVariationId,
          locationId: stockLevel.locationId,
          quantity: changeQuantity,
          type,
          referenceId,
          referenceType,
          notes,
          createdBy: userId,
        });

      // Invalidate caches
      if (stockLevel.productVariationId) {
        await this.invalidateVariationCache(stockLevel.productVariationId, stockLevel.productId);
      } else {
        await this.invalidateProductCaches(stockLevel.productId);
      }

      logger.info('Inventory updated successfully', {
        stockLevelId: stockLevel.id,
        newQuantity,
        changeQuantity,
      });

      return true;
    } catch (error) {
      logger.error('Error updating inventory', { error, params });
      return false;
    }
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
