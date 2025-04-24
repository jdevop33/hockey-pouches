import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { User } from '@/types';

// Define the user data we want to return from GET (excluding sensitive info)
type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'role' | 'status' | 'referral_code' | 'created_at'>;

// Define the fields allowed for update
interface UpdateProfileBody {
    name?: string;
    // Add other updatable fields here later
}

// --- GET Handler: Fetch current user profile ---
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;

    // Fetch User Data from DB
    console.log(`GET /me: Fetching profile for user ID: ${userId}`);
    const result = await sql`
        SELECT id, name, email, role, status, referral_code, created_at
        FROM users
        WHERE id = ${userId}
    `;
    // Assert type on the result
    const users = result as UserProfile[];

    if (users.length === 0) {
        console.error(`GET /me: User not found in DB despite valid token: ${userId}`);
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userProfile = users[0];
    console.log(`GET /me: Profile fetched for: ${userProfile.email}`);
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('GET /me: Failed to get user profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler: Update current user profile ---
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    const body: UpdateProfileBody = await request.json();
    const { name } = body;

    console.log(`PUT /me: Update user profile request for user ID: ${userId}`, body);

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
    }
    const trimmedName = name?.trim();

    if (trimmedName) {
        console.log(`PUT /me: Updating name for user ${userId}...`);
        await sql`
            UPDATE users
            SET name = ${trimmedName}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
        `;
        console.log(`PUT /me: Name updated for user ${userId}.`);
    } else {
        console.log(`PUT /me: No name provided in update for user ${userId}, skipping DB update.`);
    }

    // TODO: Add logic to update other fields if needed

    return NextResponse.json({ message: 'Profile updated successfully' });

  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`PUT /me: Failed to update profile:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
