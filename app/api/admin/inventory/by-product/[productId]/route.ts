import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db';
import { getRows } from '@/lib/db-types';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Basic inventory item type
interface InventoryItem {
  inventoryId: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  quantity: number | string;
  reservedQuantity: number | string;
  imageUrl?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;

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
    logger.info(`Admin: Get inventory for product ID: ${productId} by admin: ${adminUserId}`);

    // Fetch inventory for this product from all locations using SQL tagged templates
    const result = await db.execute(sql`
      SELECT 
        sl.id as "inventoryId", 
        pv.product_id as "productId",
        p.name as "productName",
        sl.location_id as "locationId",
        l.name as "locationName",
        sl.quantity,
        sl.reserved_quantity as "reservedQuantity",
        p.primary_image_url as "imageUrl"
      FROM stock_levels sl
      JOIN product_variations pv ON sl.product_variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN stock_locations l ON sl.location_id = l.id
      WHERE pv.product_id = ${productId}
      ORDER BY l.name
    `);

    const inventoryItems = castDbRows<InventoryItem[]>(getRows(result as unknown as DbQueryResult as unknown as DbQueryResult));

    // Calculate available quantity for each item
    const inventoryWithAvailable = inventoryItems.map(item => ({
      ...item,
      availableQuantity: Number(item.quantity) - Number(item.reservedQuantity),
    }));

    return NextResponse.json(inventoryWithAvailable);
  } catch (error) {
    logger.error(`Admin: Failed to get inventory for product ${productId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
