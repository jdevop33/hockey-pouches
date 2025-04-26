import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';
import { Commission, Pagination } from '@/types';
import { getRows } from '@/lib/db-types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get('status');

    console.log(
      `GET /api/users/me/commissions - User: ${userId}, Page: ${page}, Limit: ${limit}, Status: ${statusFilter}`
    );

    // Build query conditions
    let conditions = [`user_id = $1`];
    let queryParams = [userId];
    let paramIndex = 2;

    if (statusFilter) {
      conditions.push(`status = $${paramIndex++}`);
      queryParams.push(statusFilter);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Fetch commissions
    const commissionsQuery = `
      SELECT
        id, order_id, type, CAST(amount AS FLOAT) as amount,
        status, earned_date, payout_date, payout_batch_id
      FROM commissions
      ${whereClause}
      ORDER BY earned_date DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit.toString(), offset.toString());

    // Fetch count
    const countQuery = `SELECT COUNT(*) FROM commissions ${whereClause}`;

    const [commissionsResult, totalResult] = await Promise.all([
      sql.query(commissionsQuery, queryParams),
      sql.query(countQuery, queryParams.slice(0, paramIndex - 2)), // Exclude limit/offset params
    ]);

    const totalRows = getRows(totalResult) as Array<{ count: string }>;
    const totalCommissions = parseInt(totalRows[0]?.count ?? '0', 10);
    const totalPages = Math.ceil(totalCommissions / limit);

    // Format commissions for response
    const commissionRows = getRows(commissionsResult);
    const commissions = commissionRows.map((row: any) => ({
      id: row.id,
      orderId: row.order_id,
      type: row.type,
      amount: row.amount,
      status: row.status,
      earnedDate: row.earned_date,
      payoutDate: row.payout_date,
      payoutBatchId: row.payout_batch_id,
    }));

    return NextResponse.json({
      commissions,
      pagination: {
        page,
        limit,
        total: totalCommissions,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to get user commissions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
