import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../../lib/db';
import { mockProductsData } from '../../../../api/mockData';
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
      // Query for related products by category
      const result = await sql`
        SELECT p2.*
        FROM products p1
        JOIN products p2 ON p1.category_id = p2.category_id
        WHERE p1.id = ${productId}
          AND p2.id != ${productId}
          AND p2.is_active = true
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

    // If database query fails or no related products, fall back to mock data
    if (!relatedProducts || relatedProducts.length === 0) {
      console.warn(`Related products for ${productId} not found in database, using mock data`);

      // Filter mock products that aren't the current product
      // In a real implementation, we would filter by category
      const mockRelated = mockProductsData.filter(p => p.id !== productId).slice(0, limit);

      if (mockRelated.length === 0) {
        return NextResponse.json({ products: [] });
      }

      return NextResponse.json({ products: mockRelated });
    }

    return NextResponse.json({ products: relatedProducts });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 });
  }
}
