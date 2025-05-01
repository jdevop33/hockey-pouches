import { NextResponse, type NextRequest } from 'next/server';
import { db, sql } from '@/lib/db'; // Use db instance and sql helper
import { verifyDistributor, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import * as schema from '@/lib/schema'; // Import schema namespace
import { logger } from '@/lib/logger'; // Use logger

export const dynamic = 'force-dynamic';

// Define types based on schema enums
type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number];

// Define Pagination interface
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

// Type for database row (adjust based on actual query result)
interface OrderRow {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  customer_name: string | null;
  customer_location: string | null;
}

interface CountRow {
    count: string | number; // Count might return as string
}

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
        logger.warn('Distributor ID not found in token');
      return NextResponse.json({ message: 'Distributor ID not found in token' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = (page - 1) * limit;
    const statusFilterParam = searchParams.get('status');

    // Validate status filter against enum
    const statusFilter =
      statusFilterParam &&
      schema.orderStatusEnum.enumValues.includes(statusFilterParam as OrderStatus)
        ? (statusFilterParam as OrderStatus)
        : null;

    logger.info('Fetching distributor orders', {
        distributorId, page, limit, offset, statusFilter
    });

    // Build query conditions using Drizzle sql helper for safe parameter embedding
    const conditions = [sql`o.assigned_distributor_id = ${distributorId}`];
    if (statusFilter) {
        conditions.push(sql`o.status = ${statusFilter}`);
    }
    const whereClause = sql.join(conditions, sql` AND `);

    // Fetch orders assigned to this distributor using db.execute and sql tag
    const ordersQuery = sql`
      SELECT
        o.id, o.created_at, o.status,
        CAST(o.total_amount AS FLOAT) as total_amount,
        u.name as customer_name,
        u.location as customer_location -- Assuming users table has a location column
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE ${whereClause}
      ORDER BY
        CASE
          WHEN o.status = 'ReadyForFulfillment' THEN 1 -- Prioritize orders needing fulfillment
          WHEN o.status = 'Processing' THEN 2
          WHEN o.status = 'PaymentReceived' THEN 3
          ELSE 4
        END,
        o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Fetch count using db.execute and sql tag
    const countQuery = sql`
      SELECT COUNT(*) as count
      FROM orders o
      WHERE ${whereClause}
    `;

    // Execute queries
    // Note: db.execute returns a driver-specific result. For neon-http it's NeonHttpQueryResult
    // which has a `rows` property.
    const [ordersResult, totalResult] = await Promise.all([
        db.execute(ordersQuery),
        db.execute(countQuery),
    ]);

    // Safely access rows and count
    const orderRows = ordersResult.rows as OrderRow[]; // Cast rows after accessing
    const countRow = totalResult.rows[0] as CountRow; // Cast row after accessing
    const totalOrders = parseInt(String(countRow?.count || '0')); // Convert count safely
    const totalPages = Math.ceil(totalOrders / limit);

    logger.info(`Found ${totalOrders} orders for distributor`, { distributorId });

    // Format orders for response
    const orders: DistributorOrderListItem[] = orderRows.map((row: OrderRow) => ({
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
    const errorMessage = error instanceof Error ? errorMessage : String(error);
    logger.error('Failed to get distributor orders', { error });
    const errorMessage = error instanceof Error ? errorMessage : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
