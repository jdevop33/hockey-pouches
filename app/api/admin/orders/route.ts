import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { Order, OrderStatus, Pagination } from '@/types';

export const dynamic = 'force-dynamic';

type AdminOrderListItem = {
  id: number;
  created_at: string;
  status: OrderStatus;
  total_amount: number;
  customer_id: string;
  customer_name: string | null;
  assigned_distributor_id?: string | null;
};

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get('status');
    const customerIdFilter = searchParams.get('customerId');
    const distributorIdFilter = searchParams.get('distributorId');

    console.log(`Admin GET /api/admin/orders - Admin: ${authResult.userId}, Page: ${page}, Limit: ${limit}, Status: ${statusFilter}`);

    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    if (statusFilter) { conditions.push(`o.status = $${paramIndex++}`); queryParams.push(statusFilter); }
    if (customerIdFilter) { conditions.push(`o.user_id = $${paramIndex++}`); queryParams.push(customerIdFilter); }
     if (distributorIdFilter) {
        if (distributorIdFilter === 'unassigned') {
             conditions.push(`o.assigned_distributor_id IS NULL`);
        } else {
             conditions.push(`o.assigned_distributor_id = $${paramIndex++}`);
             queryParams.push(distributorIdFilter);
        }
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const ordersQuery = `
        SELECT
            o.id, o.created_at, o.status,
            CAST(o.total_amount AS FLOAT) as total_amount,
            o.user_id as customer_id, u.name as customer_name,
            o.assigned_distributor_id
        FROM orders o LEFT JOIN users u ON o.user_id = u.id
        ${whereClause} ORDER BY o.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    const countQuery = `SELECT COUNT(*) FROM orders o ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length);

    const [ordersResult, totalResult] = await Promise.all([
        sql.query(ordersQuery, queryParams),
        sql.query(countQuery, countQueryParams)
    ]);

    // Corrected: Access result directly as array
    const totalOrders = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalOrders / limit);
    const orders = ordersResult as AdminOrderListItem[]; // Corrected: Cast array directly

    return NextResponse.json({
      orders: orders,
      pagination: { page, limit, total: totalOrders, totalPages }
    });

  } catch (error: any) {
    console.error('Admin: Failed to get orders:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
