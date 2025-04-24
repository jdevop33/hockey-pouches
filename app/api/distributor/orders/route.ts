import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyDistributor, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { Order, OrderStatus, Pagination } from '@/types';

export const dynamic = 'force-dynamic';

type DistributorOrderListItem = {
  id: number;
  created_at: string;
  status: OrderStatus;
  total_amount: number;
  customer_name: string | null;
  customer_location: string | null;
};

export async function GET(request: NextRequest) {
  try {
    // Verify distributor authentication
    const authResult = await verifyDistributor(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }
    
    // Check if user is a distributor
    if (authResult.role !== 'Distributor') {
      return forbiddenResponse('Only distributors can access this resource');
    }
    
    const distributorId = authResult.userId;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get('status');
    
    console.log(`Distributor GET /api/distributor/orders - Distributor: ${distributorId}, Page: ${page}, Limit: ${limit}, Status: ${statusFilter}`);

    // Build query conditions
    let conditions = [`o.assigned_distributor_id = $1`];
    let queryParams = [distributorId];
    let paramIndex = 2;

    if (statusFilter) {
      conditions.push(`o.status = $${paramIndex++}`);
      queryParams.push(statusFilter);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Fetch orders assigned to this distributor
    const ordersQuery = `
      SELECT 
        o.id, o.created_at, o.status, 
        CAST(o.total_amount AS FLOAT) as total_amount,
        u.name as customer_name,
        u.location as customer_location
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN o.status = 'Awaiting Fulfillment' THEN 1
          WHEN o.status = 'Pending Fulfillment Verification' THEN 2
          ELSE 3
        END,
        o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Fetch count
    const countQuery = `
      SELECT COUNT(*) 
      FROM orders o
      ${whereClause}
    `;

    const [ordersResult, totalResult] = await Promise.all([
      sql.query(ordersQuery, queryParams),
      sql.query(countQuery, queryParams.slice(0, paramIndex - 2)) // Exclude limit/offset params
    ]);

    const totalOrders = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Format orders for response
    const orders = ordersResult.map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      status: row.status,
      totalAmount: row.total_amount,
      customerName: row.customer_name,
      customerLocation: row.customer_location
    }));

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages
      }
    });

  } catch (error) {
    console.error('Failed to get distributor orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
