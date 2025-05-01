import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface VerifyRequest {
  userId?: string;
}

export async function POST(request: Request) {
  try {
    // Get the auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check if we have a token
    if (!token) {
      return NextResponse.json(
        { verified: false, message: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set!');
      return NextResponse.json(
        { verified: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };

      // Check if the user exists and is active
      const result = await sql`
        SELECT id, status FROM users WHERE id = ${$1?.$2}
      `;

      if ($1?.$2h === 0) {
        return NextResponse.json({ verified: false, message: 'User not found' }, { status: 404 });
      }

      const user = result[0];

      if (user.status !== 'Active') {
        return NextResponse.json(
          { verified: false, message: 'Account is not active' },
          { status: 403 }
        );
      }

      // User is verified
      return NextResponse.json({ verified: true });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { verified: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { verified: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
