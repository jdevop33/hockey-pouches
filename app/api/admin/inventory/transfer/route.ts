import { NextResponse, NextRequest } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

// Define admin roles
const ADMIN_ROLES = ['Admin'];

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.isAuthenticated || !adminCheck.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(adminCheck.role || '')) {
      return NextResponse.json({ message: 'Forbidden: Requires Admin Access' }, { status: 403 });
    }

    // 2. Parse and validate the request body
    const body = await request.json();
    console.log('Admin: Inventory transfer request:', body);

    // Validate required fields
    if (!body.sourceInventoryId || !body.targetLocation || !body.quantity || !body.reason) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: sourceInventoryId, targetLocation, quantity, and reason are required',
        },
        { status: 400 }
      );
    }

    if (body.quantity <= 0 || !Number.isInteger(body.quantity)) {
      return NextResponse.json({ message: 'Quantity must be a positive integer' }, { status: 400 });
    }

    // 3. Get source inventory details to ensure it exists and has sufficient quantity
    const sourceInventoryResult = await sql`
      SELECT 
        i.id, i.product_id, i.variation_id, i.location, i.quantity, i.low_stock_threshold,
        p.name as product_name,
        v.name as variation_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN product_variations v ON i.variation_id = v.id
      WHERE i.id = ${body.sourceInventoryId}
    `;

    if (!sourceInventoryResult || sourceInventoryResult.length === 0) {
      return NextResponse.json({ message: 'Source inventory item not found' }, { status: 404 });
    }

    const sourceInventory = sourceInventoryResult[0];

    if (sourceInventory.quantity < body.quantity) {
      return NextResponse.json(
        {
          message: `Insufficient quantity. Available: ${sourceInventory.quantity}, Requested: ${body.quantity}`,
        },
        { status: 400 }
      );
    }

    // 4. Check if target location already has this product+variation
    const targetInventoryResult = await sql`
      SELECT id, quantity
      FROM inventory
      WHERE 
        product_id = ${sourceInventory.product_id} AND
        ${sourceInventory.variation_id ? sql`variation_id = ${sourceInventory.variation_id}` : sql`variation_id IS NULL`} AND
        location = ${body.targetLocation}
    `;

    const targetInventory = targetInventoryResult.length > 0 ? targetInventoryResult[0] : null;

    // 5. Perform the transfer
    // Reduce quantity from source
    await sql`
      UPDATE inventory
      SET 
        quantity = quantity - ${body.quantity},
        updated_at = NOW()
      WHERE id = ${body.sourceInventoryId}
    `;

    // Add to target (create or update)
    if (targetInventory) {
      await sql`
        UPDATE inventory
        SET 
          quantity = quantity + ${body.quantity},
          updated_at = NOW()
        WHERE id = ${targetInventory.id}
      `;
    } else {
      await sql`
        INSERT INTO inventory (
          product_id, 
          variation_id, 
          location,
          quantity,
          low_stock_threshold,
          created_at,
          updated_at
        ) VALUES (
          ${sourceInventory.product_id},
          ${sourceInventory.variation_id},
          ${body.targetLocation},
          ${body.quantity},
          ${sourceInventory.low_stock_threshold},
          NOW(),
          NOW()
        )
      `;
    }

    // Log the transfer
    await sql`
      INSERT INTO inventory_log (
        source_inventory_id,
        product_id,
        variation_id,
        source_location,
        target_location,
        quantity,
        reason,
        performed_by,
        created_at
      ) VALUES (
        ${body.sourceInventoryId},
        ${sourceInventory.product_id},
        ${sourceInventory.variation_id},
        ${sourceInventory.location},
        ${body.targetLocation},
        ${body.quantity},
        ${body.reason},
        ${adminCheck.userId},
        NOW()
      )
    `;

    return NextResponse.json(
      {
        message: 'Inventory transfer successful',
        details: {
          product: sourceInventory.product_name,
          variation: sourceInventory.variation_name,
          quantityTransferred: body.quantity,
          sourceLocation: sourceInventory.location,
          targetLocation: body.targetLocation,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin: Failed to transfer inventory:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
