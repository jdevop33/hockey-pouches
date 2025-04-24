import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from '@/lib/db';
import { withRateLimit, rateLimits, RateLimitWindow } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/csrf';

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

export const POST = withRateLimit(
  withCsrfProtection(async (request: NextRequest) => {
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

      logger.info('Login attempt', { email: lowerCaseEmail });

      // --- Database & Verification Logic ---
      logger.debug('Finding user by email', { email: lowerCaseEmail });
      const result = await sql`
        SELECT id, email, name, role, status, password_hash
        FROM users
        WHERE email = ${lowerCaseEmail}
    `;
      const users = result as UserWithPasswordHash[];

      if (users.length === 0) {
        logger.warn('Login failed: User not found', { email: lowerCaseEmail });
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
      }

      const user = users[0];
      logger.debug('User found', { email: user.email, status: user.status });

      if (user.status !== 'Active') {
        logger.warn('Login failed: User status is not Active', {
          email: user.email,
          status: user.status,
        });
        return NextResponse.json({ message: 'Account is not active.' }, { status: 403 });
      }

      logger.debug('Verifying password', { email: user.email });
      const passwordMatches = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatches) {
        logger.warn('Login failed: Password mismatch', { email: user.email });
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
      }

      logger.debug('Password verified successfully', { email: user.email });

      // --- Generate JWT Token ---
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET environment variable is not set!');
        throw new Error('Server configuration error.'); // Don't expose details
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      logger.debug('Generating JWT', { userId: user.id, role: user.role });
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '1d', // Example: token expires in 1 day (adjust as needed)
      });
      logger.debug('JWT generated', { userId: user.id });

      // --- Success Response ---
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      // Return the token in the response body for the client to store in localStorage
      const response = NextResponse.json({
        message: 'Login successful',
        user: userResponse,
        token: token, // Include token in response body
      });

      // Also send token in Authorization header for immediate use
      response.headers.set('Authorization', `Bearer ${token}`);

      return response;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
      }
      logger.error('Login API error', {}, error);
      // Return generic error for security
      return NextResponse.json(
        {
          message:
            error.message === 'Server configuration error.'
              ? error.message
              : 'Internal Server Error',
        },
        { status: 500 }
      );
    }
  }),
  {
    limit: rateLimits.auth.login.limit,
    window: rateLimits.auth.login.window,
  }
);
