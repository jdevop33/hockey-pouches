import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { User, Pagination } from '@/types';

export const dynamic = 'force-dynamic';

// AdminUser type for the response format
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  status: User['status'];
  joinDate: string;
  location?: string | null;
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
    const filterRole = searchParams.get('role');
    const filterStatus = searchParams.get('status');

    console.log(`Admin GET /api/admin/users - Admin: ${authResult.userId}, Page: ${page}, Limit: ${limit}, Role: ${filterRole}, Status: ${filterStatus}`);

    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    if (filterRole) { conditions.push(`role = $${paramIndex++}`); queryParams.push(filterRole); }
    if (filterStatus) { conditions.push(`status = $${paramIndex++}`); queryParams.push(filterStatus); }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch Users
    const usersQuery = `
        SELECT id, name, email, role, status, created_at as joinDate, location
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Fetch Count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length);

    console.log('Executing Admin Users Query:', usersQuery, queryParams);
    console.log('Executing Admin Users Count Query:', countQuery, countQueryParams);

    const [usersResult, totalResult] = await Promise.all([
        sql.query(usersQuery, queryParams),
        sql.query(countQuery, countQueryParams)
    ]);

    // Corrected: Access result directly as array
    const totalUsers = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalUsers / limit);
    const users = usersResult as AdminUser[]; // Cast the array directly

    return NextResponse.json({
      users: users,
      pagination: { page, limit, total: totalUsers, totalPages }
    });

  } catch (error: any) {
    console.error('Admin: Failed to get users:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
