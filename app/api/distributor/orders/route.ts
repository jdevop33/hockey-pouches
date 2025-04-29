import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db'; // Corrected import
import { verifyDistributor, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import * as schema from '@/lib/schema'; // Import schema namespace

export const dynamic = 'force-dynamic';

// Define types based on schema enums
type OrderStatus = typeof schema.orderStatusEnum.enumValues[number];

// Define Pagination interface (assuming basic structure)
// TODO: Verify if a more specific definition exists elsewhere
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Define the structure of the items returned in the list
type DistributorOrderListItem = {
  id: number;
  createdAt: string; // Keep as string from DB for JSON response
  status: OrderStatus;
  totalAmount: number;
  customerName: string | null;
  customerLocation: string | null;
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
     if (!distributorId) {
        return NextResponse.json({ message: 'Distributor ID not found in token' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;
    const statusFilterParam = searchParams.get('status');

    // Validate status filter against enum
    const statusFilter = statusFilterParam && schema.orderStatusEnum.enumValues.includes(statusFilterParam as OrderStatus)
                       ? statusFilterParam as OrderStatus
                       : null;

    console.log(
      `Distributor GET /api/distributor/orders - Distributor: ${distributorId}, Page: ${page}, Limit: ${limit}, Status: ${statusFilter}`
    );

    // Build query conditions
    let conditions = [`o.assigned_distributor_id = $1`];
    let queryParams: (string | number)[] = [distributorId]; // Specify type for queryParams
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
        u.location as customer_location -- Assuming users table has a location column
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY
        CASE
          WHEN o.status = 'ReadyForFulfillment' THEN 1 -- Prioritize orders needing fulfillment
          WHEN o.status = 'Processing' THEN 2
          WHEN o.status = 'PaymentReceived' THEN 3
          ELSE 4
        END,
        o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset); // Add limit and offset

    // Fetch count
    const countQuery = `
      SELECT COUNT(*)
      FROM orders o
      ${whereClause}
    `;

    const [ordersResult, totalResult] = await Promise.all([
      sql.query(ordersQuery, queryParams),
      sql.query(countQuery, queryParams.slice(0, paramIndex - 2)), // Exclude limit/offset params
    ]);

    const totalOrders = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalOrders / limit);

    // Format orders for response
    const orders: DistributorOrderListItem[] = ordersResult.map((row: any) => ({
      id: row.id,
      createdAt: row.created_at, // Keep as string
      status: row.status as OrderStatus, // Cast to OrderStatus
      totalAmount: row.total_amount,
      customerName: row.customer_name,
      customerLocation: row.customer_location,
    }));

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to get distributor orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
