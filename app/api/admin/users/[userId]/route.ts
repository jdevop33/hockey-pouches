import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { User, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

// Type for user details returned by GET
interface AdminUserDetails {
  id: string; name: string; email: string; role: string;
  status: string; created_at: string; lastLogin?: string | null;
  referral_code?: string | null; referred_by_code?: string | null;
  location?: string | null;
}

// Type for allowed update fields in PUT request
interface UpdateUserBody {
    name?: string;
    role?: UserRole;
    location?: string | null;
}

// Valid roles constant
const VALID_ROLES: UserRole[] = ['Admin', 'Distributor', 'Retail Customer', 'Wholesale Buyer'];

// --- GET Handler ---
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
  const { userId } = params;

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

    console.log(`GET /api/admin/users/${userId} request by admin: ${authResult.userId}`);

    const result = await sql`
        SELECT id, name, email, role, status, created_at, last_login, referral_code, referred_by_code, location
        FROM users WHERE id = ${userId}
    `;
    if (result.length === 0) return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    return NextResponse.json(result[0] as AdminUserDetails);
  } catch (error: any) {
    console.error(`Admin: Failed to get user ${userId}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler (Update User) ---
export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
  const { userId } = params;

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

    console.log(`PUT /api/admin/users/${userId} request by admin: ${authResult.userId}`);

    const body: UpdateUserBody = await request.json();
    console.log(`Admin request body for user ${userId}:`, body);

    // --- Validation ---
    if (Object.keys(body).length === 0) return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
    if (body.role !== undefined && !VALID_ROLES.includes(body.role)) return NextResponse.json({ message: `Invalid role specified: ${body.role}` }, { status: 400 });

    // --- Construct SET clause ---
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;
    const addUpdateField = (fieldName: keyof UpdateUserBody, dbColumn: string, value: any) => {
        if (value !== undefined) {
            const finalValue = (value === null || value === '') && dbColumn === 'location' ? null : (typeof value === 'string' ? value.trim() : value);
            fieldsToUpdate.push(`${dbColumn} = $${valueIndex++}`);
            values.push(finalValue);
        }
    };
    addUpdateField('name', 'name', body.name);
    addUpdateField('role', 'role', body.role);
    addUpdateField('location', 'location', body.location);
    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No valid fields to update provided.' }, { status: 400 });
    fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

    // --- Update user in DB ---
    console.log(`Admin: Updating user ${userId} with fields: ${fieldsToUpdate.join(', ')}`);
    const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = $${valueIndex}`;
    values.push(userId);

    // Execute query - assume success if no error
    await sql.query(updateQuery, values);
    console.log(`Admin: User ${userId} update attempted successfully.`);

    // --- Return updated user data ---
     const updatedUserResult = await sql`
        SELECT id, name, email, role, status, created_at, last_login, referral_code, referred_by_code, location
        FROM users WHERE id = ${userId}
    `;
    if (updatedUserResult.length === 0) {
        // Should not happen if update didn't throw, but check anyway
         return NextResponse.json({ message: 'User not found after update.' }, { status: 404 });
    }

    return NextResponse.json(updatedUserResult[0] as AdminUserDetails);

  } catch (error: any) {
     if (error instanceof SyntaxError) return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
     console.error(`Admin: Failed to update user ${userId}:`, error);
     return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
