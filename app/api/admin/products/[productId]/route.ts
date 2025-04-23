import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check for this route

// Define the expected shape of the update data
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

// Force dynamic because of Auth headers and dynamic segment
export const dynamic = 'force-dynamic';

// --- PUT Handler (Update Existing Product) --- 
export async function PUT(
    request: NextRequest, 
    { params }: { params: { productId: string } } 
) {
  const { productId: productIdString } = params;
  const productId = parseInt(productIdString);

  if (isNaN(productId)) {
      return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
  }
  
  // TODO: Add Admin Auth Check here!

  try {
    const body: UpdateProductBody = await request.json();
    console.log(`Admin PUT /api/admin/products/${productId} request:`, body);

    // --- Validation --- 
    // Basic check: Ensure at least one field is being updated
    if (Object.keys(body).length === 0) {
         return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }
    // Add specific field validations (e.g., price > 0, name not empty)
    if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
        return NextResponse.json({ message: 'Invalid price.' }, { status: 400 });
    }
    if (body.strength !== undefined && (typeof body.strength !== 'number' || body.strength <= 0)) {
         return NextResponse.json({ message: 'Invalid strength.' }, { status: 400 });
    }
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
         return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
    }
    // Add more validation...

    // --- Construct SET clause dynamically --- 
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Helper to add field to update list
    const addUpdateField = (fieldName: keyof UpdateProductBody, dbColumn: string, value: any) => {
        if (value !== undefined) {
            // Use NULL for empty strings or null values for nullable columns
            const finalValue = (value === '' || value === null) && ['description', 'compare_at_price', 'image_url', 'category'].includes(dbColumn)
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

    // Add updated_at timestamp
    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

    // --- Update product in DB --- 
    console.log(`Admin: Updating product ${productId} with fields: ${fieldsToUpdate.join(', ')}`);
    const updateQuery = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = $${valueIndex}`;
    values.push(productId);
    
    const result = await sql.query(updateQuery, values); // Use sql.query for parameterized query

    // Check if any row was actually updated
    if (result.rowCount === 0) {
         console.warn(`Admin: Product ${productId} not found during update attempt.`);
         return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    console.log(`Admin: Product ${productId} updated successfully.`);

    // --- Return updated product (optional) --- 
    // Fetch the updated product data to return
    const updatedProduct = await sql`
         SELECT 
            id, name, description, flavor, strength, 
            CAST(price AS FLOAT) as price, 
            CAST(compare_at_price AS FLOAT) as compare_at_price, 
            image_url, category, is_active 
        FROM products WHERE id = ${productId}
    `;

    return NextResponse.json(updatedProduct[0] as Product); 

  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to update product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE Handler (Delete/Deactivate Product) --- 
export async function DELETE(
    request: NextRequest, 
    { params }: { params: { productId: string } } 
) {
  const { productId: productIdString } = params;
  const productId = parseInt(productIdString);

  if (isNaN(productId)) {
      return NextResponse.json({ message: 'Invalid Product ID format.' }, { status: 400 });
  }

  // TODO: Add Admin Auth Check here!

  try {
    console.log(`Admin DELETE /api/admin/products/${productId} request`);

    // Option 1: Soft Delete (Recommended) - Set is_active = false
    console.log(`Admin: Deactivating product ${productId}...`);
    const result = await sql`
        UPDATE products 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${productId}
    `;
    
    if (result.rowCount === 0) {
        console.warn(`Admin: Product ${productId} not found during deactivation attempt.`);
        return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }
    console.log(`Admin: Product ${productId} deactivated successfully.`);
    return NextResponse.json({ message: `Product ${productId} deactivated successfully.` }, { status: 200 });

    // Option 2: Hard Delete (Use with caution!)
    // console.log(`Admin: Deleting product ${productId} and its inventory...`);
    // // Use transaction if doing multiple deletes
    // await sql`DELETE FROM inventory WHERE product_id = ${productId}`;
    // const deleteResult = await sql`DELETE FROM products WHERE id = ${productId}`;
    // if (deleteResult.rowCount === 0) {
    //     return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    // }
    // console.log(`Admin: Product ${productId} deleted successfully.`);
    // return new Response(null, { status: 204 }); // No Content

  } catch (error: any) {
     // Handle potential foreign key errors if trying hard delete and product is in an order_item
     if (error.message?.includes('violates foreign key constraint')) {
         console.error(`Admin: Cannot delete product ${productId}, it exists in orders.`);
         return NextResponse.json({ message: 'Cannot delete product because it exists in past orders. Deactivate it instead.' }, { status: 409 }); // Conflict
     }
    console.error(`Admin: Failed to delete/deactivate product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Add Product interface definition if not shared
interface Product { 
    id: number; name: string; description?: string | null; flavor?: string | null; 
    strength?: number | null; price: number; compare_at_price?: number | null; 
    image_url?: string | null; category?: string | null; is_active: boolean; 
}
