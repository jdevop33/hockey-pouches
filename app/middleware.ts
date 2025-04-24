// app/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { rateLimits, RateLimitWindow } from './lib/rateLimit';
import { logger } from './lib/logger';
import {
  getCsrfTokenFromCookie,
  getCsrfTokenFromRequest,
  validateCsrfToken,
  isExcludedRoute,
} from './lib/csrf';

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; expires: number }>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.expires) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientIdentifier(req: NextRequest, path: string): string {
  // Get client IP address
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  // Combine IP and path for the key
  return `${ip}:${path}`;
}

/**
 * Check if request exceeds rate limit
 */
function checkRateLimit(
  req: NextRequest,
  path: string,
  limit: number,
  window: number
): { limited: boolean; count: number; remaining: number; reset: number } {
  const now = Date.now();
  const identifier = getClientIdentifier(req, path);
  const key = `ratelimit:${identifier}`;

  // Get current count
  const entry = rateLimitStore.get(key);

  // If no entry or expired, create new entry
  if (!entry || now > entry.expires) {
    rateLimitStore.set(key, {
      count: 1,
      expires: now + window * 1000,
    });

    return {
      limited: false,
      count: 1,
      remaining: limit - 1,
      reset: Math.ceil((now + window * 1000) / 1000),
    };
  }

  // Increment count
  entry.count += 1;

  // Check if rate limit exceeded
  const limited = entry.count > limit;

  return {
    limited,
    count: entry.count,
    remaining: Math.max(0, limit - entry.count),
    reset: Math.ceil(entry.expires / 1000),
  };
}

/**
 * Apply rate limiting to request
 */
function applyRateLimit(
  req: NextRequest,
  path: string
): { limited: boolean; headers: Record<string, string> } {
  // Determine which rate limit to apply
  let limit = rateLimits.global.limit;
  let window = rateLimits.global.window;

  // Check for specific route rate limits
  if (path.startsWith('/api/auth/login')) {
    limit = rateLimits.auth.login.limit;
    window = rateLimits.auth.login.window;
  } else if (path.startsWith('/api/auth/register')) {
    limit = rateLimits.auth.register.limit;
    window = rateLimits.auth.register.window;
  } else if (path.startsWith('/api/auth/forgot-password')) {
    limit = rateLimits.auth.forgotPassword.limit;
    window = rateLimits.auth.forgotPassword.window;
  } else if (path.startsWith('/api/products')) {
    limit = rateLimits.api.products.limit;
    window = rateLimits.api.products.window;
  } else if (path.startsWith('/api/orders')) {
    limit = rateLimits.api.orders.limit;
    window = rateLimits.api.orders.window;
  } else if (path.startsWith('/api/users')) {
    limit = rateLimits.api.users.limit;
    window = rateLimits.api.users.window;
  }

  // Check rate limit
  const result = checkRateLimit(req, path, limit, window);

  // Create headers
  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  // Add retry-after header if limited
  if (result.limited) {
    headers['Retry-After'] = Math.ceil(window).toString();
  }

  return {
    limited: result.limited,
    headers,
  };
}

/**
 * Middleware function
 */
export async function middleware(req: NextRequest) {
  // Get request path
  const path = new URL(req.url).pathname;

  // Only apply middleware to API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Apply rate limiting
  const { limited, headers } = applyRateLimit(req, path);

  // If rate limit exceeded, return 429 response
  if (limited) {
    // Log rate limit exceeded
    logger.warn(`Rate limit exceeded for ${path}`, {
      path,
      method: req.method,
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { message: 'Too many requests, please try again later.' },
      {
        status: 429,
        headers,
      }
    );
  }

  // Apply CSRF protection for non-GET requests
  const method = req.method.toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && path.startsWith('/api/')) {
    // Skip CSRF protection for excluded routes
    if (!isExcludedRoute(path)) {
      try {
        // Get CSRF token from cookie
        const cookieToken = req.cookies.get('csrf_token')?.value;

        // If no CSRF token in cookie, skip CSRF protection
        if (cookieToken) {
          // Get CSRF token from request
          const requestToken = req.headers.get('X-CSRF-Token');

          // If no CSRF token in request or token is invalid, return 403
          if (!requestToken || !validateCsrfToken(requestToken, cookieToken)) {
            logger.warn(`CSRF protection failed for ${path}`, {
              path,
              method,
              hasRequestToken: !!requestToken,
            });

            return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
          }
        }
      } catch (error) {
        logger.error(`Error validating CSRF token for ${path}`, { path, method }, error);
      }
    }
  }

  // Continue with request
  const response = NextResponse.next();

  // Add rate limit headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
};
