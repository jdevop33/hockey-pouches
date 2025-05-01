import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { getRowCount, getFirstRow } from '@/lib/db-types';

export const dynamic = 'force-dynamic';

interface UpdateInventoryBody {
  quantity?: number;
  reason?: string;
}

export async function PUT(request: NextRequest, { params }: { params: { inventoryId: string } }) {
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

    const body: UpdateInventoryBody = await request.json();
    const { quantity, reason } = body;

    // --- Input Validation ---
    if (
      quantity === undefined ||
      typeof quantity !== 'number' ||
      quantity < 0 ||
      !Number.isInteger(quantity)
    ) {
      return NextResponse.json(
        { message: 'Invalid or missing quantity (must be a non-negative integer).' },
        { status: 400 }
      );
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ message: 'Reason for adjustment is required.' }, { status: 400 });
    }
    const trimmedReason = reason.trim();

    // --- Fetch current quantity (for logging/audit) ---
    // Optional, but good for audit trail
    const currentInventory =
      await sql`SELECT product_id, location, quantity FROM inventory WHERE id = ${inventoryId}`;
    if (getRowCount(currentInventory as unknown as DbQueryResult) === 0) {
      return NextResponse.json({ message: 'Inventory item not found.' }, { status: 404 });
    }
    const inventoryData = getFirstRow(currentInventory as unknown as DbQueryResult);
    const oldQuantity = inventoryData?.quantity ?? 0;

    // --- Update Inventory in DB ---

    const result = await sql`
        UPDATE inventory
        SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${inventoryId}
    `;

    // Note: Neon sql tag doesn't reliably return rowCount for UPDATE.
    // We assume success if no error is thrown, but a SELECT check after could confirm.

    // --- Log Adjustment ---
    // TODO: Implement proper logging to an audit table
    // Log: Timestamp, AdminUserID, InventoryID, ProductID, Location, OldQty, NewQty, Reason
    console.log(
      `Inventory adjustment for item ${inventoryId} by Admin ${adminUserId}. Old: ${oldQuantity}, New: ${quantity}, Reason: ${trimmedReason}`
    );

    return NextResponse.json({
      message: `Inventory ${inventoryId} updated successfully to quantity ${quantity}.`,
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`Admin: Failed to update inventory ${inventoryId}:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? errorMessage : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
