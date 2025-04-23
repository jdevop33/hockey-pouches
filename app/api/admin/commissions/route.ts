import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

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
  // TODO: Add Admin Auth Check (using headers)
  // Extract dynamic data *before* awaits
  const authHeader = request.headers.get('authorization'); // Example: Read headers first
  const searchParams = request.nextUrl.searchParams; 
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20'); 
  const offset = (page - 1) * limit;
  const statusFilter = searchParams.get('status');
  const userIdFilter = searchParams.get('userId');

  console.log(`Admin GET /api/admin/commissions - Page: ${page}, Limit: ${limit}, Status: ${statusFilter}, User: ${userIdFilter}`);

  try {
    // Verify auth token *after* extracting other params
    // TODO: Implement verifyAdmin(authHeader) check

    // Build WHERE clause
    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    if (statusFilter) { conditions.push(`status = $${paramIndex++}`); queryParams.push(statusFilter); }
    if (userIdFilter) { conditions.push(`user_id = $${paramIndex++}`); queryParams.push(userIdFilter); }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch Commissions
    const commissionsQuery = `
        SELECT c.id, c.user_id as userId, u.name as userName, c.order_id as orderId, 
               c.type, CAST(c.amount AS FLOAT) as amount, c.status, c.earned_date as earnedDate, 
               c.payout_date as payoutDate, c.payout_batch_id as payoutBatchId
        FROM commissions c 
        JOIN users u ON c.user_id = u.id 
        ${whereClause} 
        ORDER BY c.earned_date DESC 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Fetch Count
    const countQuery = `SELECT COUNT(*) FROM commissions c ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length);

    const [commissionsResult, totalResult] = await Promise.all([
        sql.query(commissionsQuery, queryParams),
        sql.query(countQuery, countQueryParams)
    ]);

    const totalCommissions = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalCommissions / limit);
    const commissions = commissionsResult as AdminCommission[]; 

    return NextResponse.json({ 
      commissions: commissions, 
      pagination: { page, limit, total: totalCommissions, totalPages }
    });

  } catch (error: any) {
    console.error('Admin: Failed to get commissions:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
