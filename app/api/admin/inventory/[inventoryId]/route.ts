// app/api/admin/inventory/[stockLevelId]/route.ts (File Renamed Recommended)
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db'; // Use Drizzle
import { getRows, getFirstRow } from '@/lib/db-types';
import { logger } from '@/lib/logger';
import { productService } from '@/lib/services/product-service'; // For adjustments
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Basic type for stock level
interface StockLevel {
  id: string;
  quantity: number;
  reserved_quantity: number;
  product_variation_id: string;
  location_id: string;
  [key: string]: unknown;
}

// --- GET Handler (Get Specific Stock Level Details) ---
export async function GET(request: NextRequest, { params }: { params: { inventoryId: string } }) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }
    const stockLevelId = params.inventoryId;
    if (!stockLevelId || Array.isArray(stockLevelId) ? Array.isArray(stockLevelId) ? stockLevelId.length : 0 : 0 !== 36) {
      return NextResponse.json({ message: 'Invalid Stock Level ID format.' }, { status: 400 });
    }
    logger.info(`Admin GET /api/admin/inventory/${stockLevelId} request`, {
      adminId: authResult.userId,
    });

    // Use properly formatted SQL tagged template literals
    const result = await db.execute(sql`
            SELECT sl.*, l.name as location_name, p.name as product_name
            FROM stock_levels sl
            JOIN stock_locations l ON sl.location_id = l.id
            JOIN product_variations pv ON sl.product_variation_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE sl.id = ${stockLevelId}
        `);

    const stockLevel = getFirstRow(result) as StockLevel | null;
    if (!stockLevel) {
      return NextResponse.json({ message: 'Stock level not found.' }, { status: 404 });
    }

    const response = {
      ...stockLevel,
      availableQuantity: stockLevel.quantity - stockLevel.reserved_quantity,
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error(`Admin: Failed to get stock level ${params.inventoryId}:`, { error });
    return NextResponse.json(
      { message: 'Internal Server Error fetching stock level.' },
      { status: 500 }
    );
  }
}

// --- PATCH Handler (Manual Inventory Adjustment) ---
const adjustStockSchema = z
  .object({
    changeQuantity: z
      .number()
      .int()
      .refine(val => val !== 0, { message: 'Change quantity cannot be zero' }),
    notes: z.string().optional(),
  })
  .strict();

export async function PATCH(request: NextRequest, { params }: { params: { inventoryId: string } }) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }
    const stockLevelId = params.inventoryId;
    if (!stockLevelId || Array.isArray(stockLevelId) ? Array.isArray(stockLevelId) ? stockLevelId.length : 0 : 0 !== 36) {
      return NextResponse.json({ message: 'Invalid Stock Level ID format.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = adjustStockSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { changeQuantity, notes } = validation.data;
    logger.info(`Admin PATCH /api/admin/inventory/${stockLevelId} request`, {
      adminId: authResult.userId,
      changeQuantity,
      notes,
    });

    // Use SQL tagged template literals
    const result = await db.execute(sql`
            SELECT product_variation_id, location_id
            FROM stock_levels
            WHERE id = ${stockLevelId}
        `);

    const stockLevel = getFirstRow(result) as StockLevel | null;
    if (!stockLevel) {
      return NextResponse.json({ message: 'Stock level not found.' }, { status: 404 });
    }

    if (!stockLevel.product_variation_id || !stockLevel.location_id) {
      return NextResponse.json(
        { message: 'Stock level missing required associations.' },
        { status: 404 }
      );
    }

    const success = await productService.updateInventory({
      stockLevelId: stockLevelId,
      productVariationId: stockLevel.product_variation_id,
      locationId: stockLevel.location_id,
      changeQuantity: changeQuantity,
      type: 'adjustment' as const,
      notes: notes ? `Admin Adjustment: ${notes}` : 'Admin Adjustment',
      userId: authResult.userId,
    });

    if (!success) throw new Error('Inventory adjustment failed in service but did not throw.');

    // Fetch the updated stock level with SQL tagged template literals
    const updatedResult = await db.execute(sql`
            SELECT * FROM stock_levels WHERE id = ${stockLevelId}
        `);

    const updatedStockLevel = getFirstRow(updatedResult);

    logger.info('Admin: Inventory adjusted successfully', {
      stockLevelId,
      adminId: authResult.userId,
    });
    return NextResponse.json(updatedStockLevel);
  } catch (error: unknown) {
    logger.error(`Admin: Failed to adjust inventory for ${params.inventoryId}:`, { error });
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
    }
    if (errorMessage || errorMessage) {
      return NextResponse.json(
        { message: errorMessage },
        { status: errorMessage.includes('Insufficient stock') ? 400 : 404 }
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error adjusting inventory.' },
      { status: 500 }
    );
  }
}

// DELETE commented out
