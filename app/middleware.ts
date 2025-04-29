// app/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { rateLimits, RateLimitWindow } from './lib/rateLimit';
import { logger } from './lib/logger';
import {
  getCsrfTokenFromCookie,
  getCsrfTokenFromRequest,
  validateCsrfToken,
  isExcludedRoute,
} from './lib/csrf-server';

// In-memory store for rate limiting (Consider using Redis/Upstash in production)
const rateLimitStore = new Map<string, { count: number; expires: number }>();

// Simple interval cleanup for in-memory store
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.expires) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

/**
 * Get client IP address from request.
 * Prefers Vercel's `req.ip`, falls back to `x-forwarded-for`.
 */
function getClientIp(req: NextRequest): string {
  return req.ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

/**
 * Get client identifier for rate limiting.
 */
function getRateLimitIdentifier(req: NextRequest, path: string): string {
  const ip = getClientIp(req);
  // Combine IP and path for a more specific rate limit key
  return `${ip}:${path}`;
}

/**
 * Check if request exceeds rate limit.
 */
function checkRateLimit(
  req: NextRequest,
  path: string,
  limit: number,
  window: number
): { limited: boolean; count: number; remaining: number; reset: number } {
  const now = Date.now();
  const identifier = getRateLimitIdentifier(req, path);
  const key = `ratelimit:${identifier}`;

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.expires) {
    rateLimitStore.set(key, { count: 1, expires: now + window * 1000 });
    return {
      limited: false,
      count: 1,
      remaining: limit - 1,
      reset: Math.ceil((now + window * 1000) / 1000),
    };
  }

  entry.count += 1;
  const limited = entry.count > limit;

  return {
    limited,
    count: entry.count,
    remaining: Math.max(0, limit - entry.count),
    reset: Math.ceil(entry.expires / 1000),
  };
}

/**
 * Apply rate limiting and return appropriate headers.
 */
function applyRateLimit(
  req: NextRequest,
  path: string
): { limited: boolean; headers: Record<string, string> } {
  // Determine which rate limit configuration to apply
  let limitConfig = rateLimits.global;
  if (path.startsWith('/api/auth/login')) limitConfig = rateLimits.auth.login;
  else if (path.startsWith('/api/auth/register')) limitConfig = rateLimits.auth.register;
  // ... add other specific path checks here ...
  else if (path.startsWith('/api/')) limitConfig = rateLimits.api.general; // Example general API limit

  const { limit, window } = limitConfig;
  const result = checkRateLimit(req, path, limit, window);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (result.limited) {
    // Calculate Retry-After (seconds until reset)
    const retryAfter = Math.ceil((result.reset * 1000 - Date.now()) / 1000);
    headers['Retry-After'] = Math.max(0, retryAfter).toString(); // Ensure non-negative
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
  const path = req.nextUrl.pathname;
  const ip = getClientIp(req);

  // --- Rate Limiting ---
  // Only apply to API routes for now
  if (path.startsWith('/api/')) {
    const { limited, headers: rateLimitHeaders } = applyRateLimit(req, path);

    if (limited) {
      logger.warn(`Rate limit exceeded`, { path, method: req.method, ip });
      return NextResponse.json(
        { message: 'Too many requests, please try again later.' },
        { status: 429, headers: rateLimitHeaders }
      );
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
            logger.warn(`CSRF protection failed`, { path, method, ip, hasCookieToken: !!cookieToken, hasHeaderToken: !!requestToken });
            return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
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
