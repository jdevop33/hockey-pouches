// app/api/admin/users/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { userService } from '@/lib/services/user-service'; // Use refactored service
import { users } from '@/lib/schema/users';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use central schema index
import { logger } from '@/lib/logger';
export const dynamic = 'force-dynamic';
// Define type based on the schema enum
type UserRole = typeof schema.userRoleEnum.enumValues[number];
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
    const roleParam = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    // Validate and cast role parameter
    const role = roleParam && schema.userRoleEnum.enumValues.includes(roleParam as UserRole)
                 ? roleParam as UserRole
                 : null;
    if (roleParam && !role) { // Check if a role was provided but was invalid
      return NextResponse.json({ message: `Invalid role filter: ${roleParam}` }, { status: 400 });
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
