import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import sql from '@/lib/db'; // Using updated alias

// Define expected request body
interface LoginBody {
  email?: string;
  password?: string;
}

// Define expected user data from DB (including password hash)
interface UserWithPasswordHash {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    password_hash: string;
}

export async function POST(request: Request) {
  // TODO:
  // - Generate authentication token (e.g., JWT)
  // - Return token and user info (excluding password hash!) or error

  try {
    const body: LoginBody = await request.json();
    const { email, password } = body;

    // --- Input Validation --- 
    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) { 
      return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
    }
     const lowerCaseEmail = email.toLowerCase();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ message: 'Password is required.' }, { status: 400 });
    }

    console.log('Login attempt for:', lowerCaseEmail);

    // --- Database & Verification Logic --- 

    // 1. Find user by email
    console.log('Finding user by email...');
    // Removed the type argument from sql tag
    const result = await sql`
        SELECT id, email, name, role, status, password_hash 
        FROM users 
        WHERE email = ${lowerCaseEmail}
    `;

    // Assert the type on the result
    const users = result as UserWithPasswordHash[];

    if (users.length === 0) {
        console.warn('Login failed: User not found', lowerCaseEmail);
        // Use a generic error message for security
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 }); // Unauthorized
    }

    const user = users[0];
    console.log('User found:', user.email, 'Status:', user.status);

    // Optional: Check user status (e.g., prevent suspended users from logging in)
    if (user.status !== 'Active') {
        console.warn('Login failed: User status is not Active', { email: user.email, status: user.status });
         return NextResponse.json({ message: 'Account is not active.' }, { status: 403 }); // Forbidden
    }

    // 2. Verify password
    console.log('Verifying password...');
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        console.warn('Login failed: Password mismatch for', user.email);
        // Use a generic error message for security
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 }); // Unauthorized
    }

    console.log('Password verified successfully for:', user.email);

    // --- TODO: Generate JWT Token --- 
    const token = 'dummy-jwt-token-needs-replacement'; // Replace with actual JWT generation

    // --- Success Response --- 
    // Return essential user info (NO password hash) and the token
    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    // TODO: Decide how to send token (JSON body? HttpOnly Cookie?)
    // Sending in body for now:
    return NextResponse.json({ message: 'Login successful', token: token, user: userResponse });

  } catch (error: any) {
    if (error instanceof SyntaxError) {
         return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error('Login failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
