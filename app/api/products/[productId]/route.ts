import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db'; // Use path alias

// Reusing Product interface from list route
interface Product {
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
    // TODO: Define structure for variations/bulk_discounts if fetched here
}

export async function GET(
    request: NextRequest, 
    { params }: { params: { productId: string } } 
) {
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
             -- TODO: Join with variations table if needed
        FROM products 
        WHERE id = ${productId} AND is_active = TRUE
    `;

    const products = result as Product[]; // Assert type

    if (products.length === 0) {
      return NextResponse.json({ message: 'Product not found or not active.' }, { status: 404 });
    }

    const product = products[0];
    console.log(`Fetched product: ${product.name}`);

    // TODO: Fetch variations if they are stored separately

    return NextResponse.json(product);

  } catch (error) {
    console.error(`Failed to get product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
