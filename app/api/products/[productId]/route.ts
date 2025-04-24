import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db'; // Use path alias

import { Product, ProductVariation } from '@/types';

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId: productIdString } = params;
  const productId = parseInt(productIdString);

  // Validate that productId is a valid number
  if (isNaN(productId)) {
    return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
  }

  console.log(`GET /api/products/[productId] - ID: ${productId}`);

  try {
    // Fetch the specific product, ensuring it's active
    // Using CAST again for numeric types
    const result = await sql`
        SELECT
             id, name, description, flavor, strength,
             CAST(price AS FLOAT) as price,
             CAST(compare_at_price AS FLOAT) as compare_at_price,
             image_url, category, is_active
        FROM products
        WHERE id = ${productId} AND is_active = TRUE
    `;

    // Check if result is empty
    if (!result || result.length === 0) {
      return NextResponse.json({ message: 'Product not found or not active.' }, { status: 404 });
    }

    const products = result; // No need for type assertion here

    if (products.length === 0) {
      return NextResponse.json({ message: 'Product not found or not active.' }, { status: 404 });
    }

    const product = products[0];
    console.log(`Fetched product: ${product.name}`);

    // Fetch active variations for this product
    try {
      const variationsResult = await sql`
          SELECT
              id, product_id, name, flavor, strength,
              CAST(price AS FLOAT) as price,
              CAST(compare_at_price AS FLOAT) as compare_at_price,
              sku, image_url, inventory_quantity, is_active,
              created_at, updated_at
          FROM product_variations
          WHERE product_id = ${productId} AND is_active = TRUE
          ORDER BY id ASC
      `;

      // Add variations to the product
      product.variations = variationsResult || [];
    } catch (variationError) {
      console.error(`Failed to get variations for product ${productId}:`, variationError);
      product.variations = []; // Set empty array if variations query fails
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to get product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
