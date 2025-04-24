import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { ProductVariation } from '@/types';

export const dynamic = 'force-dynamic';

// GET handler - List all variations for a product
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;
  const productIdNum = parseInt(productId);

  if (isNaN(productIdNum)) {
    return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is an admin
    if (authResult.role !== 'Admin') {
      return forbiddenResponse('Only administrators can access this resource');
    }

    // Check if product exists
    const productResult = await sql`
      SELECT id FROM products WHERE id = ${productIdNum}
    `;

    if (productResult.length === 0) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // Fetch variations for the product
    const variationsResult = await sql`
      SELECT
        id, product_id, name, flavor, strength,
        CAST(price AS FLOAT) as price,
        CAST(compare_at_price AS FLOAT) as compare_at_price,
        sku, image_url, inventory_quantity, is_active,
        created_at, updated_at
      FROM product_variations
      WHERE product_id = ${productIdNum}
      ORDER BY id ASC
    `;

    return NextResponse.json(variationsResult as ProductVariation[]);
  } catch (error) {
    console.error(`Admin: Failed to fetch variations for product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler - Add a new variation to a product
export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;
  const productIdNum = parseInt(productId);

  if (isNaN(productIdNum)) {
    return NextResponse.json({ message: 'Invalid product ID format.' }, { status: 400 });
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Check if user is an admin
    if (authResult.role !== 'Admin') {
      return forbiddenResponse('Only administrators can access this resource');
    }

    // Check if product exists
    const productResult = await sql`
      SELECT id FROM products WHERE id = ${productIdNum}
    `;

    if (productResult.length === 0) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      name,
      flavor,
      strength,
      price,
      compare_at_price,
      sku,
      image_url,
      inventory_quantity = 0,
      is_active = true,
    } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json({ message: 'Variation name is required.' }, { status: 400 });
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
      return NextResponse.json({ message: 'Valid price is required.' }, { status: 400 });
    }

    // Insert the new variation
    const result = await sql`
      INSERT INTO product_variations (
        product_id, name, flavor, strength, price, compare_at_price,
        sku, image_url, inventory_quantity, is_active
      ) VALUES (
        ${productIdNum}, ${name}, ${flavor || null}, ${strength || null},
        ${price.toFixed(2)}, ${compare_at_price ? compare_at_price.toFixed(2) : null},
        ${sku || null}, ${image_url || null}, ${inventory_quantity}, ${is_active}
      )
      RETURNING
        id, product_id, name, flavor, strength,
        CAST(price AS FLOAT) as price,
        CAST(compare_at_price AS FLOAT) as compare_at_price,
        sku, image_url, inventory_quantity, is_active,
        created_at, updated_at
    `;

    const createdVariation = result[0] as ProductVariation;
    return NextResponse.json(createdVariation, { status: 201 });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    // Handle unique constraint violation
    if (error.message?.includes('unique constraint')) {
      return NextResponse.json(
        {
          message: 'A variation with this flavor and strength already exists for this product.',
        },
        { status: 409 }
      );
    }

    console.error(`Admin: Failed to add variation to product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
