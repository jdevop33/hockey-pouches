// app/lib/services/product-service.ts (Exporting types)
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq, and, or, asc, desc, gte, lte, gt, ilike, isNotNull, sql, count } from 'drizzle-orm';
import { invalidateCache, invalidateAllCache } from '@/lib/dbOptimization';
import { logger } from '@/lib/logger';
import { type DbTransaction } from '@/lib/db-types';
import { v4 as uuidv4 } from 'uuid';
// --- Export needed types ---
export type ProductSelect = typeof schema.products.$inferSelect;
export type ProductInsert = typeof schema.products.$inferInsert;
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

      if (productId !== undefined) {
        invalidateCache(this.CACHE_KEYS.PRODUCT_BY_ID(productId));
        // Ensure productId is string for VARIATIONS_BY_PRODUCT
        const productIdStr = String(productId);
        invalidateCache(this.CACHE_KEYS.VARIATIONS_BY_PRODUCT(productIdStr, true));
        invalidateCache(this.CACHE_KEYS.VARIATIONS_BY_PRODUCT(productIdStr, false));
      }
    } catch (error) {
      logger.error('Error invalidating product caches', { error: error as Error });
    }
  }
  private async invalidateVariationCache(variationId: string, productId?: number) {
    logger.info('Invalidating variation caches', { variationId, productId });
    try {
      // Call cache invalidation functions without awaiting
      invalidateCache(this.CACHE_KEYS.VARIATION_BY_ID(Number(variationId))); // Ensure variationId is number
      invalidateCache(this.CACHE_KEYS.TOTAL_STOCK(variationId));
      invalidateAllCache();

      // Invalidate product caches if product ID is known
      if (productId !== undefined) {
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
  async getProductById(productId: string): Promise<ProductWithVariations | null> {
    try {
      logger.info(`Getting product by ID: ${productId}`);
      const productIdNum = parseInt(productId, 10);
      if (isNaN(productIdNum)) {
        logger.warn('Invalid product ID format', { productId });
        return null;
      }

      // Ensure db is available
      if (!db) throw new Error('Database connection not available.');

      // Get the product
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productIdNum), // Use number ID
      });

      if (!product) {
        logger.info(`Product not found with ID: ${productId}`);
        return null;
      }

      // Get active variations for the product
      const variations = await this.getProductVariations(productId, true);

      // Ensure the returned object matches ProductWithVariations exactly
      const result: ProductWithVariations = {
        ...product,
        variations, // variations is already ProductVariationSelect[]
      };
      return result;
    } catch (error) {
      logger.error(`Error getting product by ID: ${productId}`, { error });
      return null; // Return null on error as per function signature
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
        sortOrder = 'asc',
      } = options;

      logger.info('Getting products with options', { options });

      // Ensure db is available
      if (!db) throw new Error('Database connection not available.');

      // Build where conditions
      const conditions = [];

      if (!includeInactive) {
        conditions.push(eq(schema.products.isActive, true));
      }
      if (category !== undefined && category !== null) {
        conditions.push(eq(schema.products.category, category));
      }
      if (flavor !== undefined && flavor !== null) {
        logger.warn(
          'Flavor filtering requires joining variations - not yet implemented in basic getProducts'
        );
      }
      if (strength !== undefined && strength !== null) {
        logger.warn(
          'Strength filtering requires joining variations - not yet implemented in basic getProducts'
        );
      }
      if (minPrice !== undefined && minPrice !== null) {
        conditions.push(gte(schema.products.price, String(minPrice))); // Ensure price is string
      }
      if (maxPrice !== undefined && maxPrice !== null) {
        conditions.push(lte(schema.products.price, String(maxPrice))); // Ensure price is string
      }
      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(
          or(
            ilike(schema.products.name, searchPattern),
            schema.products.description
              ? ilike(schema.products.description, searchPattern)
              : undefined
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Determine sorting column and order
      let orderByClause;
      const sortCol =
        sortBy === 'createdAt'
          ? schema.products.createdAt
          : sortBy === 'price'
            ? schema.products.price
            : schema.products.name; // Default to name

      if (sortCol) {
        // Check if a valid sort column was determined
        orderByClause = sortOrder === 'asc' ? asc(sortCol) : desc(sortCol);
      }

      // Fetch total count
      const totalResult = await db
        .select({ count: count() })
        .from(schema.products)
        .where(whereClause);
      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      // Fetch paginated products
      const products = await db.query.products.findMany({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        orderBy: orderByClause ? [orderByClause] : undefined,
      });

      // Fetch available filters (can be complex, placeholder for now)
      const availableFilters = await this.getAvailableFilters(includeInactive);

      const result: ProductListResult = {
        products: products as ProductSelect[], // Cast needed if variations aren't included
        pagination: { page, limit, total, totalPages },
        filters: { category, flavor, strength, minPrice, maxPrice, search },
        availableFilters,
        sorting: { sortBy, sortOrder },
      };

      return result;
    } catch (error) {
      logger.error('Error getting products:', { options, error });
      // Return a default empty result on error
      return {
        products: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        filters: options,
        availableFilters: {},
        sorting: { sortBy: options.sortBy, sortOrder: options.sortOrder },
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
        .where(and(whereCondition || undefined, isNotNull(schema.products.flavor)))
        .orderBy(asc(schema.products.flavor));

      // Get unique strengths
      const strengthsQuery = db
        .selectDistinct({ strength: schema.products.strength })
        .from(schema.products)
        .where(and(whereCondition || undefined, isNotNull(schema.products.strength)))
        .orderBy(asc(schema.products.strength));

      // Get min and max prices
      const priceRangeQuery = db
        .select({
          minPrice: sql<string>`MIN(${schema.products.price})`,
          maxPrice: sql<string>`MAX(${schema.products.price})`,
        })
        .from(schema.products)
        .where(whereCondition);

      // Execute all queries in parallel
      const [categories, flavors, strengths, priceRange] = await Promise.all([
        categoriesQuery,
        flavorsQuery,
        strengthsQuery,
        priceRangeQuery,
      ]);

      // Format the results
      return {
        categories: categories.filter(c => c.category !== null).map(c => c.category),
        flavors: flavors.filter(f => f.flavor !== null).map(f => f.flavor),
        strengths: strengths.filter(s => s.strength !== null).map(s => s.strength),
        priceRange:
          priceRange.length > 0
            ? {
                min: parseFloat(priceRange[0].minPrice || '0'),
                max: parseFloat(priceRange[0].maxPrice || '0'),
              }
            : { min: 0, max: 0 },
      };
    } catch (error) {
      logger.error('Error getting available filters', { error });
      return { categories: [], flavors: [], strengths: [], priceRange: { min: 0, max: 0 } };
    }
  }
  async createProduct(productData: ProductInsert): Promise<ProductSelect> {
    // TODO: Implement createProduct
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
      const productIdNum = parseInt(productId, 10);
      if (isNaN(productIdNum)) {
        throw new Error(`Invalid product ID format: ${productId}`);
      }

      // Check if product exists
      const existingProduct = await db.query.products.findFirst({
        where: eq(schema.products.id, productIdNum), // Use number ID
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
        .where(eq(schema.products.id, productIdNum)) // Use number ID
        .returning();

      if (!updatedProducts || updatedProducts.length === 0) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = updatedProducts[0];

      // Invalidate caches
      await this.invalidateProductCaches(productIdNum); // Use number ID

      logger.info('Product updated successfully', { productId });

      return updatedProduct;
    } catch (error) {
      logger.error('Error updating product', { error, productId, updates });
      throw new Error('Failed to update product');
    }
  }
  async deleteProduct(productId: string): Promise<boolean> {
    // TODO: Implement deleteProduct
    try {
      logger.info('Deleting product (soft delete)', { productId });
      const productIdNum = parseInt(productId, 10);
      if (isNaN(productIdNum)) {
        logger.warn('Invalid product ID format for deletion', { productId });
        return false;
      }

      // Check if product exists
      const existingProduct = await db.query.products.findFirst({
        where: eq(schema.products.id, productIdNum), // Use number ID
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
        .where(eq(schema.products.id, productIdNum)) // Use number ID
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
        .where(eq(schema.productVariations.productId, productIdNum)); // Use number ID

      // Invalidate caches
      await this.invalidateProductCaches(productIdNum); // Use number ID

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
      logger.info(
        `Getting product variations for product ID: ${productId}, includeInactive: ${includeInactive}`
      );
      const productIdNum = parseInt(productId, 10);
      if (isNaN(productIdNum)) {
        logger.warn('Invalid product ID format for getProductVariations', { productId });
        return [];
      }

      // Build the query conditions
      const conditions = [eq(schema.productVariations.productId, productIdNum)]; // Use number ID

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
  async getVariationById(variationId: string): Promise<ProductVariationSelect | null> {
    try {
      logger.info(`Getting variation by ID: ${variationId}`);
      const variationIdNum = parseInt(variationId, 10);
      if (isNaN(variationIdNum)) {
        logger.warn('Invalid variation ID format', { variationId });
        return null;
      }

      // Ensure db is available
      if (!db) throw new Error('Database connection not available.');

      const result = await db.query.productVariations.findFirst({
        where: eq(schema.productVariations.id, variationIdNum),
      });

      return result || null;
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
      const productIdNum = parseInt(productId, 10);
      if (isNaN(productIdNum)) {
        throw new Error(`Invalid product ID format: ${productId}`);
      }

      // Check if product exists
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productIdNum), // Use number ID
      });

      if (!product) {
        logger.error('Cannot create variation for non-existent product', { productId });
        throw new Error(`Product not found with ID: ${productId}`);
      }

      // Insert the variation
      const insertedVariations = await db
        .insert(schema.productVariations)
        .values({
          productId: String(productIdNum), // Use number ID
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
      // Ensure variation ID is string for initializeVariationStockLevels
      await this.initializeVariationStockLevels(String(newVariation.id), productIdNum);

      // Invalidate caches
      await this.invalidateProductCaches(productIdNum);
      await this.invalidateVariationCache(String(newVariation.id), productIdNum);

      logger.info('Product variation created successfully', {
        variationId: newVariation.id,
        productId,
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
      const variationIdNum = parseInt(variationId, 10);
      if (isNaN(variationIdNum)) {
        throw new Error(`Invalid variation ID format: ${variationId}`);
      }

      // Check if variation exists and get its product ID
      const existingVariation = await db.query.productVariations.findFirst({
        where: eq(schema.productVariations.id, variationIdNum), // Use number ID
      });

      // Ensure existingVariation is checked before accessing properties
      if (!existingVariation) {
        logger.error('Variation not found for update', { variationId });
        throw new Error(`Product variation not found with ID: ${variationId}`);
      }

      // Add null check before accessing productId
      if (existingVariation.productId === null) {
        logger.error('Existing variation is missing product ID', { variationId });
        throw new Error(`Variation ${variationId} has no associated product ID.`);
      }
      // Force productId to be a definite number
      const productId = Number(existingVariation.productId);

      // Update the variation
      const updatedVariations = await db
        .update(schema.productVariations)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariations.id, variationIdNum)) // Use number ID
        .returning();

      if (!updatedVariations || updatedVariations.length === 0) {
        throw new Error('Failed to update product variation');
      }

      const updatedVariation = updatedVariations[0];

      // Invalidate caches with proper type handling
      await this.invalidateProductCaches(productId);
      await this.invalidateVariationCache(variationId, productId);

      logger.info('Product variation updated successfully', { variationId, productId });

      return updatedVariation;
    } catch (error) {
      logger.error('Error updating product variation', { error, variationId, updates });
      throw new Error('Failed to update product variation');
    }
  }
  async deleteVariation(variationId: string): Promise<boolean> {
    const variationIdNum = parseInt(variationId, 10);
    if (isNaN(variationIdNum)) {
      logger.warn('Invalid variation ID format for deletion', { variationId });
      return false;
    }

    // Ensure db is available
    if (!db) throw new Error('Database connection not available.');

    logger.info(`Attempting to delete variation: ${variationIdNum}`);
    try {
      return await db.transaction(async tx => {
        // 1. Check for existing stock (physical or reserved)
        const stockCheck = await tx
          .select({
            totalQuantity: sql<number>`sum(${schema.stockLevels.quantity})`.mapWith(Number),
          })
          .from(schema.stockLevels)
          .where(eq(schema.stockLevels.productVariationId, variationIdNum));

        const totalStock = stockCheck[0]?.totalQuantity ?? 0;
        if (totalStock > 0) {
          logger.warn(
            `Cannot delete variation ${variationIdNum}: Existing stock found (${totalStock})`
          );
          throw new Error(
            `Cannot delete variation with existing stock (${totalStock} units). Adjust stock first.`
          );
        }

        // 2. Get Product ID for cache invalidation *before* deleting variation
        const variationData = await tx.query.productVariations.findFirst({
          where: eq(schema.productVariations.id, variationIdNum),
          columns: { productId: true },
        });
        const productId = variationData?.productId;

        // 3. Delete stock levels (should be none based on check, but belts and braces)
        await tx
          .delete(schema.stockLevels)
          .where(eq(schema.stockLevels.productVariationId, variationIdNum));
        logger.debug(`Deleted stock levels for variation ${variationIdNum}`);

        // 4. Delete the variation itself
        const deleteResult = await tx
          .delete(schema.productVariations)
          .where(eq(schema.productVariations.id, variationIdNum))
          .returning({ id: schema.productVariations.id });

        if (deleteResult.length > 0) {
          logger.info(`Successfully deleted variation: ${variationIdNum}`);
          // Invalidate caches outside the transaction if successful
          if (productId) {
            await this.invalidateVariationCache(variationId, Number(productId));
          } else {
            await this.invalidateVariationCache(variationId);
          }
          return true;
        } else {
          logger.warn(`Variation ${variationIdNum} not found during delete attempt.`);
          return false; // Variation might have been deleted already
        }
      });
    } catch (error) {
      logger.error(`Failed to delete variation ${variationIdNum}:`, { error });
      // Rethrow specific known errors or a generic one
      if (error instanceof Error && error.message.startsWith('Cannot delete variation')) {
        throw error; // Throw the specific error about existing stock
      }
      throw new Error(
        `Failed to delete variation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  private async initializeVariationStockLevels(
    variationId: string,
    productId: number
  ): Promise<void> {
    try {
      logger.info('Initializing stock levels for new variation', { variationId, productId });
      const variationIdNum = parseInt(variationId, 10);
      if (isNaN(variationIdNum)) {
        logger.error('Invalid variation ID in initializeVariationStockLevels', { variationId });
        return; // Don't throw, but log and exit
      }

      // For simplicity, we'll use a default location since we don't have a locations table
      const defaultLocationId = 'default';

      // Check if stock level already exists
      const existingStockLevel = await db.query.stockLevels.findFirst({
        where: and(
          eq(schema.stockLevels.productVariationId, variationIdNum), // Use number ID
          eq(schema.stockLevels.locationId, defaultLocationId)
        ),
      });

      if (!existingStockLevel) {
        // Create new stock level with zero quantity
        await db.insert(schema.stockLevels).values({
          productId, // Use number ID
          productVariationId: variationIdNum, // Use number ID
          locationId: defaultLocationId,
          quantity: 0,
          reservedQuantity: 0,
        });

        logger.info('Created stock level for variation', {
          variationId,
          locationId: defaultLocationId,
        });
      }

      logger.info('Stock levels initialized for variation', { variationId });
    } catch (error) {
      logger.error('Error initializing stock levels for variation', {
        error,
        variationId,
        productId,
      });
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
      const variationIdNum = parseInt(productVariationId, 10);
      if (isNaN(variationIdNum)) {
        logger.warn('Invalid product variation ID format for getStockLevel', {
          productVariationId,
        });
        return null;
      }

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
      // Ensure db is available
      if (!db) throw new Error('Database connection not available.');

      const result = await db
        .select({
          availableStock:
            sql<number>`COALESCE(SUM(${schema.stockLevels.quantity} - ${schema.stockLevels.reservedQuantity}), 0)`.mapWith(
              Number
            ),
        })
        .from(schema.stockLevels)
        .where(eq(schema.stockLevels.productVariationId, productVariationId));

      const available = result[0]?.availableStock ?? 0;
      // Ensure we don't return negative available stock
      return Math.max(0, available);
    } catch (error) {
      logger.error('Failed to get total available stock', { productVariationId, error });
      throw new Error('Failed to calculate available stock.');
    }
  }
  async updateInventory(params: InventoryUpdateParams): Promise<boolean> {
    const {
      productVariationId,
      locationId = 'default',
      changeQuantity,
      type,
      userId,
      transaction,
      ...rest
    } = params;

    // Use provided transaction or start a new one
    const dbOrTx = transaction || db;
    if (!dbOrTx) throw new Error('Database connection/transaction not available.');

    // Define operation within a function to use with transaction if needed
    const operation = async (executor: DbTransaction | typeof db) => {
      logger.info('Updating inventory', {
        productVariationId,
        locationId,
        changeQuantity,
        type,
        userId,
      });

      if (!productVariationId) {
        throw new Error('Product Variation ID is required for inventory update.');
      }

      // Find or create stock level
      const stockLevel = await executor.query.stockLevels.findFirst({
        where: and(
          eq(schema.stockLevels.productVariationId, productVariationId),
          eq(schema.stockLevels.locationId, locationId)
        ),
      });

      let newQuantity: number;
      let newReservedQuantity: number = stockLevel?.reservedQuantity ? Number(stockLevel.reservedQuantity) : 0;
      const currentQuantity = stockLevel?.quantity ? Number(stockLevel.quantity) : 0;

      if (!stockLevel) {
        // Create stock level if it doesn't exist and change is positive
        if (Number(changeQuantity) <= 0) {
          logger.warn('Attempted to decrease stock for non-existent level', {
            productVariationId,
            locationId,
          });
          // Depending on policy, either throw error or allow (effectively doing nothing)
          throw new Error('Cannot decrease stock for a non-existent inventory record.');
          // return false; // Or silently fail
        }
        logger.info('Creating new stock level record', {
          productVariationId,
          locationId,
          initialQuantity: changeQuantity,
        });
        newQuantity = Number(changeQuantity);
        newReservedQuantity = 0;

        const variation = await executor.query.productVariations.findFirst({
          where: eq(schema.productVariations.id, productVariationId),
          columns: { productId: true },
        });
        if (!variation)
          throw new Error(
            `Product variation ${productVariationId} not found during stock level creation.`
          );

        await executor.insert(schema.stockLevels).values({
          id: uuidv4(),
          productId: variation.productId,
          productVariationId,
          locationId,
          quantity: newQuantity,
          reservedQuantity: newReservedQuantity,
        });
      } else {
        // Update existing stock level
        newQuantity = currentQuantity + Number(changeQuantity);

        // Special handling for reserved quantity (e.g., during fulfillment)
        if (type === 'Sale' || type === 'TransferOut') {
          // Assuming a 'Sale' or 'TransferOut' fulfills reserved stock first
          const changeToReserved = Math.min(Math.abs(Number(changeQuantity)), newReservedQuantity);
          if (Number(changeQuantity) < 0) {
            // Only decrease reserved for sales/transfers out
            newReservedQuantity = newReservedQuantity - changeToReserved;
          }
        }

        // Validate stock levels don't go negative
        if (newQuantity < 0) {
          throw new Error(
            `Insufficient stock: Operation would result in negative quantity (${newQuantity})`
          );
        }
        if (newReservedQuantity < 0) {
          logger.warn('Reserved quantity calculation resulted in negative, resetting to 0', {
            productVariationId,
            locationId,
          });
          newReservedQuantity = 0; // Should not happen with correct logic, but safeguard
        }

        await executor
          .update(schema.stockLevels)
          .set({
            quantity: newQuantity,
            reservedQuantity: newReservedQuantity,
            updatedAt: new Date(),
          })
          .where(eq(schema.stockLevels.id, stockLevel.id));
      }

      // Record stock movement
      await executor.insert(schema.stockMovements).values({
        id: uuidv4(),
        productId:
          stockLevel?.productId ??
          (
            await executor.query.productVariations.findFirst({
              where: eq(schema.productVariations.id, productVariationId),
              columns: { productId: true },
            })
          )?.productId ??
          0, // Fetch productId if needed
        productVariationId,
        locationId,
        quantity: Number(changeQuantity),
        type,
        referenceId: rest.referenceId,
        referenceType: rest.referenceType,
        notes: rest.notes,
        createdBy: userId,
      });

      logger.info('Inventory updated successfully', {
        productVariationId,
        locationId,
        newQuantity,
        newReservedQuantity,
      });
      return true;
    };

    try {
      // Execute the operation, either within the provided transaction or a new one
      let success: boolean;
      if (transaction) {
        success = await operation(transaction);
      } else {
        success = await db.transaction(async tx => {
          // Cast tx to the expected type
          return await operation(tx as unknown as DbTransaction);
        });
      }
      // Invalidate cache after successful operation
      if (success && productVariationId) {
        await this.invalidateVariationCache(String(productVariationId));
      }
      return success;
    } catch (error) {
      logger.error('Failed to update inventory', { params, error });
      throw new Error(
        `Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getProductStats(): Promise<ProductStats> {
    try {
      logger.info('Getting product statistics');

      // Get total products count
      const totalProductsResult = await db.select({ count: count() }).from(schema.products);
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
      throw error;
    }
  }
  async validateWholesaleOrder(
    items: Array<{ productVariationId: string; quantity: number }>
  ): Promise<{ valid: boolean; totalUnits: number; minimumRequired: number; message?: string }> {
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
      // Adjust the type to match the requirements - using number instead of potentially string ID
      const invalidItems: Array<{ id: string; reason: string }> = [];

      // Validate each item
      for (const item of items) {
        if (!item.productVariationId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          invalidItems.push({
            id: item.productVariationId || '0',
            reason: 'Invalid product variation or quantity',
          });
          continue;
        }

        // Check if variation exists and is active
        const variation = await this.getVariationById(item.productVariationId);
        if (!variation) {
          invalidItems.push({
            id: item.productVariationId,
            reason: 'Product variation not found',
          });
          continue;
        }

        if (!variation.isActive) {
          invalidItems.push({
            id: item.productVariationId,
            reason: 'Product variation is inactive',
          });
          continue;
        }

        // Check if there's enough stock
        const availableStock = await this.getTotalAvailableStock(Number(item.productVariationId));
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
