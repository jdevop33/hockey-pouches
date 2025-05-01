import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { db, sql } from '@/lib/db';
import { getRows } from '@/lib/db-types';

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
    

    // Query using SQL tagged templates instead of string interpolation
    let commissionsQuery;
    let countQuery;

    if (userIdFilter) {
      // With user filter
      commissionsQuery = await db.execute(sql`
        SELECT c.id, c.user_id as "userId", u.name as "userName", c.order_id as "orderId",
               c.type, CAST(c.amount AS FLOAT) as amount, c.status, c.earned_date as "earnedDate"
        FROM commissions c
        JOIN users u ON c.user_id = u.id
        WHERE c.status = 'Pending Payout' AND c.user_id = ${userIdFilter}
        ORDER BY c.earned_date ASC
        LIMIT ${limit} OFFSET ${offset}
      `);

      countQuery = await db.execute(sql`
        SELECT COUNT(*) as count FROM commissions c 
        WHERE c.status = 'Pending Payout' AND c.user_id = ${userIdFilter}
      `);
    } else {
      // Without user filter
      commissionsQuery = await db.execute(sql`
        SELECT c.id, c.user_id as "userId", u.name as "userName", c.order_id as "orderId",
               c.type, CAST(c.amount AS FLOAT) as amount, c.status, $1?.$2 as "earnedDate"
        FROM commissions c
        JOIN users u ON $1?.$2 = u.id
        WHERE c.status = 'Pending Payout'
        ORDER BY c.earned_date ASC
        LIMIT ${limit} OFFSET ${offset}
      `);

      countQuery = await db.execute(sql`
        SELECT COUNT(*) as count FROM commissions c WHERE c.status = 'Pending Payout'
      `);
    }

    // Convert query results to arrays
    const commissions = getRows(commissionsQuery as unknown as DbQueryResult) as AdminCommission[];
    const totalRows = getRows(countQuery as unknown as DbQueryResult);

    // Parse the count (ensuring we have a string count property)
    const totalPending = parseInt(String(Array.isArray(totalRows) ? Array.isArray(totalRows) ? Array.isArray(totalRows) ? Array.isArray(totalRows) ? totalRows[0] : null : null : null : null?.count || '0'), 10);
    const totalPages = Math.ceil(totalPending / limit);

    return NextResponse.json({
      commissions: commissions,
      pagination: { page, limit, total: totalPending, totalPages },
    });
  } catch (error: unknown) {
    console.error('Admin: Failed to get pending commissions:', error);
    return NextResponse.json(
      { message: errorMessage || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
