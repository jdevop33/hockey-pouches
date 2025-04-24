import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { ProductVariation } from '@/types';

export const dynamic = 'force-dynamic';

// GET handler - Get a specific variation
export async function GET(request: NextRequest, { params }: { params: { variationId: string } }) {
  const { variationId } = params;
  const variationIdNum = parseInt(variationId);

  if (isNaN(variationIdNum)) {
    return NextResponse.json({ message: 'Invalid variation ID format.' }, { status: 400 });
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

    // Fetch the variation
    const variationResult = await sql`
      SELECT
        id, product_id, name, flavor, strength,
        CAST(price AS FLOAT) as price,
        CAST(compare_at_price AS FLOAT) as compare_at_price,
        sku, image_url, inventory_quantity, is_active,
        created_at, updated_at
      FROM product_variations
      WHERE id = ${variationIdNum}
    `;

    if (variationResult.length === 0) {
      return NextResponse.json({ message: 'Variation not found.' }, { status: 404 });
    }

    return NextResponse.json(variationResult[0] as ProductVariation);
  } catch (error) {
    console.error(`Admin: Failed to fetch variation ${variationId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler - Update a variation
export async function PUT(request: NextRequest, { params }: { params: { variationId: string } }) {
  const { variationId } = params;
  const variationIdNum = parseInt(variationId);

  if (isNaN(variationIdNum)) {
    return NextResponse.json({ message: 'Invalid variation ID format.' }, { status: 400 });
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

    // Check if variation exists
    const variationCheck = await sql`
      SELECT id FROM product_variations WHERE id = ${variationIdNum}
    `;

    if (variationCheck.length === 0) {
      return NextResponse.json({ message: 'Variation not found.' }, { status: 404 });
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
      inventory_quantity,
      is_active,
    } = body;

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    let valueIndex = 1;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ message: 'Variation name cannot be empty.' }, { status: 400 });
      }
      updateFields.push(`name = $${valueIndex++}`);
      updateValues.push(name);
    }

    if (flavor !== undefined) {
      updateFields.push(`flavor = $${valueIndex++}`);
      updateValues.push(flavor === null ? null : flavor);
    }

    if (strength !== undefined) {
      updateFields.push(`strength = $${valueIndex++}`);
      updateValues.push(strength === null ? null : strength);
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ message: 'Invalid price.' }, { status: 400 });
      }
      updateFields.push(`price = $${valueIndex++}`);
      updateValues.push(price.toFixed(2));
    }

    if (compare_at_price !== undefined) {
      updateFields.push(`compare_at_price = $${valueIndex++}`);
      updateValues.push(compare_at_price === null ? null : compare_at_price.toFixed(2));
    }

    if (sku !== undefined) {
      updateFields.push(`sku = $${valueIndex++}`);
      updateValues.push(sku === null ? null : sku);
    }

    if (image_url !== undefined) {
      updateFields.push(`image_url = $${valueIndex++}`);
      updateValues.push(image_url === null ? null : image_url);
    }

    if (inventory_quantity !== undefined) {
      if (typeof inventory_quantity !== 'number' || inventory_quantity < 0) {
        return NextResponse.json({ message: 'Invalid inventory quantity.' }, { status: 400 });
      }
      updateFields.push(`inventory_quantity = $${valueIndex++}`);
      updateValues.push(inventory_quantity);
    }

    if (is_active !== undefined) {
      if (typeof is_active !== 'boolean') {
        return NextResponse.json({ message: 'is_active must be a boolean.' }, { status: 400 });
      }
      updateFields.push(`is_active = $${valueIndex++}`);
      updateValues.push(is_active);
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // If no fields to update, return early
    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update.' }, { status: 400 });
    }

    // Add the variation ID to the values array
    updateValues.push(variationIdNum);

    // Use the pool for the parameterized query
    const { pool } = await import('@/lib/db');
    const result = await pool.query(
      `UPDATE product_variations
       SET ${updateFields.join(', ')}
       WHERE id = $${valueIndex}
       RETURNING
         id, product_id, name, flavor, strength,
         CAST(price AS FLOAT) as price,
         CAST(compare_at_price AS FLOAT) as compare_at_price,
         sku, image_url, inventory_quantity, is_active,
         created_at, updated_at`,
      updateValues
    );

    const updatedVariation = result.rows[0] as ProductVariation;

    if (!updatedVariation) {
      return NextResponse.json({ message: 'Failed to update variation.' }, { status: 500 });
    }

    return NextResponse.json(updatedVariation);
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

    console.error(`Admin: Failed to update variation ${variationId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler - Delete a variation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { variationId: string } }
) {
  const { variationId } = params;
  const variationIdNum = parseInt(variationId);

  if (isNaN(variationIdNum)) {
    return NextResponse.json({ message: 'Invalid variation ID format.' }, { status: 400 });
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

    // Check if variation exists
    const variationCheck = await sql`
      SELECT id FROM product_variations WHERE id = ${variationIdNum}
    `;

    if (variationCheck.length === 0) {
      return NextResponse.json({ message: 'Variation not found.' }, { status: 404 });
    }

    // Delete the variation
    await sql`
      DELETE FROM product_variations WHERE id = ${variationIdNum}
    `;

    return NextResponse.json({ message: `Variation ${variationId} deleted successfully` });
  } catch (error) {
    console.error(`Admin: Failed to delete variation ${variationId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
