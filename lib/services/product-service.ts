import { adminClient, storeClient } from '../medusa-client';
import { z } from 'zod';

// Enforce $15 pricing as per requirements
const FIXED_PRODUCT_PRICE = 15.0;

// Define product validation schema
export const productSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  description: z.string().min(1, 'Product description is required'),
  // Always validate that the price is $15
  price: z.number().refine((val: number) => val === FIXED_PRODUCT_PRICE, {
    message: 'Product price must be $15 as per business requirements',
  }),
  images: z.array(z.string()).optional(),
  handle: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  type: z.string().optional(),
  variants: z
    .array(
      z.object({
        title: z.string(),
        prices: z.array(
          z.object({
            amount: z.number(),
            currency_code: z.string().default('usd'),
          })
        ),
        options: z
          .array(
            z.object({
              value: z.string(),
            })
          )
          .optional(),
        inventory_quantity: z.number().int().min(0).default(0),
      })
    )
    .optional(),
});

// Product service for admin operations
export const productService = {
  // List all products
  list: async (queryParams?: Record<string, any>) => {
    try {
      const { products, count, limit, offset } = await adminClient.products.list(queryParams);
      return { products, count, limit, offset };
    } catch (error) {
      console.error('Failed to list products:', error);
      throw error;
    }
  },

  // Get a single product by ID
  get: async (productId: string) => {
    try {
      const { product } = await adminClient.products.retrieve(productId);
      return product;
    } catch (error) {
      console.error(`Failed to get product ${productId}:`, error);
      throw error;
    }
  },

  // Create a new product with $15 price enforcement
  create: async (productData: any) => {
    try {
      // Always set the price to $15
      productData.price = FIXED_PRODUCT_PRICE;

      // Validate product data
      const validatedData = productSchema.parse(productData);

      const { product } = await adminClient.products.create(validatedData);
      return product;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  // Update an existing product with $15 price enforcement
  update: async (productId: string, productData: any) => {
    try {
      // If price is included in the update, ensure it's $15
      if (productData.price !== undefined) {
        productData.price = FIXED_PRODUCT_PRICE;
      }

      const { product } = await adminClient.products.update(productId, productData);
      return product;
    } catch (error) {
      console.error(`Failed to update product ${productId}:`, error);
      throw error;
    }
  },

  // Delete a product
  delete: async (productId: string) => {
    try {
      await adminClient.products.delete(productId);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      throw error;
    }
  },
};

// Store-facing product service for customers
export const storeProductService = {
  // List products for store
  list: async (queryParams?: Record<string, any>) => {
    try {
      const { products, count, limit, offset } = await storeClient.products.list(queryParams);
      return {
        products: products.map((product: any) => ({
          ...product,
          // Ensure all displayed prices are $15
          price: FIXED_PRODUCT_PRICE,
        })),
        count,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Failed to list store products:', error);
      throw error;
    }
  },

  // Get a single product for store
  get: async (productId: string) => {
    try {
      const { product } = await storeClient.products.retrieve(productId);
      // Ensure displayed price is $15
      return {
        ...product,
        price: FIXED_PRODUCT_PRICE,
      };
    } catch (error) {
      console.error(`Failed to get store product ${productId}:`, error);
      throw error;
    }
  },
};
