import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
// Removed QueryResult import as it's not returned by default
// import { QueryResult } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

type AdminOrder = {
  id: number; // Changed to number to match SERIAL type from DB
  date: string;
  customerName: string;
  customerId: string;
  total: number;
  status: string; 
  distributorId?: string | null;
};

export async function GET(request: NextRequest) {
  try {
    // TODO: Add Admin Auth Check here!
    const searchParams = request.nextUrl.searchParams; 
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15'); 
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get('status');
    
    console.log(`Admin GET /api/admin/orders - Page: ${page}, Limit: ${limit}, Status: ${statusFilter}`);

    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    if (statusFilter) {
        conditions.push(`status = $${paramIndex++}`);
        queryParams.push(statusFilter);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch Orders
    // Note: Selecting specific columns and casting numeric types
    const ordersQuery = `
        SELECT 
            id, 
            created_at as date, 
            shipping_address->>'name' as customerName, -- Example: extract name from JSON
            user_id as customerId, 
            CAST(total_amount AS FLOAT) as total, 
            status, 
            assigned_distributor_id as distributorId 
        FROM orders 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);
    
    // Fetch Total Count with same filters
    const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length); 

    // Execute concurrently
    const [ordersResult, totalResult] = await Promise.all([
        sql.query(ordersQuery, queryParams),
        sql.query(countQuery, countQueryParams)
    ]);

    // Access results directly as arrays
    const totalOrders = parseInt(totalResult[0]?.count || '0'); // Access count from the first row
    const totalPages = Math.ceil(totalOrders / limit);
    const orders = ordersResult as AdminOrder[]; // Cast the array of rows

    return NextResponse.json({ 
      orders: orders, 
      pagination: { page, limit, total: totalOrders, totalPages }
    });

  } catch (error) {
    console.error('Admin: Failed to get orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
