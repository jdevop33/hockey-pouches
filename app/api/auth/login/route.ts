// app/api/auth/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { userService } from '@/lib/services/user-service'; // Import refactored service
import { withRateLimit, rateLimits } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/csrf-server';
import { generateRefreshToken } from '@/lib/auth';
import { z } from 'zod';

// Zod schema for login request validation
const loginSchema = z.object({
  email: z.string().email('Valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const POST = withRateLimit(
  withCsrfProtection(async (request: NextRequest) => {
    try {
      const body = await request.json();

      // --- Input Validation with Zod ---
      const validationResult = loginSchema.safeParse(body);
      if (!validationResult.success) {
        logger.warn('Login validation failed', {
          errors: validationResult.error.flatten().fieldErrors,
        });
        // Return a generic message but log specific errors
        return NextResponse.json({ message: 'Invalid email or password format.' }, { status: 400 });
      }
      const { email, password } = validationResult.data;
      const lowerCaseEmail = email.toLowerCase();

      logger.info('Login attempt', { email: lowerCaseEmail });

      // --- Call Authentication Service ---
      // The service handles finding user, checking status, comparing password, and generating JWT
      const authResult = await userService.authenticate(lowerCaseEmail, password);

      if (!authResult.success || !authResult.token || !authResult.user) {
        logger.warn('Login failed', { email: lowerCaseEmail, message: authResult.message });
        // Return a generic 401 for failed auth attempts
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
      }

      // Generate refresh token
      const refreshToken = generateRefreshToken(authResult.user.id);

      logger.info('Login successful', { userId: authResult.user.id, email: lowerCaseEmail });

      // --- Success Response ---
      // The service already excluded the password hash
      const response = NextResponse.json({
        message: 'Login successful',
        user: authResult.user,
        token: authResult.token,
        refreshToken: refreshToken,
      });

      // Set Authorization header (optional, depends on client handling)
      // response.headers.set('Authorization', `Bearer ${authResult.token}`);

      return response;
    } catch (error: unknown) {
      // Catch specific configuration errors from the service
      if (error instanceof Error ? error.message : String(error) === 'Authentication configuration error.') {
        logger.error('Login API configuration error', {}, error);
        return NextResponse.json({ message: error instanceof Error ? error.message : String(error) }, { status: 500 });
      }
      // Catch JSON parsing errors
      if (error instanceof SyntaxError) {
        logger.warn('Invalid JSON in login request body');
        return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
      }

      // Log unexpected errors
      logger.error('Unexpected login API error', {}, error);
      return NextResponse.json({ message: 'Internal Server Error during login.' }, { status: 500 });
    }
  }),
  {
    limit: rateLimits.auth.login.limit,
    window: rateLimits.auth.login.window,
  }
);
