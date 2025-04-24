import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';

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

    console.log(`GET /api/users/me/referrals - User: ${userId}, Page: ${page}, Limit: ${limit}`);

    // Get user's referral code
    const userResult = await sql.query(
      `SELECT referral_code FROM users WHERE id = $1`,
      [userId]
    );

    const referralCode = userResult[0]?.referral_code || null;

    if (!referralCode) {
      return NextResponse.json({
        referralCode: null,
        referrals: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Get users referred by this user
    const referralsQuery = `
      SELECT 
        id, 
        name, 
        created_at as join_date,
        (
          SELECT COALESCE(SUM(CAST(o.total_amount AS FLOAT)), 0)
          FROM orders o
          WHERE o.customer_id = users.id
          AND o.status IN ('Shipped', 'Delivered')
        ) as total_sales
      FROM users
      WHERE referred_by_code = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM users 
      WHERE referred_by_code = $1
    `;

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_referrals,
        (
          SELECT COALESCE(SUM(CAST(amount AS FLOAT)), 0)
          FROM commissions
          WHERE user_id = $1
          AND type = 'Order Referral'
        ) as total_commission
      FROM users
      WHERE referred_by_code = $1
    `;

    // Execute all queries concurrently
    const [referralsResult, countResult, summaryResult] = await Promise.all([
      sql.query(referralsQuery, [referralCode, limit, offset]),
      sql.query(countQuery, [referralCode]),
      sql.query(summaryQuery, [userId]),
    ]);

    const totalReferrals = parseInt(countResult[0]?.count || '0');
    const totalPages = Math.ceil(totalReferrals / limit);

    // Format referrals for response
    const referrals = referralsResult.map((row: any) => ({
      id: row.id,
      name: row.name,
      joinDate: row.join_date,
      totalSales: parseFloat(row.total_sales || '0'),
    }));

    // Format summary
    const summary = {
      totalReferrals: parseInt(summaryResult[0]?.total_referrals || '0'),
      totalCommission: parseFloat(summaryResult[0]?.total_commission || '0'),
    };

    return NextResponse.json({
      referralCode,
      referrals,
      summary,
      pagination: {
        page,
        limit,
        total: totalReferrals,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to get user referrals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
