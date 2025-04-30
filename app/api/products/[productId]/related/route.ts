import { NextRequest, NextResponse } from 'next/server';
import { sql, db } from '@/lib/db'; // Corrected import, added db
import { products } from '@/lib/schema/products';
import { products } from '@/lib/schema/products';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Import schema
import { eq, and, ne, desc } from 'drizzle-orm'; // Import operators
import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger'; // Added logger

// Use ProductSelect type from schema if possible, otherwise define locally
type ProductSelect = typeof schema.products.$inferSelect;

// Cache related products for 1 hour (3600 seconds)
const getRelatedProductsFromDb = unstable_cache(
  async (productId: number, limit = 4): Promise<ProductSelect[]> => {
    try {
      // Get the current product's category using Drizzle query builder
      const currentProduct = await db.query.products.findFirst({
        where: and(eq(schema.products.id, productId), eq(schema.products.isActive, true)),
        columns: { category: true }
      });

      if (!currentProduct) {
        logger.warn('Related Products: Current product not found or inactive', { productId });
        return [];
      }

      const category = currentProduct.category;

      let relatedProducts: ProductSelect[] = [];
      if (!category) {
        // If no category, get some other active products (excluding self)
        relatedProducts = await db.query.products.findMany({
          where: and(ne(schema.products.id, productId), eq(schema.products.isActive, true)),
          limit: limit,
          orderBy: desc(schema.products.createdAt) // Example ordering
        });
        logger.info('Related Products: No category found, returning general products', { productId, limit });
      } else {
        // Query for related products by matching category (excluding self)
        relatedProducts = await db.query.products.findMany({
          where: and(
              eq(schema.products.category, category),
              ne(schema.products.id, productId),
              eq(schema.products.isActive, true)
          ),
          limit: limit,
          orderBy: desc(schema.products.createdAt) // Example ordering
        });
        logger.info('Related Products: Found category-based related products', { productId, category, limit, count: relatedProducts.length });
      }

      return relatedProducts;

    } catch (error) {
      logger.error(`Database error fetching related products for ${productId}:`, { error });
      return []; // Return empty array on error
    }
  },
  ['related-products'], // Cache key prefix
  { 
      revalidate: 3600, // Revalidate every hour
      // Add tags for potential revalidation on product update
      tags: [`products`, `products:related:${productId}`]
  }
);

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId: productIdStr } = params;
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '4');

  const productId = parseInt(productIdStr);
  if (isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const relatedProducts = await getRelatedProductsFromDb(productId, limit);
    
    // Return the products (could be an empty array)
    return NextResponse.json({ products: relatedProducts });

  } catch (error) {
    logger.error('Error fetching related products route:', { productId, error });
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}
