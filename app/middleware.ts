// app/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { rateLimits, withRateLimit } from './lib/rateLimit';
import { logger } from './lib/logger';
import {
  getCsrfTokenFromCookie,
  getCsrfTokenFromRequest,
  validateCsrfToken,
  isExcludedRoute,
} from './lib/csrf-server';

/**
 * Get client IP address from request.
 * Prefers Vercel's `req.ip`, falls back to `x-forwarded-for`.
 */
function getClientIp(req: NextRequest): string {
  return req.ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

/**
 * Apply rate limiting based on the request path
 */
async function applyRateLimit(req: NextRequest, path: string): Promise<{
  limited: boolean;
  response?: NextResponse;
  headers: Record<string, string>;
}> {
  // Determine which rate limit configuration to apply
  let limitConfig = rateLimits.global;

  if (path.startsWith('/api/auth/login')) {
    limitConfig = rateLimits.auth.login;
  } else if (path.startsWith('/api/auth/register')) {
    limitConfig = rateLimits.auth.register;
  } else if (path.startsWith('/api/products')) {
    limitConfig = rateLimits.api.products;
  } else if (path.startsWith('/api/orders')) {
    limitConfig = rateLimits.api.orders;
  } else if (path.startsWith('/api/users')) {
    limitConfig = rateLimits.api.users;
  }

  // Create a custom identifier function that includes the path
  const identifier = (request: NextRequest) => {
    const ip = getClientIp(request);
    return `${ip}:${path}`;
  };

  // Apply rate limiting
  const rateLimitedHandler = withRateLimit(
    async () => NextResponse.next(),
    { ...limitConfig, identifier }
  );

  try {
    // Execute the rate-limited handler
    const response = await rateLimitedHandler(req);

    // Extract rate limit headers
    const headers: Record<string, string> = {};
    ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'].forEach(header => {
      const value = response.headers.get(header);
      if (value) headers[header] = value;
    });

    // Check if rate limited (status 429)
    const limited = response.status === 429;

    return {
      limited,
      response: limited ? response : undefined,
      headers
    };
  } catch (error) {
    logger.error('Error applying rate limit', { path, error });
    return {
      limited: false,
      headers: {}
    };
  }
}

/**
 * Middleware function
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip = getClientIp(req);

  // --- Rate Limiting ---
  // Only apply to API routes for now
  if (path.startsWith('/api/')) {
    // Apply rate limiting
    const { limited, response: rateLimitResponse, headers: rateLimitHeaders } = await applyRateLimit(req, path);

    if (limited && rateLimitResponse) {
      logger.warn(`Rate limit exceeded`, { path, method: req.method, ip });
      return rateLimitResponse;
    }

    // Prepare response headers for non-limited requests
    const responseHeaders = new Headers(req.headers); // Start with request headers
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // --- CSRF Protection ---
    const method = req.method.toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !isExcludedRoute(path)) {
      const cookieToken = req.cookies.get('csrf_token')?.value;
      const requestToken = req.headers.get('X-CSRF-Token');

      if (!cookieToken || !requestToken || !validateCsrfToken(requestToken, cookieToken)) {
        logger.warn(`CSRF protection failed`, {
          path,
          method,
          ip,
          hasCookieToken: !!cookieToken,
          hasHeaderToken: !!requestToken
        });
        return NextResponse.json(
          { message: 'CSRF token missing or invalid' },
          { status: 403, headers: rateLimitHeaders }
        );
      }
    }

    // If not rate limited and CSRF passed (or not applicable), continue
    // Pass rate limit headers to the next handler/response
    return NextResponse.next({
      request: {
        headers: responseHeaders, // Pass modified headers (including rate limit info)
      },
    });
  }

  // If not an API route, just continue
  return NextResponse.next();
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
    // Add other paths if needed, e.g., specific pages for auth checks
  ],
};
