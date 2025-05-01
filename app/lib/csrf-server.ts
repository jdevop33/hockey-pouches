// app/lib/csrf-server.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { cookies } from 'next/headers';
import { logger } from './logger';

/**
 * CSRF token configuration
 */
export const CSRF_CONFIG = {
  // Cookie name for the CSRF token
  cookieName: 'csrf_token',

  // Header name for the CSRF token
  headerName: 'X-CSRF-Token',

  // Form field name for the CSRF token
  formFieldName: 'csrfToken',

  // Cookie options
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  },

  // Routes to exclude from CSRF protection
  excludedRoutes: ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/verify'],
};

/**
 * Generate a random CSRF token
 * @returns Random CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a CSRF token
 * @param token CSRF token to hash
 * @returns Hashed CSRF token
 */
export function hashCsrfToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Set CSRF token cookie
 * @param token CSRF token
 */
export async function setCsrfTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_CONFIG.cookieName, hashCsrfToken(token), CSRF_CONFIG.cookieOptions);
}

/**
 * Get CSRF token from cookie
 * @returns CSRF token from cookie or null if not found
 */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_CONFIG.cookieName);
  return token?.value || null;
}

/**
 * Get CSRF token from request
 * @param req Next.js request
 * @returns CSRF token from request or null if not found
 */
export function getCsrfTokenFromRequest(req: NextRequest): string | null {
  // Check header first
  const headerToken = req.headers.get(CSRF_CONFIG.headerName);
  if (headerToken) {
    return headerToken;
  }

  // Check form data if it's a form submission
  const contentType = req.headers.get('content-type');
  if (
    contentType?.includes('application/x-www-form-urlencoded') ||
    contentType?.includes('multipart/form-data')
  ) {
    // We'll need to parse the form data to get the token
    // This is handled in the middleware
    return null;
  }

  // Check JSON body if it's a JSON request
  if (contentType?.includes('application/json')) {
    // We'll need to parse the JSON body to get the token
    // This is handled in the middleware
    return null;
  }

  return null;
}

/**
 * Validate CSRF token
 * @param token CSRF token to validate
 * @param storedToken Stored CSRF token
 * @returns Whether the token is valid
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }

  // Hash the token and compare with the stored token
  const hashedToken = hashCsrfToken(token);
  return hashedToken === storedToken;
}

/**
 * Check if a route should be excluded from CSRF protection
 * @param path Route path
 * @returns Whether the route should be excluded
 */
export function isExcludedRoute(path: string): boolean {
  return CSRF_CONFIG.excludedRoutes.some(route => path.startsWith(route));
}

/**
 * CSRF protection middleware
 * @param handler Next.js API route handler
 * @returns Next.js API route handler with CSRF protection
 */
export function withCsrfProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get the request path
    const path = new URL(req.url).pathname;

    // Skip CSRF protection for excluded routes
    if (isExcludedRoute(path)) {
      return handler(req);
    }

    // Skip CSRF protection for GET, HEAD, and OPTIONS requests
    const method = req.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return handler(req);
    }

    // Get the CSRF token from the cookie
    const cookieToken = req.cookies.get(CSRF_CONFIG.cookieName)?.value;
    if (!cookieToken) {
      logger.warn('CSRF protection failed: No CSRF token in cookie', {
        path,
        method,
      });
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    // Get the CSRF token from the request
    let requestToken = req.headers.get(CSRF_CONFIG.headerName);

    // If the token is not in the header, try to get it from the body
    if (!requestToken) {
      try {
        // Clone the request to avoid consuming the body
        const clonedReq = req.clone();

        // Check content type
        const contentType = req.headers.get('content-type');

        // Parse JSON body
        if (contentType?.includes('application/json')) {
          const body = await clonedReq.json();
          requestToken = body[CSRF_CONFIG.formFieldName];
        }
        // Parse form data
        else if (
          contentType?.includes('application/x-www-form-urlencoded') ||
          contentType?.includes('multipart/form-data')
        ) {
          const formData = await clonedReq.formData();
          requestToken = formData.get(CSRF_CONFIG.formFieldName) as string;
        }
      } catch (error) {
        logger.error('Error parsing request body for CSRF token', { path, method }, error);
      }
    }

    // Validate the CSRF token
    if (!requestToken || !validateCsrfToken(requestToken, cookieToken)) {
      logger.warn('CSRF protection failed: Invalid CSRF token', {
        path,
        method,
        hasRequestToken: !!requestToken,
      });
      return NextResponse.json({ message: 'CSRF token missing or invalid' }, { status: 403 });
    }

    // CSRF token is valid, proceed with the request
    return handler(req);
  };
}

/**
 * Generate a new CSRF token and set it in the cookie
 * @returns CSRF token
 */
export async function generateAndSetCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  await setCsrfTokenCookie(token);
  return token;
}

/**
 * API route to get a CSRF token
 * @returns Next.js response with CSRF token
 */
export async function getCsrfTokenHandler(): Promise<NextResponse> {
  const token = await generateAndSetCsrfToken();
  return NextResponse.json({ token });
}
