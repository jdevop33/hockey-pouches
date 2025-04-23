import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Added
import sql from '@/lib/db';

// Define expected request body
interface LoginBody {
  email?: string;
  password?: string;
}

// Define expected user data from DB
interface UserWithPasswordHash {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    password_hash: string;
}

// Define the structure of the data we'll put in the JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: Request) {
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
    console.log('Finding user by email...');
    const result = await sql` 
        SELECT id, email, name, role, status, password_hash 
        FROM users 
        WHERE email = ${lowerCaseEmail}
    `;
    const users = result as UserWithPasswordHash[];

    if (users.length === 0) {
        console.warn('Login failed: User not found', lowerCaseEmail);
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const user = users[0];
    console.log('User found:', user.email, 'Status:', user.status);

    if (user.status !== 'Active') {
        console.warn('Login failed: User status is not Active', { email: user.email, status: user.status });
         return NextResponse.json({ message: 'Account is not active.' }, { status: 403 });
    }

    console.log('Verifying password...');
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        console.warn('Login failed: Password mismatch for', user.email);
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    console.log('Password verified successfully for:', user.email);

    // --- Generate JWT Token --- 
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET environment variable is not set!');
        throw new Error('Server configuration error.'); // Don't expose details
    }

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    console.log('Generating JWT...');
    const token = jwt.sign(payload, jwtSecret, { 
        expiresIn: '1d' // Example: token expires in 1 day (adjust as needed)
    });
    console.log('JWT generated.');

    // --- Success Response --- 
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
    console.error('Login API error:', error);
    // Return generic error for security
    return NextResponse.json({ message: error.message === 'Server configuration error.' ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
