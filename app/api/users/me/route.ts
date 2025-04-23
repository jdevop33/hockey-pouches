import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import sql from '@/lib/db';

// Define the structure of the JWT payload we expect
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Define the user data we want to return from GET (excluding sensitive info)
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    referral_code: string | null;
    created_at: string; 
}

// Define the fields allowed for update
interface UpdateProfileBody {
    name?: string;
    // Add other updatable fields here later
}

// Helper function to verify token and get userId 
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
        console.log('VerifyToken: Token missing');
        return null;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('VerifyToken: JWT_SECRET is not set!');
        throw new Error('Server configuration error.'); 
    }
    try {
      const decodedPayload = jwt.verify(token, jwtSecret) as JwtPayload;
      console.log('VerifyToken: Token verified, userId:', decodedPayload.userId);
      return decodedPayload.userId;
    } catch (error) {
      console.warn('VerifyToken: Verification failed:', error);
      return null; 
    } 
}


// --- GET Handler: Fetch current user profile --- 
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    // Fetch User Data from DB
    console.log(`GET /me: Fetching profile for user ID: ${userId}`);
    // Removed type argument from sql tag
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
    if (error instanceof Error && error.message === 'Server configuration error.') {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error('GET /me: Failed to get user profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler: Update current user profile --- 
export async function PUT(request: NextRequest) {
  let userId: string | null = null; 
  try {
     userId = await getUserIdFromToken(request);
     if (!userId) {
         return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
     }

     const body: UpdateProfileBody = await request.json();
     const { name } = body; 

     console.log(`PUT /me: Update user profile request for user ID: ${userId}`, body);

     if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
         return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
     }
     const trimmedName = name?.trim();

     if (trimmedName) { 
         console.log(`PUT /me: Updating name for user ${userId}...`);
         // Removed .count check - assume success if no error
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
     if (error instanceof Error && error.message === 'Server configuration error.') {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error(`PUT /me: Failed to update profile for user ${userId || '(unknown)'}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
   }
}
