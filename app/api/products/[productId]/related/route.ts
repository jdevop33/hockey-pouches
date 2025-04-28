import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../../lib/db';
import { unstable_cache } from 'next/cache';

interface Product {
  id: number;
  name: string;
  flavor?: string | null;
  strength?: number | null;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  description?: string | null;
  is_active: boolean;
}

// Cache related products for 1 hour (3600 seconds)
const getRelatedProductsFromDb = unstable_cache(
  async (productId: number, limit = 4): Promise<Product[]> => {
    try {
      // First get the current product's category
      const currentProduct = await sql`
        SELECT category FROM products WHERE id = ${productId} AND is_active = true
      `;

      if (!currentProduct || currentProduct.length === 0) {
        return [];
      }

      const category = currentProduct[0].category;

      // If no category, just get some active products
      if (!category) {
        const result = await sql`
          SELECT * FROM products 
          WHERE id != ${productId}
          AND is_active = true
          LIMIT ${limit}
        `;
        return result as unknown as Product[];
      }

      // Query for related products by matching category
      const result = await sql`
        SELECT * FROM products 
        WHERE category = ${category}
        AND id != ${productId}
        AND is_active = true
        LIMIT ${limit}
      `;

      return result as unknown as Product[];
    } catch (error) {
      console.error(`Database error fetching related products for ${productId}:`, error);
      return [];
    }
  },
  ['related-products'],
  { revalidate: 3600 }
);

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = parseInt(params.productId);
    const searchParams = new URL(request.url).searchParams;
    const limit = parseInt(searchParams.get('limit') || '4');

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Try to get related products from database
    const relatedProducts = await getRelatedProductsFromDb(productId, limit);

    // Even if no related products, return empty array (no fallback)
    return NextResponse.json({ products: relatedProducts });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}
