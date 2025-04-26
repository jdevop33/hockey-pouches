import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { queryRows } from '@/lib/query';

export const dynamic = 'force-dynamic';

// Reuse type from main commissions route
type AdminCommission = {
  id: string;
  userId: string;
  userName: string;
  orderId?: string;
  type: 'Referral Sale' | 'Fulfillment' | 'Wholesale Referral' | 'Bonus';
  amount: number;
  status: 'Pending Payout' | 'Paid' | 'Cancelled';
  earnedDate: string;
  payoutDate?: string | null;
  payoutBatchId?: string | null;
};

export async function GET(request: NextRequest) {
  // Extract dynamic data *before* awaits
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;
  const userIdFilter = searchParams.get('userId');

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
    console.log(
      `Admin GET /api/admin/commissions/pending - Admin: ${adminUserId}, Page: ${page}, Limit: ${limit}, User: ${userIdFilter}`
    );

    // Build WHERE clause
    const conditions = ["status = 'Pending Payout'"]; // Always filter by Pending
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;
    if (userIdFilter) {
      conditions.push(`user_id = $${paramIndex++}`);
      queryParams.push(userIdFilter);
    }
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Fetch Pending Commissions
    const commissionsQuery = `
        SELECT c.id, c.user_id as userId, u.name as userName, c.order_id as orderId,
               c.type, CAST(c.amount AS FLOAT) as amount, c.status, c.earned_date as earnedDate
        FROM commissions c
        JOIN users u ON c.user_id = u.id
        ${whereClause}
        ORDER BY c.earned_date ASC -- Oldest pending first?
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Fetch Count
    const countQuery = `SELECT COUNT(*) FROM commissions c ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length - 1); // Exclude limit/offset params

    const [commissions, totalRows] = await Promise.all([
      queryRows<AdminCommission>(commissionsQuery, queryParams),
      queryRows<{ count: string }>(countQuery, countQueryParams),
    ]);

    const totalPending = parseInt(totalRows[0]?.count ?? '0', 10);
    const totalPages = Math.ceil(totalPending / limit);

    return NextResponse.json({
      commissions: commissions,
      pagination: { page, limit, total: totalPending, totalPages },
    });
  } catch (error: any) {
    console.error('Admin: Failed to get pending commissions:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
