import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

// TODO: Add JWT verification + Admin role check

export const dynamic = 'force-dynamic'; 

// Type for the returned inventory item
interface InventoryItemAdmin {
  inventoryId: number; // inventory.id
  productId: number;   // inventory.product_id
  productName: string; // products.name
  variationName?: string | null; // Placeholder if variations implemented
  location: string;
  quantity: number;
  lowStockThreshold?: number | null; // Placeholder if needed
  imageUrl?: string | null; // products.image_url
}

export async function GET(request: NextRequest) {
  // TODO: Admin Auth Check
  console.log('GET /api/admin/inventory request');

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); 
    const offset = (page - 1) * limit;
    
    // --- Filtering --- 
    const locationFilter = searchParams.get('location');
    const productIdFilter = searchParams.get('productId');
    const lowStockFilter = searchParams.get('lowStock'); // If 'true', show low stock
    // TODO: Add search filter (product name?)

    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (locationFilter) {
        conditions.push(`i.location = $${paramIndex++}`);
        queryParams.push(locationFilter);
    }
    if (productIdFilter) {
        conditions.push(`i.product_id = $${paramIndex++}`);
        queryParams.push(parseInt(productIdFilter)); // Assuming product ID is integer
    }
    if (lowStockFilter === 'true') {
        // Assuming a threshold exists or comparing to a fixed value like 10
        // TODO: Implement proper low stock threshold logic if needed
        conditions.push(`i.quantity < 10`); // Example fixed threshold
    }
    // TODO: Add search condition
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // --- Database Query --- 
    // Fetch inventory, joining with products for name/image
    const inventoryQuery = `
        SELECT 
            i.id as inventoryId, 
            i.product_id as productId, 
            p.name as productName, 
            -- TODO: Add variation name if variations exist
            i.location, 
            i.quantity, 
            p.image_url as imageUrl 
            -- TODO: Add low_stock_threshold if needed
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        ${whereClause} 
        ORDER BY p.name ASC, i.location ASC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Fetch Total Count with same filters
    const countQuery = `SELECT COUNT(*) FROM inventory i ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length); 

    console.log('Executing Admin Inventory Query:', inventoryQuery, queryParams);
    console.log('Executing Admin Inventory Count Query:', countQuery, countQueryParams);

    const [inventoryResult, totalResult] = await Promise.all([
        sql.query(inventoryQuery, queryParams),
        sql.query(countQuery, countQueryParams)
    ]);

    const totalItems = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalItems / limit);
    const inventory = inventoryResult as InventoryItemAdmin[]; 

    return NextResponse.json({ 
      inventory: inventory, 
      pagination: { page, limit, total: totalItems, totalPages }
    });

  } catch (error: any) {
    console.error('Admin: Failed to get inventory list:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
