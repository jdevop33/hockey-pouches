// app/lib/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Rate limit window in seconds
 */
export enum RateLimitWindow {
  SECOND = 1,
  MINUTE = 60,
  HOUR = 3600,
  DAY = 86400,
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  limit: number;
  window: RateLimitWindow;
  identifier?: (req: NextRequest) => string;
}

/**
 * Rate limit store interface
 */
interface RateLimitStore {
  get: (key: string) => Promise<number | null>;
  increment: (key: string, window: number) => Promise<number>;
  reset: (key: string) => Promise<void>;
}

/**
 * In-memory rate limit store
 */
class MemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; expires: number }> = new Map();

  async get(key: string): Promise<number | null> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (now > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.count;
  }

  async increment(key: string, window: number): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.expires) {
      // Create new entry
      this.store.set(key, {
        count: 1,
        expires: now + window * 1000,
      });
      return 1;
    }

    // Increment existing entry
    entry.count += 1;
    return entry.count;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }
}

// Create store instance
const store = new MemoryRateLimitStore();

// Clean up expired entries every minute
setInterval(() => {
  store.cleanup();
}, 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientIdentifier(req: NextRequest, config: RateLimitConfig): string {
  // Use custom identifier function if provided
  if (config.identifier) {
    return config.identifier(req);
  }

  // Get client IP address
  const ip = (req as { ip?: string }).ip ?? req.headers.get('x-forwarded-for') ?? 'unknown';

  // Get route path
  const path = new URL(req.url).pathname;

  // Combine IP and path for the key
  return `${ip}:${path}`;
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get client identifier
    const identifier = getClientIdentifier(req, config);

    // Create rate limit key
    const key = `ratelimit:${identifier}`;

    // Increment request count
    const count = await store.increment(key, config.window);

    // Check if rate limit exceeded
    if (count > config.limit) {
      // Log rate limit exceeded
      logger.warn(`Rate limit exceeded for ${identifier}`, {
        identifier,
        count,
        limit: config.limit,
        window: config.window,
        path: new URL(req.url).pathname,
        method: req.method,
      });

      // Calculate retry after time
      const retryAfter = Math.ceil(config.window);

      // Return rate limit exceeded response
      return NextResponse.json(
        { message: 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + retryAfter).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req);

    // Clone the response to add headers
    const newResponse = NextResponse.json(await response.json(), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    // Add rate limit headers
    newResponse.headers.set('X-RateLimit-Limit', config.limit.toString());
    newResponse.headers.set('X-RateLimit-Remaining', (config.limit - count).toString());
    newResponse.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(Date.now() / 1000 + config.window).toString()
    );

    return newResponse;
  };
}

/**
 * Rate limit configurations for different routes
 */
export const rateLimits = {
  // Global rate limit
  global: {
    limit: 100,
    window: RateLimitWindow.MINUTE,
  },

  // Authentication rate limits
  auth: {
    login: {
      limit: 5,
      window: RateLimitWindow.MINUTE,
    },
    register: {
      limit: 3,
      window: RateLimitWindow.HOUR,
    },
    forgotPassword: {
      limit: 3,
      window: RateLimitWindow.HOUR,
    },
  },

  // API rate limits
  api: {
    products: {
      limit: 20,
      window: RateLimitWindow.MINUTE,
    },
    orders: {
      limit: 10,
      window: RateLimitWindow.MINUTE,
    },
    users: {
      limit: 10,
      window: RateLimitWindow.MINUTE,
    },
  },
};
