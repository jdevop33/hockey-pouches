import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { Inventory } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { inventoryId: string } }
) {
  const { inventoryId: inventoryIdString } = params;
  const inventoryId = parseInt(inventoryIdString);

  if (isNaN(inventoryId)) {
    return NextResponse.json({ message: 'Invalid Inventory ID format.' }, { status: 400 });
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
    
    const adminUserId = authResult.userId;
    console.log(`GET /api/admin/inventory/${inventoryId} request by admin: ${adminUserId}`);

    // Fetch inventory details
    const inventoryQuery = `
      SELECT 
        i.id, i.product_id, i.location, i.quantity, i.updated_at,
        p.name as product_name, p.image_url
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.id = $1
    `;

    const inventoryResult = await sql.query(inventoryQuery, [inventoryId]);

    if (inventoryResult.length === 0) {
      return NextResponse.json({ message: 'Inventory not found.' }, { status: 404 });
    }

    const inventoryData = inventoryResult[0];
    
    // Format inventory for response
    const inventory = {
      id: inventoryData.id,
      productId: inventoryData.product_id,
      productName: inventoryData.product_name,
      location: inventoryData.location,
      quantity: inventoryData.quantity,
      updatedAt: inventoryData.updated_at,
      imageUrl: inventoryData.image_url
    };

    return NextResponse.json(inventory);

  } catch (error) {
    console.error(`Failed to get inventory ${inventoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { inventoryId: string } }
) {
  const { inventoryId: inventoryIdString } = params;
  const inventoryId = parseInt(inventoryIdString);

  if (isNaN(inventoryId)) {
    return NextResponse.json({ message: 'Invalid Inventory ID format.' }, { status: 400 });
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
    
    const adminUserId = authResult.userId;
    console.log(`PUT /api/admin/inventory/${inventoryId} request by admin: ${adminUserId}`);

    // Parse request body
    const body = await request.json();
    const { quantity, location } = body;

    // Validate required fields
    if (quantity === undefined && !location) {
      return NextResponse.json({ message: 'At least one field (quantity or location) is required' }, { status: 400 });
    }

    // Check if inventory exists
    const inventoryCheck = await sql`SELECT id FROM inventory WHERE id = ${inventoryId}`;
    if (inventoryCheck.length === 0) {
      return NextResponse.json({ message: 'Inventory not found' }, { status: 404 });
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    if (quantity !== undefined) {
      updateFields.push(`quantity = $${paramIndex++}`);
      updateValues.push(quantity);
    }

    if (location) {
      updateFields.push(`location = $${paramIndex++}`);
      updateValues.push(location);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Update inventory
    const updateQuery = `
      UPDATE inventory 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex++}
      RETURNING id
    `;
    updateValues.push(inventoryId);

    const result = await sql.query(updateQuery, updateValues);

    return NextResponse.json({ 
      message: `Inventory ${inventoryId} updated successfully`,
      inventoryId: result[0].id
    });

  } catch (error) {
    console.error(`Failed to update inventory ${inventoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { inventoryId: string } }
) {
  const { inventoryId: inventoryIdString } = params;
  const inventoryId = parseInt(inventoryIdString);

  if (isNaN(inventoryId)) {
    return NextResponse.json({ message: 'Invalid Inventory ID format.' }, { status: 400 });
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
    
    const adminUserId = authResult.userId;
    console.log(`DELETE /api/admin/inventory/${inventoryId} request by admin: ${adminUserId}`);

    // Check if inventory exists
    const inventoryCheck = await sql`SELECT id FROM inventory WHERE id = ${inventoryId}`;
    if (inventoryCheck.length === 0) {
      return NextResponse.json({ message: 'Inventory not found' }, { status: 404 });
    }

    // Delete inventory
    await sql`DELETE FROM inventory WHERE id = ${inventoryId}`;

    return NextResponse.json({ 
      message: `Inventory ${inventoryId} deleted successfully`
    });

  } catch (error) {
    console.error(`Failed to delete inventory ${inventoryId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
