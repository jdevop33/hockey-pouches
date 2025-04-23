import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
// TODO: Add admin auth check

// Explicitly force dynamic rendering
export const dynamic = 'force-dynamic';

// Placeholder Type
type AdminOrder = {
  id: string;
  date: string;
  customerName: string;
  customerId: string;
  total: number;
  status: string; 
  distributorId?: string | null;
};

export async function GET(request: NextRequest) {
  // TODO: Add Admin Auth Check here!
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15'); 
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get('status');
    
    console.log(`Admin GET /api/admin/orders - Page: ${page}, Limit: ${limit}, Status: ${statusFilter}`);

    // Build WHERE clause dynamically (Example)
    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    if (statusFilter) {
        conditions.push(`status = $${paramIndex++}`);
        queryParams.push(statusFilter);
    }
    // Add more conditions for other filters...
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch Orders
    const ordersQuery = `
        SELECT id, created_at as date, customer_name as customerName, user_id as customerId, total_amount as total, status, assigned_distributor_id as distributorId 
        FROM orders 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);
    
    // Fetch Total Count with same filters
    const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length); // Only use filter params for count

    // Execute concurrently
    const [ordersResult, totalResult] = await Promise.all([
        sql.query(ordersQuery, queryParams),
        sql.query(countQuery, countQueryParams)
    ]);

    const totalOrders = parseInt(totalResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(totalOrders / limit);
    const orders = ordersResult.rows as AdminOrder[]; 

    return NextResponse.json({ 
      orders: orders, 
      pagination: { page, limit, total: totalOrders, totalPages }
    });

  } catch (error) {
    console.error('Admin: Failed to get orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
