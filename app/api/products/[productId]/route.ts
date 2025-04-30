import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Corrected import
import { products } from '@/lib/schema/products';
import { products } from '@/lib/schema/products';
import { products } from '@/lib/schema/products';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import schema
import { eq, and } from 'drizzle-orm'; // Import operators
import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger'; // Added logger

// Use ProductSelect type from schema
type ProductSelect = typeof schema.products.$inferSelect;

// Cache product details for 1 hour (3600 seconds)
// Refactored to use Drizzle query builder
const getProductFromDb = unstable_cache(
  async (productId: number): Promise<ProductSelect | null> => {
    try {
      logger.info('Fetching product from DB', { productId });
      const product = await db.query.products.findFirst({
        where: and(eq(schema.products.id, productId), eq(schema.products.isActive, true)),
        // Optionally add relations if needed, e.g., variations:
        // with: { variations: { where: eq(schema.productVariations.isActive, true) } }
      });

      if (!product) {
        logger.warn('Active product not found in DB', { productId });
        return null;
      }

      logger.info('Product found in DB', { productId });
      return product;
    } catch (error) {
      logger.error(`Database error fetching product ${productId}:`, { error });
      return null; // Return null on error
    }
  },
  ['product-detail'], // Base cache key
  { 
      revalidate: 3600, // Revalidate every hour
      tags: [`product:${productId}`] // Tag for potential revalidation
  }
);

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId: productIdStr } = params;
  logger.info(`GET request for product ID: ${productIdStr}`);

  try {
    const productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) {
      logger.warn('Invalid product ID format received', { productIdStr });
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    logger.info(`Fetching active product ${productId}...`);
    const product = await getProductFromDb(productId);

    if (!product) {
      logger.warn(`Product ${productId} not found by getProductFromDb`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Drizzle returns correct types, no need for manual checks/conversion
    logger.info(`Product ${productId} found`, { productData: product });
    return NextResponse.json(product);

  } catch (error) {
    logger.error(`Error in GET handler for product ${productIdStr}:`, { error });
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}
