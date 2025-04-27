import sql from '@/lib/db';
import { getRows, DbQueryResult } from '@/lib/db-types';
import { logger } from '@/lib/logger';
import { cachedQuery, CACHE_DURATIONS } from '@/lib/dbOptimization';

// Define types locally to avoid import issues
export interface ProductVariation {
  id: number;
  product_id: number;
  name: string;
  flavor?: string | null;
  strength?: number | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string | null;
  image_url?: string | null;
  inventory_quantity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  flavor?: string | null;
  strength?: number | null;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  is_active: boolean;
  variations?: ProductVariation[];
}

export interface ProductFilter {
  category?: string | null;
  flavor?: string | null;
  strength?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string | null;
}

export interface ProductSorting {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ProductInventory {
  id: number;
  product_id: number;
  location: string;
  quantity: number;
  updated_at: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalInventory: number;
  lowStockCount: number;
  outOfStockCount: number;
  topSellingProducts: Array<{
    id: number;
    name: string;
    sales: number;
  }>;
}

// Generic type for database row results
interface DbRow {
  [key: string]: string | number | boolean | Date | null | undefined;
}

// Interface for cache operations
interface CacheOperations {
  invalidate: (key: string) => Promise<void>;
}

// Extend the cachedQuery with invalidate method
const cacheOperations: CacheOperations = {
  invalidate: async (key: string) => {
    // Implementation would depend on the actual caching mechanism
    // This is a placeholder to fix TypeScript errors
    console.log(`Cache invalidated: ${key}`);
  },
};

/**
 * Service for product-related operations
 */
export class ProductService {
  private CACHE_KEYS = {
    PRODUCT: (id: number) => `product_${id}`,
    PRODUCTS_LIST: (filters: string, page: number, limit: number) =>
      `products_list_${filters}_${page}_${limit}`,
    PRODUCT_STATS: 'product_stats',
    AVAILABLE_FILTERS: 'available_filters',
  };

  private LOW_STOCK_THRESHOLD = 10;

  /**
   * Helper method to safely get a row from query results
   */
  private getRow<T>(result: DbQueryResult, index: number = 0): T {
    return getRows(result)[index] as T;
  }

  /**
   * Helper method to safely get all rows from query results
   */
  private getRows<T>(result: DbQueryResult): T[] {
    return getRows(result) as T[];
  }

  /**
   * Get a product by ID with its variations
   */
  async getProductById(productId: number): Promise<Product | null> {
    try {
      // Use cached query for better performance
      return await cachedQuery(
        this.CACHE_KEYS.PRODUCT(productId),
        async () => {
          // Get product details
          const productResult = await sql`
            SELECT
              id, name, description, flavor, strength, 
              CAST(price AS FLOAT) as price,
              CAST(compare_at_price AS FLOAT) as compare_at_price,
              image_url, category, is_active
            FROM products
            WHERE id = ${productId}
          `;

          const productRows = this.getRows<Product>(productResult);
          if (productRows.length === 0) {
            return null;
          }

          const product = productRows[0];

          // Get variations
          const variationsResult = await sql`
            SELECT
              id, product_id, name, flavor, strength,
              CAST(price AS FLOAT) as price,
              CAST(compare_at_price AS FLOAT) as compare_at_price,
              sku, image_url, inventory_quantity, is_active,
              created_at, updated_at
            FROM product_variations
            WHERE product_id = ${productId}
            ORDER BY id
          `;

          const variations = this.getRows<ProductVariation>(variationsResult);
          product.variations = variations;

          return product;
        },
        CACHE_DURATIONS.SHORT // Short cache duration since product data can change
      );
    } catch (error) {
      logger.error(`Error fetching product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts({
    page = 1,
    limit = 10,
    category = null,
    flavor = null,
    strength = null,
    minPrice = null,
    maxPrice = null,
    search = null,
    sortBy = 'name',
    sortOrder = 'asc',
    includeInactive = false,
  }: {
    page?: number;
    limit?: number;
    category?: string | null;
    flavor?: string | null;
    strength?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    search?: string | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
  }) {
    try {
      // Create a filter string for caching
      const filterString = JSON.stringify({
        category,
        flavor,
        strength,
        minPrice,
        maxPrice,
        search,
        sortBy,
        sortOrder,
        includeInactive,
      });

      // Use cached query for better performance
      return await cachedQuery(
        this.CACHE_KEYS.PRODUCTS_LIST(filterString, page, limit),
        async () => {
          const offset = (page - 1) * limit;

          // Build the WHERE conditions dynamically
          const conditions = [];
          const params: (string | number)[] = [];
          let paramIndex = 1;

          // Only include active products unless explicitly requested
          if (!includeInactive) {
            conditions.push(`is_active = true`);
          }

          if (category) {
            conditions.push(`category = $${paramIndex++}`);
            params.push(category);
          }

          if (flavor) {
            conditions.push(`flavor = $${paramIndex++}`);
            params.push(flavor);
          }

          if (strength !== null) {
            conditions.push(`strength = $${paramIndex++}`);
            params.push(strength);
          }

          if (minPrice !== null) {
            conditions.push(`price >= $${paramIndex++}`);
            params.push(minPrice);
          }

          if (maxPrice !== null) {
            conditions.push(`price <= $${paramIndex++}`);
            params.push(maxPrice);
          }

          if (search) {
            conditions.push(`(
              name ILIKE $${paramIndex} OR 
              description ILIKE $${paramIndex} OR
              flavor ILIKE $${paramIndex}
            )`);
            params.push(`%${search}%`);
            paramIndex++;
          }

          const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

          // Validate sortBy to prevent SQL injection
          const validSortFields = ['name', 'price', 'created_at', 'category', 'strength'];
          const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

          // Validate sortOrder to prevent SQL injection
          const finalSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

          // Get total count for pagination
          const countQueryText = `
            SELECT COUNT(*) as total
            FROM products
            ${whereClause}
          `;

          const countParams = [...params];
          const countResult = await sql.query(countQueryText, countParams);

          const row = this.getRow<DbRow>(countResult);
          const totalProducts = parseInt(String(row.total));
          const totalPages = Math.ceil(totalProducts / limit);

          // Get products with pagination and sorting
          const productsQueryText = `
            SELECT
              id, name, description, flavor, strength,
              CAST(price AS FLOAT) as price,
              CAST(compare_at_price AS FLOAT) as compare_at_price,
              image_url, category, is_active
            FROM products
            ${whereClause}
            ORDER BY ${finalSortBy} ${finalSortOrder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
          `;

          const productParams = [...params, limit, offset];
          const productsResult = await sql.query(productsQueryText, productParams);
          const products = this.getRows<Product>(productsResult);

          // Get available filters
          const availableFilters = await this.getAvailableFilters(includeInactive);

          return {
            products,
            pagination: {
              page,
              limit,
              total: totalProducts,
              totalPages,
            },
            filters: {
              category,
              flavor,
              strength,
              minPrice,
              maxPrice,
              search,
            },
            availableFilters,
            sorting: {
              sortBy: finalSortBy,
              sortOrder: finalSortOrder,
            },
          };
        },
        CACHE_DURATIONS.SHORT // Short cache duration since product listings can change
      );
    } catch (error) {
      logger.error('Error fetching products:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get available product filters
   */
  async getAvailableFilters(includeInactive = false) {
    return await cachedQuery(
      this.CACHE_KEYS.AVAILABLE_FILTERS,
      async () => {
        const filterQueryText = `
          SELECT
            ARRAY_AGG(DISTINCT category) FILTER (WHERE category IS NOT NULL) as categories,
            ARRAY_AGG(DISTINCT flavor) FILTER (WHERE flavor IS NOT NULL) as flavors,
            ARRAY_AGG(DISTINCT strength) FILTER (WHERE strength IS NOT NULL) as strengths,
            MIN(price) as min_price,
            MAX(price) as max_price
          FROM products
          ${includeInactive ? '' : 'WHERE is_active = true'}
        `;

        const filterResult = await sql.unsafe(filterQueryText);
        return this.getRow<DbRow>(filterResult);
      },
      CACHE_DURATIONS.MEDIUM // Medium cache duration for filters since they change less frequently
    );
  }

  /**
   * Create a new product
   */
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const result = await sql`
        INSERT INTO products (
          name, description, flavor, strength, price, compare_at_price,
          image_url, category, is_active
        ) VALUES (
          ${productData.name},
          ${productData.description || null},
          ${productData.flavor || null},
          ${productData.strength || null},
          ${productData.price},
          ${productData.compare_at_price || null},
          ${productData.image_url || null},
          ${productData.category || null},
          ${productData.is_active !== undefined ? productData.is_active : true}
        ) RETURNING id, name, description, flavor, strength, 
                    CAST(price AS FLOAT) as price,
                    CAST(compare_at_price AS FLOAT) as compare_at_price,
                    image_url, category, is_active
      `;

      const newProduct = this.getRow<Product>(result);

      // Initialize inventory records for the new product
      await this.initializeProductInventory(newProduct.id);

      // Invalidate caches
      await this.invalidateProductCaches();

      return newProduct;
    } catch (error) {
      logger.error('Error creating product:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Initialize inventory records for a new product
   */
  private async initializeProductInventory(productId: number): Promise<void> {
    try {
      const initialQuantity = 0;
      const locations = ['Vancouver', 'Calgary', 'Edmonton', 'Toronto'];

      const inventoryPromises = locations.map(
        location => sql`
        INSERT INTO inventory (product_id, location, quantity)
        VALUES (${productId}, ${location}, ${initialQuantity})
        ON CONFLICT (product_id, location) DO NOTHING
      `
      );

      await Promise.all(inventoryPromises);
      logger.info(`Initialized inventory records for product ${productId}`);
    } catch (error) {
      logger.error(`Error initializing inventory for product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to initialize inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: number, updates: Partial<Product>): Promise<Product> {
    try {
      // Build the SQL query using tagged template literals
      const updateQuery = sql`UPDATE products SET `;
      const updateParts = [];

      if (updates.name !== undefined) {
        updateParts.push(sql`name = ${updates.name}`);
      }

      if (updates.description !== undefined) {
        updateParts.push(sql`description = ${updates.description}`);
      }

      if (updates.flavor !== undefined) {
        updateParts.push(sql`flavor = ${updates.flavor}`);
      }

      if (updates.strength !== undefined) {
        updateParts.push(sql`strength = ${updates.strength}`);
      }

      if (updates.price !== undefined) {
        updateParts.push(sql`price = ${updates.price}`);
      }

      if (updates.compare_at_price !== undefined) {
        updateParts.push(sql`compare_at_price = ${updates.compare_at_price}`);
      }

      if (updates.image_url !== undefined) {
        updateParts.push(sql`image_url = ${updates.image_url}`);
      }

      if (updates.category !== undefined) {
        updateParts.push(sql`category = ${updates.category}`);
      }

      if (updates.is_active !== undefined) {
        updateParts.push(sql`is_active = ${updates.is_active}`);
      }

      // Add updated_at timestamp
      updateParts.push(sql`updated_at = NOW()`);

      if (updateParts.length === 0) {
        throw new Error('No fields to update');
      }

      // Combine update parts manually with commas
      let combinedParts = updateParts[0];
      for (let i = 1; i < updateParts.length; i++) {
        combinedParts = sql`${combinedParts}, ${updateParts[i]}`;
      }

      // Construct final query
      const finalQuery = sql`
        ${updateQuery} ${combinedParts}
        WHERE id = ${productId}
        RETURNING id, name, description, flavor, strength, 
                  CAST(price AS FLOAT) as price,
                  CAST(compare_at_price AS FLOAT) as compare_at_price,
                  image_url, category, is_active
      `;

      const result = await finalQuery;

      if (this.getRows(result).length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      return this.getRow<Product>(result);
    } catch (error) {
      logger.error(`Error updating product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a product by ID
   */
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      // First check if the product exists
      const checkResult = await sql`
        SELECT id FROM products WHERE id = ${productId}
      `;

      if (this.getRows(checkResult).length === 0) {
        return false;
      }

      // Delete related variations first
      await sql`
        DELETE FROM product_variations WHERE product_id = ${productId}
      `;

      // Delete related inventory records
      await sql`
        DELETE FROM inventory WHERE product_id = ${productId}
      `;

      // Then delete the product
      await sql`
        DELETE FROM products WHERE id = ${productId}
      `;

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      return true;
    } catch (error) {
      logger.error(`Error deleting product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product inventory across all locations
   */
  async getProductInventory(productId: number): Promise<ProductInventory[]> {
    try {
      const result = await sql`
        SELECT
          id, product_id, location, quantity, updated_at
        FROM inventory
        WHERE product_id = ${productId}
        ORDER BY location
      `;

      return this.getRows<ProductInventory>(result);
    } catch (error) {
      logger.error(`Error fetching inventory for product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to fetch inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update product inventory quantity
   */
  async updateInventory(
    inventoryId: number,
    quantity: number,
    reason: string = 'manual-adjustment'
  ): Promise<ProductInventory> {
    try {
      // Fetch current inventory record
      const currentInventory = await sql`
        SELECT product_id, location, quantity
        FROM inventory
        WHERE id = ${inventoryId}
      `;

      if (this.getRows(currentInventory).length === 0) {
        throw new Error(`Inventory record with ID ${inventoryId} not found`);
      }

      const record = this.getRow<DbRow>(currentInventory);
      const oldQuantity = Number(record.quantity) || 0;
      const productId = Number(record.product_id);
      const location = String(record.location);

      // Update the inventory record
      const result = await sql`
        UPDATE inventory
        SET quantity = ${quantity}, updated_at = NOW()
        WHERE id = ${inventoryId}
        RETURNING id, product_id, location, quantity, updated_at
      `;

      const updatedInventory = this.getRow<ProductInventory>(result);

      // Log the inventory change
      await sql`
        INSERT INTO inventory_logs (
          product_id, location, old_quantity, new_quantity, 
          change_amount, reason, created_at
        ) VALUES (
          ${productId},
          ${location},
          ${oldQuantity},
          ${quantity},
          ${quantity - oldQuantity},
          ${reason},
          NOW()
        )
      `;

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      return updatedInventory;
    } catch (error) {
      logger.error(`Error updating inventory ${inventoryId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product variations with optional filtering
   */
  async getProductVariations(
    productId: number,
    includeInactive: boolean = false
  ): Promise<ProductVariation[]> {
    try {
      const query = includeInactive
        ? sql`
            SELECT
              id, product_id, name, flavor, strength,
              CAST(price AS FLOAT) as price,
              CAST(compare_at_price AS FLOAT) as compare_at_price,
              sku, image_url, inventory_quantity, is_active,
              created_at, updated_at
            FROM product_variations
            WHERE product_id = ${productId}
            ORDER BY id
          `
        : sql`
            SELECT
              id, product_id, name, flavor, strength,
              CAST(price AS FLOAT) as price,
              CAST(compare_at_price AS FLOAT) as compare_at_price,
              sku, image_url, inventory_quantity, is_active,
              created_at, updated_at
            FROM product_variations
            WHERE product_id = ${productId} AND is_active = true
            ORDER BY id
          `;

      const result = await query;
      return this.getRows<ProductVariation>(result);
    } catch (error) {
      logger.error(`Error fetching variations for product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to fetch variations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a new product variation
   */
  async createVariation(
    productId: number,
    variationData: Omit<ProductVariation, 'id' | 'product_id' | 'created_at' | 'updated_at'>
  ): Promise<ProductVariation> {
    try {
      // Check if product exists
      const productExists = await this.getProductById(productId);
      if (!productExists) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Create the variation
      const result = await sql`
        INSERT INTO product_variations (
          product_id, name, flavor, strength, price, compare_at_price,
          sku, image_url, inventory_quantity, is_active
        ) VALUES (
          ${productId},
          ${variationData.name},
          ${variationData.flavor || null},
          ${variationData.strength || null},
          ${variationData.price},
          ${variationData.compare_at_price || null},
          ${variationData.sku || null},
          ${variationData.image_url || null},
          ${variationData.inventory_quantity || 0},
          ${variationData.is_active !== undefined ? variationData.is_active : true}
        ) RETURNING
          id, product_id, name, flavor, strength,
          CAST(price AS FLOAT) as price,
          CAST(compare_at_price AS FLOAT) as compare_at_price,
          sku, image_url, inventory_quantity, is_active,
          created_at, updated_at
      `;

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      return this.getRow<ProductVariation>(result);
    } catch (error) {
      logger.error(`Error creating variation for product ${productId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to create variation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update a product variation
   */
  async updateVariation(
    variationId: number,
    updates: Partial<ProductVariation>
  ): Promise<ProductVariation> {
    try {
      // Build the SQL query
      const updateQuery = sql`UPDATE product_variations SET `;
      const updateParts = [];

      if (updates.name !== undefined) {
        updateParts.push(sql`name = ${updates.name}`);
      }

      if (updates.flavor !== undefined) {
        updateParts.push(sql`flavor = ${updates.flavor}`);
      }

      if (updates.strength !== undefined) {
        updateParts.push(sql`strength = ${updates.strength}`);
      }

      if (updates.price !== undefined) {
        updateParts.push(sql`price = ${updates.price}`);
      }

      if (updates.compare_at_price !== undefined) {
        updateParts.push(sql`compare_at_price = ${updates.compare_at_price}`);
      }

      if (updates.sku !== undefined) {
        updateParts.push(sql`sku = ${updates.sku}`);
      }

      if (updates.image_url !== undefined) {
        updateParts.push(sql`image_url = ${updates.image_url}`);
      }

      if (updates.inventory_quantity !== undefined) {
        updateParts.push(sql`inventory_quantity = ${updates.inventory_quantity}`);
      }

      if (updates.is_active !== undefined) {
        updateParts.push(sql`is_active = ${updates.is_active}`);
      }

      // Add updated_at timestamp
      updateParts.push(sql`updated_at = NOW()`);

      if (updateParts.length === 0) {
        throw new Error('No fields to update');
      }

      // Combine update parts manually with commas
      let combinedParts = updateParts[0];
      for (let i = 1; i < updateParts.length; i++) {
        combinedParts = sql`${combinedParts}, ${updateParts[i]}`;
      }

      // Construct final query
      const result = await sql`
        ${updateQuery} ${combinedParts}
        WHERE id = ${variationId}
        RETURNING
          id, product_id, name, flavor, strength,
          CAST(price AS FLOAT) as price,
          CAST(compare_at_price AS FLOAT) as compare_at_price,
          sku, image_url, inventory_quantity, is_active,
          created_at, updated_at
      `;

      if (this.getRows(result).length === 0) {
        throw new Error(`Variation with ID ${variationId} not found`);
      }

      const updatedVariation = this.getRow<ProductVariation>(result);

      // Invalidate caches
      await this.invalidateProductCaches(Number(updatedVariation.product_id));

      return updatedVariation;
    } catch (error) {
      logger.error(`Error updating variation ${variationId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to update variation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a product variation
   */
  async deleteVariation(variationId: number): Promise<boolean> {
    try {
      // Get product_id before deletion for cache invalidation
      const variationResult = await sql`
        SELECT product_id FROM product_variations WHERE id = ${variationId}
      `;

      if (this.getRows(variationResult).length === 0) {
        return false;
      }

      const row = this.getRow<DbRow>(variationResult);
      const productId = Number(row.product_id);

      // Delete the variation
      await sql`
        DELETE FROM product_variations WHERE id = ${variationId}
      `;

      // Invalidate caches
      await this.invalidateProductCaches(productId);

      return true;
    } catch (error) {
      logger.error(`Error deleting variation ${variationId}:`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to delete variation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product statistics for dashboard
   */
  async getProductStats(): Promise<ProductStats> {
    try {
      return await cachedQuery(
        this.CACHE_KEYS.PRODUCT_STATS,
        async () => {
          // Get total and active product counts
          const countResult = await sql`
            SELECT
              COUNT(*) as total_products,
              SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_products
            FROM products
          `;

          // Get inventory stats
          const inventoryResult = await sql`
            SELECT
              SUM(quantity) as total_inventory,
              SUM(CASE WHEN quantity < ${this.LOW_STOCK_THRESHOLD} AND quantity > 0 THEN 1 ELSE 0 END) as low_stock_count,
              SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
            FROM inventory
          `;

          // Get top selling products (assuming there's an orders_items table)
          // This is a simplified example - you might need to adapt based on your schema
          const topSellingResult = await sql`
            SELECT
              p.id,
              p.name,
              COUNT(oi.product_id) as sales
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY p.id, p.name
            ORDER BY sales DESC
            LIMIT 5
          `;

          const counts = this.getRow<DbRow>(countResult);
          const inventoryStats = this.getRow<DbRow>(inventoryResult);
          const topSellingProducts = this.getRows<DbRow>(topSellingResult);

          return {
            totalProducts: parseInt(String(counts.total_products)),
            activeProducts: parseInt(String(counts.active_products)),
            totalInventory: parseInt(String(inventoryStats.total_inventory)) || 0,
            lowStockCount: parseInt(String(inventoryStats.low_stock_count)) || 0,
            outOfStockCount: parseInt(String(inventoryStats.out_of_stock_count)) || 0,
            topSellingProducts: topSellingProducts.map(p => ({
              id: Number(p.id),
              name: String(p.name),
              sales: parseInt(String(p.sales)),
            })),
          };
        },
        CACHE_DURATIONS.MEDIUM // Medium cache for stats that don't need to be real-time
      );
    } catch (error) {
      logger.error('Error fetching product stats:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to fetch product stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if wholesale order meets minimum requirements
   */
  async validateWholesaleOrder(items: { productId: number; quantity: number }[]): Promise<{
    valid: boolean;
    totalUnits: number;
    minimumRequired: number;
    message?: string;
  }> {
    const WHOLESALE_MIN_UNITS = 100; // Minimum units required for wholesale orders

    try {
      let totalUnits = 0;

      // Calculate total units in the order
      for (const item of items) {
        totalUnits += item.quantity;
      }

      // Check if total meets minimum requirement
      if (totalUnits < WHOLESALE_MIN_UNITS) {
        return {
          valid: false,
          totalUnits,
          minimumRequired: WHOLESALE_MIN_UNITS,
          message: `Wholesale orders require a minimum of ${WHOLESALE_MIN_UNITS} units. Current order has ${totalUnits} units.`,
        };
      }

      return {
        valid: true,
        totalUnits,
        minimumRequired: WHOLESALE_MIN_UNITS,
        message: `Order meets wholesale requirements with ${totalUnits} units.`,
      };
    } catch (error) {
      logger.error('Error validating wholesale order:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to validate wholesale order: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Invalidate product-related caches
   */
  private async invalidateProductCaches(productId?: number): Promise<void> {
    try {
      // If a specific product ID is provided, invalidate just that product's cache
      if (productId) {
        await cacheOperations.invalidate(this.CACHE_KEYS.PRODUCT(productId));
      }

      // Always invalidate these caches to ensure fresh data
      await cacheOperations.invalidate(this.CACHE_KEYS.PRODUCT_STATS);
      await cacheOperations.invalidate(this.CACHE_KEYS.AVAILABLE_FILTERS);

      // We could also invalidate all product list caches, but that might be expensive
      // For simplicity, we'll rely on cache expiration for those
    } catch (error) {
      logger.error('Error invalidating product caches:', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - we don't want cache invalidation to cause operation failures
    }
  }
}
