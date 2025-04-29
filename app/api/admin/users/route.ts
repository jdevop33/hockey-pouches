// app/api/admin/users/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { userService } from '@/lib/services/user-service'; // Use refactored service
import * as schema from '@/lib/schema'; // Use central schema index
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
      return forbiddenResponse('Admin access required');
    }
    logger.info(`Admin GET /api/admin/users request`, { adminId: authResult.userId });

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const role = searchParams.get('role') as schema.UserRole | null;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (role && !schema.userRoleEnum.enumValues.includes(role)) {
      return NextResponse.json({ message: `Invalid role filter: ${role}` }, { status: 400 });
    }

    const result = await userService.listUsers({
      page, limit, role: role ?? undefined, status: status ?? undefined, search: search ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error('Admin: Failed to get users list:', { error });
    return NextResponse.json({ message: 'Internal Server Error fetching users.' }, { status: 500 });
  }
}

// POST commented out
