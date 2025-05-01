// app/api/products/[productId]/related/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';
import { logger } from '@/lib/logger';
import { products } from '@/lib/schema/products';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for schema type references
import { eq, and, not, desc } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
// Use schema-derived types
type ProductSelect = typeof schema.products.$inferSelect;
// Define public-facing product type for lists/cards
type ProductListItem = Pick<
  ProductSelect,
  'id' | 'name' | 'description' | 'price' | 'category' | 'imageUrl'
>;
/**
 * Fetches related products based on category.
 * - Caches results for 15 minutes.
 * - Uses tags for potential revalidation.
 * - Excludes the original product.
 */
const getRelatedProductsFromDb = unstable_cache(
  // Make return type more specific based on selected columns
  async (
    productId: number,
    categoryName: string | null,
    limit: number
  ): Promise<ProductListItem[]> => {
    try {
      logger.info('Fetching related products from DB', { productId, categoryName, limit });
      if (!categoryName) {
        logger.warn('No category found for product, cannot fetch related by category', {
          productId,
        });
        return [];
      }
      const relatedProducts = await db.query.products.findMany({
        where: and(
          eq(products.category, categoryName), // Use imported products table
          eq(products.isActive, true),
          not(eq(products.id, productId))
        ),
        orderBy: (p, { desc }) => [desc(p.createdAt)], // Use alias p for clarity
        limit: limit,
        // Select only necessary columns for the list item type
        columns: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
        },
      });
      logger.info(`Found ${relatedProducts.length} related products`, { productId, categoryName });
      return relatedProducts;
    } catch (error) {
      logger.error(`Database error fetching related products for ${productId}:`, { error });
      return []; // Return empty array on error
    }
  },
  ['related-products'], // Base cache key
  {
    // Fixed tags to be a valid string array
    tags: ['products', 'product-details', 'related-products'],
    revalidate: 900, // Revalidate every 15 minutes
  }
);
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId: productIdStr } = params;
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '4'); // Default limit
  logger.info(`GET request for related products for ID: ${productIdStr}`);
  try {
    const productId = parseInt(productIdStr, 10);
    if (isNaN(productId)) {
      logger.warn('Invalid product ID format for related products', { productIdStr });
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }
    // 1. Get the category of the original product
    const originalProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { category: true },
    });
    if (!originalProduct) {
      logger.warn('Original product not found for related lookup', { productId });
      return NextResponse.json({ error: 'Original product not found' }, { status: 404 });
    }
    // 2. Fetch related products using the cached function
    const relatedProducts = await getRelatedProductsFromDb(
      productId,
      originalProduct.category,
      limit
    );
    logger.info(`Returning ${relatedProducts.length} related products`, { productId });
    return NextResponse.json(relatedProducts);
  } catch (error) {
    logger.error(`Error in GET handler for related products ${productIdStr}:`, { error });
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}
