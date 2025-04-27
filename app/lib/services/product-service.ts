import sql from '@/lib/db';
import { getRows } from '@/lib/db-types';

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

/**
 * Service for product-related operations
 */
export class ProductService {
  /**
   * Get a product by ID with its variations
   */
  async getProductById(productId: number): Promise<Product | null> {
    try {
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

      const productRows = getRows(productResult);
      if (productRows.length === 0) {
        return null;
      }

      const product = productRows[0] as Product;

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

      const variations = getRows(variationsResult) as ProductVariation[];
      product.variations = variations;

      return product;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
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
    minPrice?: number | null;
    maxPrice?: number | null;
    search?: string | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
  }) {
    try {
      const offset = (page - 1) * limit;

      // Build the WHERE conditions dynamically
      const conditions = [];

      // Only include active products unless explicitly requested
      if (!includeInactive) {
        conditions.push('is_active = true');
      }

      if (category) {
        conditions.push(`category = '${category}'`);
      }

      if (flavor) {
        conditions.push(`flavor = '${flavor}'`);
      }

      if (minPrice !== null) {
        conditions.push(`price >= ${minPrice}`);
      }

      if (maxPrice !== null) {
        conditions.push(`price <= ${maxPrice}`);
      }

      if (search) {
        conditions.push(`(
          name ILIKE '%${search}%' OR 
          description ILIKE '%${search}%' OR
          flavor ILIKE '%${search}%'
        )`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Validate sortBy to prevent SQL injection
      const validSortFields = ['name', 'price', 'created_at', 'category'];
      const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';

      // Validate sortOrder to prevent SQL injection
      const finalSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

      // Get total count for pagination
      const countQueryText = `
        SELECT COUNT(*) as total
        FROM products
        ${whereClause}
      `;

      const countResult = await sql.unsafe(countQueryText);
      const totalProducts = parseInt(getRows(countResult)[0].total);
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
        LIMIT ${limit} OFFSET ${offset}
      `;

      const productsResult = await sql.unsafe(productsQueryText);
      const products = getRows(productsResult);

      // Get available filters
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
      const availableFilters = getRows(filterResult)[0];

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
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(
        `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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

      const newProduct = getRows(result)[0] as Product;
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(
        `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`
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

      if (getRows(result).length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      return getRows(result)[0] as Product;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
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

      if (getRows(checkResult).length === 0) {
        return false;
      }

      // Delete related variations first
      await sql`
        DELETE FROM product_variations WHERE product_id = ${productId}
      `;

      // Then delete the product
      await sql`
        DELETE FROM products WHERE id = ${productId}
      `;

      return true;
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw new Error(
        `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      console.error('Error validating wholesale order:', error);
      throw new Error(
        `Failed to validate wholesale order: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
