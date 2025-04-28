import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../lib/db'; // Assuming lib/db exports the neon sql function correctly
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
  created_at?: string;
  updated_at?: string;
}

// Cache product details for 1 hour (3600 seconds)
const getProductFromDb = unstable_cache(
  async (productId: number): Promise<Product | null> => {
    try {
      // Simplified query to just get the product without category join
      const result = await sql`
        SELECT *
        FROM products
        WHERE id = ${productId} AND is_active = true
      `;

      // Check if any results were returned
      if (!result || result.length === 0) {
        console.log(`Active product ${productId} not found in DB.`);
        return null;
      }

      console.log(`Product ${productId} found.`);
      return result[0] as Product;
    } catch (error) {
      console.error(`Database error fetching product ${productId}:`, error);
      return null; // Return null on error
    }
  },
  ['product-detail'], // Use the original cache key
  { revalidate: 3600 } // Restore original revalidate time
);

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  console.log(`GET request for product ID: ${params.productId}`);
  try {
    const productId = parseInt(params.productId, 10);

    if (isNaN(productId)) {
      console.log(`Invalid product ID format: "${params.productId}"`);
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    console.log(`Fetching active product ${productId}...`);
    // Try to get product from database using the original function
    const product = await getProductFromDb(productId);

    // If product not found, return 404
    if (!product) {
      console.log(`Product ${productId} not found in database`);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Add additional logging to check product data
    console.log(`Product ${productId} found with data:`, JSON.stringify(product));

    // Ensure product data is properly formatted before returning
    if (typeof product.id !== 'number') {
      console.warn(`Product ${productId} has invalid ID format: ${product.id}`);
      // Convert string ID to number if needed
      product.id = Number(product.id);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Error in GET handler for product ${params.productId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}
