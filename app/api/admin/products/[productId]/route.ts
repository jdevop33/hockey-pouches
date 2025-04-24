import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, message: 'Missing or invalid authorization token', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return { authorized: false, message: 'Invalid token', status: 401 };
    }

    // Check if user has admin role
    if (payload.role !== 'Admin') {
      return { authorized: false, message: 'Insufficient permissions', status: 403 };
    }

    return { authorized: true, userId: payload.userId };
  } catch (error) {
    console.error('Token verification error:', error);
    return { authorized: false, message: 'Invalid token', status: 401 };
  }
}

interface UpdateProductBody {
  name?: string;
  description?: string | null;
  flavor?: string | null;
  strength?: number | null;
  price?: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  category?: string | null;
  is_active?: boolean;
}

export const dynamic = 'force-dynamic';

// --- GET Handler (Retrieve Single Product) ---
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  // Verify admin access
  const authResult = await verifyAdminAccess(request);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { productId: productIdString } = params;
  const productId = parseInt(productIdString);

  if (isNaN(productId)) {
    return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
  }

  try {
    console.log(`Admin GET /api/admin/products/${productId} request`);

    const productResult = await sql`
        SELECT
            id, name, description, flavor, strength,
            CAST(price AS FLOAT) as price,
            CAST(compare_at_price AS FLOAT) as compare_at_price,
            image_url, category, is_active
        FROM products WHERE id = ${productId}
    `;

    if (productResult.length === 0) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(productResult[0] as Product);
  } catch (error: any) {
    console.error(`Admin: Failed to retrieve product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler (Update Existing Product) ---
export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  // Verify admin access
  const authResult = await verifyAdminAccess(request);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { productId: productIdString } = params;
  const productId = parseInt(productIdString);

  if (isNaN(productId)) {
    return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
  }

  try {
    const body: UpdateProductBody = await request.json();
    console.log(`Admin PUT /api/admin/products/${productId} request:`, body);

    // --- Validation ---
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }
    if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
      return NextResponse.json({ message: 'Invalid price.' }, { status: 400 });
    }
    if (
      body.strength !== undefined &&
      body.strength !== null &&
      (typeof body.strength !== 'number' || body.strength <= 0)
    ) {
      return NextResponse.json({ message: 'Invalid strength.' }, { status: 400 });
    }
    if (
      body.name !== undefined &&
      (typeof body.name !== 'string' || body.name.trim().length === 0)
    ) {
      return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
    }

    // --- Construct SET clause dynamically ---
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    const addUpdateField = (fieldName: keyof UpdateProductBody, dbColumn: string, value: any) => {
      if (value !== undefined) {
        const finalValue =
          (value === '' || value === null) &&
          ['description', 'compare_at_price', 'image_url', 'category', 'strength'].includes(
            dbColumn
          )
            ? null
            : value;
        fieldsToUpdate.push(`${dbColumn} = $${valueIndex++}`);
        values.push(finalValue);
      }
    };

    addUpdateField('name', 'name', body.name?.trim());
    addUpdateField('description', 'description', body.description);
    addUpdateField('flavor', 'flavor', body.flavor);
    addUpdateField('strength', 'strength', body.strength);
    addUpdateField('price', 'price', body.price);
    addUpdateField('compare_at_price', 'compare_at_price', body.compare_at_price);
    addUpdateField('image_url', 'image_url', body.image_url);
    addUpdateField('category', 'category', body.category);
    addUpdateField('is_active', 'is_active', body.is_active);

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ message: 'No valid fields to update provided.' }, { status: 400 });
    }
    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

    // --- Update product in DB ---
    console.log(`Admin: Updating product ${productId} with fields: ${fieldsToUpdate.join(', ')}`);
    const updateQuery = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = $${valueIndex}`;
    values.push(productId);

    // Removed rowCount check - Assume success if no error throws
    await sql.query(updateQuery, values);
    console.log(`Admin: Product ${productId} update attempted.`);

    // --- Return updated product ---
    const updatedProductResult = await sql`
         SELECT
            id, name, description, flavor, strength,
            CAST(price AS FLOAT) as price,
            CAST(compare_at_price AS FLOAT) as compare_at_price,
            image_url, category, is_active
        FROM products WHERE id = ${productId}
    `;

    if (updatedProductResult.length === 0) {
      // This would mean the product was deleted between the start of the request and now
      return NextResponse.json({ message: 'Product not found after update.' }, { status: 404 });
    }

    return NextResponse.json(updatedProductResult[0] as Product);
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to update product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE Handler (Soft Delete Product) ---
export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  // Verify admin access
  const authResult = await verifyAdminAccess(request);
  if (!authResult.authorized) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { productId: productIdString } = params;
  const productId = parseInt(productIdString);

  if (isNaN(productId)) {
    return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
  }

  try {
    console.log(`Admin DELETE /api/admin/products/${productId} request (Soft Delete)`);

    // Soft Delete (Recommended)
    console.log(`Admin: Deactivating product ${productId}...`);
    // Removed rowCount check - Assume success if no error throws
    await sql`
        UPDATE products
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${productId}
    `;
    console.log(`Admin: Product ${productId} deactivation attempted.`);
    // We might want to SELECT here to confirm is_active is now false if needed

    return NextResponse.json(
      { message: `Product ${productId} deactivated successfully.` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Admin: Failed to deactivate product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Add Product interface definition if not shared
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
}
