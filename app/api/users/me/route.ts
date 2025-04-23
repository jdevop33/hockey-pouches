import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import sql from '@/lib/db';

// Define the structure of the JWT payload we expect
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Define the user data we want to return (excluding sensitive info)
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    referral_code: string | null;
    created_at: string; // Adjust type if needed (e.g., Date)
}

// --- GET Handler: Fetch current user profile --- 
export async function GET(request: NextRequest) {
  try {
    // 1. Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return NextResponse.json({ message: 'Authentication token missing.' }, { status: 401 });
    }

    // 2. Verify JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not set!');
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    let decodedPayload: JwtPayload;
    try {
      decodedPayload = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch (error) {
      console.warn('JWT verification failed:', error);
      // Handle expired or invalid tokens
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ message: 'Token expired.' }, { status: 401 });
      }
      return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
    }

    const { userId } = decodedPayload;
    if (!userId) {
        return NextResponse.json({ message: 'Invalid token payload.' }, { status: 401 });
    }

    // 3. Fetch User Data from DB
    console.log(`Fetching profile for user ID: ${userId}`);
    const users = await sql<UserProfile[]>`
        SELECT id, name, email, role, status, referral_code, created_at 
        FROM users 
        WHERE id = ${userId}
    `;

    if (users.length === 0) {
        console.error(`User not found in DB despite valid token: ${userId}`);
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userProfile = users[0];
    console.log(`Profile fetched for: ${userProfile.email}`);

    // 4. Return User Data
    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler: Update current user profile --- 
export async function PUT(request: NextRequest) {
  try {
     // TODO: Reuse the JWT verification logic from GET to get the userId
     // 1. Verify Authentication & Extract userId
     // ... (similar logic as GET using headers, jwt.verify) ...
     const userId = 'placeholder-get-user-id-from-token'; // Replace with actual logic
     if (!userId) {
         return NextResponse.json({ message: 'Unauthorized or Invalid Token' }, { status: 401 });
     }

     // 2. Get request body
     const body = await request.json();
     // TODO: Add input validation for fields being updated (e.g., name, email format?)
     const { name, email /* other updatable fields */ } = body;

     console.log(`Update user profile request for user ID: ${userId}`, body);

     // 3. Update User Data in DB
     // TODO: Construct the SET part of the query dynamically based on provided fields
     // Example (only updating name):
     // await sql`UPDATE users SET name = ${name}, updated_at = CURRENT_TIMESTAMP WHERE id = ${userId}`;

     // 4. Optionally fetch and return updated profile or just success
     return NextResponse.json({ message: 'Profile updated successfully' }); // Placeholder

   } catch (error: any) {
    if (error instanceof SyntaxError) {
         return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
   }
}
