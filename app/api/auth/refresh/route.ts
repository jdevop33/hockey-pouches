import { NextResponse, type NextRequest } from 'next/server';
import { refreshToken } from '@/lib/auth';
import { withRateLimit, rateLimits } from '@/lib/rateLimit';
import { userService } from '@/lib/services/user-service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Zod schema for refresh token validation
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const body = await request.json();

      // Validate request body
      const validationResult = refreshTokenSchema.safeParse(body);
      if (!validationResult.success) {
        logger.warn('Refresh token validation failed', {
          errors: validationResult.error.flatten().fieldErrors,
        });
        return NextResponse.json({ message: 'Invalid refresh token format.' }, { status: 400 });
      }

      const { refreshToken: refreshTokenValue } = validationResult.data;

      // Try to refresh the token
      try {
        // Get user data from refresh token
        const userData = await userService.getUserFromRefreshToken(refreshTokenValue);

        // If no user data, the refresh token is invalid
        if (!userData) {
          logger.warn('Invalid refresh token');
          return NextResponse.json({ message: 'Invalid refresh token.' }, { status: 401 });
        }

        // Generate a new access token
        const newAccessToken = await refreshToken(refreshTokenValue, {
          email: userData.email,
          role: userData.role,
        });

        // If token refresh failed
        if (!newAccessToken) {
          logger.warn('Failed to refresh token');
          return NextResponse.json({ message: 'Failed to refresh token.' }, { status: 401 });
        }

        // Return the new access token
        return NextResponse.json({
          message: 'Token refreshed successfully',
          accessToken: newAccessToken,
        });
      } catch (error) {
        logger.error('Error refreshing token', {}, error);
        return NextResponse.json({ message: 'Error refreshing token.' }, { status: 500 });
      }
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        logger.warn('Invalid JSON in refresh token request body');
        return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
      }

      // Log unexpected errors
      logger.error('Unexpected refresh token API error', {}, error);
      return NextResponse.json(
        { message: 'Internal Server Error during token refresh.' },
        { status: 500 }
      );
    }
  },
  {
    limit: rateLimits.auth.login.limit,
    window: rateLimits.auth.login.window,
  }
);
