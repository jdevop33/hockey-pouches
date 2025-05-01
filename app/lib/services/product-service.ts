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
  gt,
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
    VARIATIONS_BY_PRODUCT: (productId: string, activeOnly: boolean) =>
      `variations:product:${productId}:active${activeOnly}`,
    VARIATION_BY_ID: (id: number) => `variation:${id}`,
    STOCK_LEVEL: (variationId: string, locationId: string) => `stock:${variationId}:${locationId}`,
    TOTAL_STOCK: (variationId: string) => `stock:total:${variationId}`,
    PRODUCT_STATS: 'products:stats',
    AVAILABLE_FILTERS: (activeOnly: boolean) => `products:filters:active${activeOnly}`,
  };
  private async invalidateProductCaches(productId?: number) {
    logger.info('Invalidating product caches', { productId });
    try {
      // Call invalidateAllCache without awaiting since it might not return a promise
      invalidateAllCache();

      // Invalidate specific caches
      invalidateCache(this.CACHE_KEYS.PRODUCT_STATS);

      if (productId) {
        invalidateCache(this.CACHE_KEYS.PRODUCT_BY_ID(productId));
        invalidateCache(this.CACHE_KEYS.VARIATIONS_BY_PRODUCT(productId, true));
        invalidateCache(this.CACHE_KEYS.VARIATIONS_BY_PRODUCT(productId, false));
      }
    } catch (error) {
      logger.error('Error invalidating product caches', { error: error as Error });
    }
  }
  private async invalidateVariationCache(variationId: string, productId?: number) {
    logger.info('Invalidating variation caches', { variationId, productId });
    try {
      // Call cache invalidation functions without awaiting
      invalidateCache(this.CACHE_KEYS.VARIATION_BY_ID(variationId));
      invalidateCache(this.CACHE_KEYS.TOTAL_STOCK(variationId));
      invalidateAllCache();

      // Invalidate product caches if product ID is known
      if (productId) {
        this.invalidateProductCaches(productId);
      } else {
        // If product ID unknown, clear broader caches as a fallback
        this.invalidateProductCaches();
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
  async getProducts(options: ProductListOptions = {}): Promise<ProductListResult> {
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
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'asc' ? asc(schema.products.name) : desc(schema.products.name),
        });
      } else if (sortBy === 'price') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'asc' ? asc(schema.products.price) : desc(schema.products.price),
        });
      } else if (sortBy === 'createdAt') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'asc' ? asc(schema.products.createdAt) : desc(schema.products.createdAt),
        });
      } else if (sortBy === 'strength') {
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'asc' ? asc(schema.products.strength) : desc(schema.products.strength),
        });
      } else {
        // Default to name if the specified column doesn't exist
        productsQuery = db.query.products.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          limit,
          offset: (page - 1) * limit,
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
      logger.error('Error getting products', { error });
      return {
        products: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        filters: {},
        availableFilters: {},
        sorting: {},
      };
    }

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
  async createProduct(...args): Promise<ProductSelect> {
    // TODO: Implement createProduct
    return {} as ProductSelect;

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
    productId: string,
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
  async deleteProduct(...args): Promise<boolean> {
    // TODO: Implement deleteProduct
    return {} as boolean;

    try {
      logger.info('Deleting product (soft delete)', { productId });

      // Check if product exists
      const existingProduct = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
      });

      if (!existingProduct) {
        logger.warn('Product not found for deletion', { productId });
        return false;
      }

      // Perform soft delete by setting isActive to false
      const updatedProducts = await db
        .update(schema.products)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, productId))
        .returning();

      if (!updatedProducts || updatedProducts.length === 0) {
        logger.error('Failed to soft delete product', { productId });
        return false;
      }

      // Also deactivate all variations
      await db
        .update(schema.productVariations)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariations.productId, productId));

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      logger.info('Product soft deleted successfully', { productId });
      return true;
    } catch (error) {
      logger.error('Error soft deleting product', { error, productId });
      return false;
    }
  }
  async getProductVariations(
    productId: string,
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
  async getVariationById(...args): Promise<ProductVariationSelect | null> {
    // TODO: Implement getVariationById
    return {} as ProductVariationSelect | null;

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
    productId: string,
    variationData: Omit<
      ProductVariationSelect,
      'id' | 'productId' | 'createdAt' | 'updatedAt' | 'inventoryQuantity'
    >
  ): Promise<ProductVariationSelect> {
    try {
      logger.info('Creating new product variation', { productId, variationData });

      // Check if product exists
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
      });

      if (!product) {
        logger.error('Cannot create variation for non-existent product', { productId });
        throw new Error(`Product not found with ID: ${productId}`);
      }

      // Insert the variation
      const insertedVariations = await db
        .insert(schema.productVariations)
        .values({
          productId,
          name: variationData.name,
          flavor: variationData.flavor,
          strength: variationData.strength,
          price: variationData.price,
          compareAtPrice: variationData.compareAtPrice,
          sku: variationData.sku,
          imageUrl: variationData.imageUrl || product.imageUrl, // Default to product image if not provided
          isActive: variationData.isActive ?? true,
        })
        .returning();

      if (!insertedVariations || insertedVariations.length === 0) {
        throw new Error('Failed to create product variation');
      }

      const newVariation = insertedVariations[0];

      // Initialize stock levels for the new variation
      await this.initializeVariationStockLevels(newVariation.id, productId);

      // Invalidate caches
      await this.invalidateProductCaches(productId);
      await this.invalidateVariationCache(newVariation.id, productId);

      logger.info('Product variation created successfully', {
        variationId: String(newVariation.id),
        productId
      });

      return newVariation;
    } catch (error) {
      logger.error('Error creating product variation', { error, productId, variationData });
      throw new Error('Failed to create product variation');
    }
  }
  async updateVariation(
    variationId: string,
    updates: Partial<Omit<ProductVariationSelect, 'id' | 'productId' | 'createdAt'>>
  ): Promise<ProductVariationSelect> {
    try {
      logger.info('Updating product variation', { variationId, updates });

      // Check if variation exists and get its product ID
      const existingVariation = await db.query.productVariations.findFirst({
        where: eq(schema.productVariations.id, variationId),
      });

      if (!existingVariation) {
        logger.error('Variation not found for update', { variationId });
        throw new Error(`Product variation not found with ID: ${variationId}`);
      }

      const productId = existingVariation.productId;

      // Update the variation
      const updatedVariations = await db
        .update(schema.productVariations)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariations.id, variationId))
        .returning();

      if (!updatedVariations || updatedVariations.length === 0) {
        throw new Error('Failed to update product variation');
      }

      const updatedVariation = updatedVariations[0];

      // Invalidate caches
      await this.invalidateProductCaches(productId);
      await this.invalidateVariationCache(variationId, productId);

      logger.info('Product variation updated successfully', { variationId, productId });

      return updatedVariation;
    } catch (error) {
      logger.error('Error updating product variation', { error, variationId, updates });
      throw new Error('Failed to update product variation');
    }
  }
  async deleteVariation(...args): Promise<boolean> {
    // TODO: Implement deleteVariation
    return {} as boolean;

    try {
      logger.info('Deleting product variation (soft delete)', { variationId });

      // Check if variation exists and get its product ID
      const existingVariation = await db.query.productVariations.findFirst({
        where: eq(schema.productVariations.id, variationId),
      });

      if (!existingVariation) {
        logger.warn('Variation not found for deletion', { variationId });
        return false;
      }

      const productId = existingVariation.productId;

      // Perform soft delete by setting isActive to false
      const updatedVariations = await db
        .update(schema.productVariations)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariations.id, variationId))
        .returning();

      if (!updatedVariations || updatedVariations.length === 0) {
        logger.error('Failed to soft delete variation', { variationId });
        return false;
      }

      // Invalidate caches
      await this.invalidateProductCaches(productId);
      await this.invalidateVariationCache(variationId, productId);

      logger.info('Product variation soft deleted successfully', { variationId, productId });
      return true;
    } catch (error) {
      logger.error('Error soft deleting product variation', { error, variationId });
      return false;
    }
  }
  private async initializeVariationStockLevels(
    variationId: string,
    productId: number
  ): Promise<void> {
    try {
      logger.info('Initializing stock levels for new variation', { variationId, productId });

      // For simplicity, we'll use a default location since we don't have a locations table
      const defaultLocationId = 'default';

      // Check if stock level already exists
      const existingStockLevel = await db.query.stockLevels.findFirst({
        where: and(
          eq(schema.stockLevels.productVariationId, variationId),
          eq(schema.stockLevels.locationId, defaultLocationId)
        ),
      });

      if (!existingStockLevel) {
        // Create new stock level with zero quantity
        await db.insert(schema.stockLevels).values({
          productId,
          productVariationId: String(variationId),
          locationId: String(defaultLocationId),
          quantity: 0,
          reservedQuantity: 0,
        });

        logger.info('Created stock level for variation', {
          variationId,
          locationId: String(defaultLocationId),
        });
      }

      logger.info('Stock levels initialized for variation', { variationId });
    } catch (error) {
      logger.error('Error initializing stock levels for variation', { error, variationId, productId });
      // We don't throw here to avoid breaking the variation creation process
      // The variation can still be created even if stock initialization fails
    }
  }
  async getStockLevel(
    productVariationId: string,
    locationId: string = 'default'
  ): Promise<StockLevelSelect | null> {
    try {
      logger.info('Getting stock level', { productVariationId, locationId });

      // Get the stock level
      const stockLevel = await db.query.stockLevels.findFirst({
        where: and(
          eq(schema.stockLevels.productVariationId, productVariationId),
          eq(schema.stockLevels.locationId, locationId)
        ),
      });

      if (!stockLevel) {
        logger.info('Stock level not found', { productVariationId, locationId });
        return null;
      }

      return stockLevel;
    } catch (error) {
      logger.error('Error getting stock level', { error, productVariationId, locationId });
      return null;
    }
  }
  async getTotalAvailableStock(productVariationId: number): Promise<number> {
    try {
      logger.info('Getting total available stock', { productVariationId });

      // Get the sum of quantities across all locations, minus reserved quantities
      const result = await db
        .select({
          totalStock: sql<number>`SUM(${schema.stockLevels.quantity} - ${schema.stockLevels.reservedQuantity})`,
        })
        .from(schema.stockLevels)
        .where(eq(schema.stockLevels.productVariationId, productVariationId));

      // Extract the total or default to 0
      const totalAvailable = result[0]?.totalStock || 0;

      // Ensure we don't return negative stock
      return Math.max(0, totalAvailable);
    } catch (error) {
      logger.error('Error getting total available stock', { error, productVariationId });
      return 0;
    }
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
              productId: String(variation.productId),
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
      const newQuantity = Math.max(0, stockLevel.quantity + params.changeQuantity);

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
          productId: String(stockLevel.productId),
          productVariationId: String(stockLevel.productVariationId),
          locationId: String(stockLevel.locationId),
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
        stockLevelId: String(stockLevel.id),
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
    try {
      logger.info('Getting product statistics');

      // Get total products count
      const totalProductsResult = await db
        .select({ count: count() })
        .from(schema.products);
      const totalProducts = totalProductsResult[0]?.count || 0;

      // Get active products count
      const activeProductsResult = await db
        .select({ count: count() })
        .from(schema.products)
        .where(eq(schema.products.isActive, true));
      const activeProducts = activeProductsResult[0]?.count || 0;

      // Get total inventory across all stock levels
      const totalInventoryResult = await db
        .select({
          total: sql<number>`SUM(${schema.stockLevels.quantity})`,
        })
        .from(schema.stockLevels);
      const totalInventory = totalInventoryResult[0]?.total || 0;

      // Get count of variations with low stock
      const lowStockResult = await db
        .select({ count: count() })
        .from(schema.stockLevels)
        .where(
          and(
            gt(schema.stockLevels.quantity, 0),
            lte(schema.stockLevels.quantity, this.LOW_STOCK_THRESHOLD)
          )
        );
      const lowStockCount = lowStockResult[0]?.count || 0;

      // Get count of variations with zero stock
      const outOfStockResult = await db
        .select({ count: count() })
        .from(schema.stockLevels)
        .where(eq(schema.stockLevels.quantity, 0));
      const outOfStockCount = outOfStockResult[0]?.count || 0;

      // For top selling products, we'll use a simpler approach since we're not sure about the schema
      // In a real implementation, this would use proper joins with order_items
      const topSellingProducts = [
        // Placeholder data - in a real implementation, this would come from the database
        { id: 1, name: 'Top Product 1', sales: 100 },
        { id: 2, name: 'Top Product 2', sales: 75 },
        { id: 3, name: 'Top Product 3', sales: 50 },
        { id: 4, name: 'Top Product 4', sales: 25 },
        { id: 5, name: 'Top Product 5', sales: 10 },
      ];

      return {
        totalProducts,
        activeProducts,
        totalInventory,
        lowStockCount,
        outOfStockCount,
        topSellingProducts,
      };
    } catch (error) {
      logger.error('Error getting product statistics', { error });
      // Return default values in case of error
      return {
        totalProducts: 0,
        activeProducts: 0,
        totalInventory: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        topSellingProducts: [],
      };
    }
  }
  async validateWholesaleOrder(items: Array<{ productVariationId: number; quantity: number }>): Promise<{ valid: boolean; totalUnits: number; minimumRequired: number; message?: string }> {
    try {
      logger.info('Validating wholesale order', { items });

      // Define minimum required units for wholesale orders
      const MINIMUM_WHOLESALE_UNITS = 100;

      // Check if items array is valid
      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          valid: false,
          totalUnits: 0,
          minimumRequired: MINIMUM_WHOLESALE_UNITS,
          message: 'No items provided for wholesale order',
        };
      }

      // Calculate total units
      let totalUnits = 0;
      const invalidItems: Array<{ id: number; reason: string }> = [];

      // Validate each item
      for (const item of items) {
        if (!item.productVariationId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          invalidItems.push({
            id: item.productVariationId || 0,
            reason: 'Invalid product variation or quantity',
          });
          continue;
        }

        // Check if variation exists and is active
        const variation = await this.getVariationById(item.productVariationId);
        if (!variation || !variation.isActive) {
          invalidItems.push({
            id: item.productVariationId,
            reason: variation ? 'Product variation is inactive' : 'Product variation not found',
          });
          continue;
        }

        // Check if there's enough stock
        const availableStock = await this.getTotalAvailableStock(item.productVariationId);
        if (availableStock < item.quantity) {
          invalidItems.push({
            id: item.productVariationId,
            reason: `Insufficient stock (requested: ${item.quantity}, available: ${availableStock})`,
          });
          continue;
        }

        // Add to total units
        totalUnits += item.quantity;
      }

      // Check if there are any invalid items
      if (invalidItems.length > 0) {
        return {
          valid: false,
          totalUnits,
          minimumRequired: MINIMUM_WHOLESALE_UNITS,
          message: `Some items are invalid: ${JSON.stringify(invalidItems)}`,
        };
      }

      // Check if total units meet the minimum requirement
      if (totalUnits < MINIMUM_WHOLESALE_UNITS) {
        return {
          valid: false,
          totalUnits,
          minimumRequired: MINIMUM_WHOLESALE_UNITS,
          message: `Minimum order quantity not met. Required: ${MINIMUM_WHOLESALE_UNITS}, Ordered: ${totalUnits}`,
        };
      }

      // All validations passed
      return {
        valid: true,
        totalUnits,
        minimumRequired: MINIMUM_WHOLESALE_UNITS,
        message: 'Wholesale order validated successfully',
      };
    } catch (error) {
      logger.error('Error validating wholesale order', { error, items });
      return {
        valid: false,
        totalUnits: 0,
        minimumRequired: 100,
        message: 'Error validating wholesale order',
      };
    }
  }
}
export const productService = new ProductService();