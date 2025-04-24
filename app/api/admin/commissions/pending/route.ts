import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

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
  // TODO: Add Admin Auth Check
  // Extract dynamic data *before* awaits
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;
  const userIdFilter = searchParams.get('userId');

  console.log(
    `Admin GET /api/admin/commissions/pending - Page: ${page}, Limit: ${limit}, User: ${userIdFilter}`
  );

  try {
    // TODO: Verify auth token

    // Build WHERE clause
    let conditions = ["status = 'Pending Payout'"]; // Always filter by Pending
    let queryParams: any[] = [];
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
    queryParams.push(limit.toString(), offset.toString());

    // Fetch Count
    const countQuery = `SELECT COUNT(*) FROM commissions c ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length - 1); // Exclude limit/offset params

    const [commissionsResult, totalResult] = await Promise.all([
      sql.query(commissionsQuery, queryParams),
      sql.query(countQuery, countQueryParams),
    ]);

    const totalPending = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalPending / limit);
    const commissions = commissionsResult as AdminCommission[];

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
