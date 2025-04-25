// app/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

/**
 * Monitoring utility for tracking performance and errors
 */
export const monitoring = {
  /**
   * Track an error
   * @param error Error to track
   * @param context Additional context
   */
  trackError: (error: Error | string, context?: Record<string, any>) => {
    console.error('Error:', error, context);

    if (typeof error === 'string') {
      Sentry.captureMessage(error, {
        level: 'error',
        extra: context,
      });
    } else {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  },

  /**
   * Track a performance metric
   * @param name Metric name
   * @param value Metric value
   * @param unit Metric unit
   * @param tags Additional tags
   */
  trackPerformance: (
    name: string,
    value: number,
    unit: 'millisecond' | 'second' | 'byte' | 'kilobyte' | 'megabyte' | 'count',
    tags?: Record<string, string>
  ) => {
    // Use console for development, Sentry would use metrics.distribution in production
    console.log(`Performance metric: ${name} = ${value} ${unit}`, tags);

    // In production, this would use Sentry metrics
    // Sentry.metrics is not available in the current version
  },

  /**
   * Start a performance transaction
   * @param name Transaction name
   * @param op Operation type
   * @returns Transaction
   */
  startTransaction: (name: string, op: string) => {
    // Create a simple transaction object for development
    console.log(`Starting transaction: ${name} (${op})`);

    // Return a mock transaction object
    const startTime = Date.now();
    return {
      name,
      op,
      startTimestamp: startTime,
      finish: () => {
        const duration = Date.now() - startTime;
        console.log(`Finished transaction: ${name} (${op}) - Duration: ${duration}ms`);
      },
      setTag: (key: string, value: string) => {
        console.log(`Transaction tag: ${key}=${value}`);
      },
      setData: (key: string, value: any) => {
        console.log(`Transaction data: ${key}=${JSON.stringify(value)}`);
      },
    };
  },

  /**
   * Set user information for tracking
   * @param user User information
   */
  setUser: (user: { id: string; email?: string; username?: string }) => {
    Sentry.setUser(user);
  },

  /**
   * Clear user information
   */
  clearUser: () => {
    Sentry.setUser(null);
  },

  /**
   * Set a tag for all future events
   * @param key Tag key
   * @param value Tag value
   */
  setTag: (key: string, value: string) => {
    Sentry.setTag(key, value);
  },

  /**
   * Set extra context for all future events
   * @param key Context key
   * @param value Context value
   */
  setExtra: (key: string, value: any) => {
    Sentry.setExtra(key, value);
  },
};

/**
 * Higher-order function to monitor a function's performance and errors
 * @param fn Function to monitor
 * @param name Function name
 * @returns Monitored function
 */
export function withMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const transaction = monitoring.startTransaction(name, 'function');

    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result
          .then(value => {
            transaction.finish();
            return value;
          })
          .catch(error => {
            monitoring.trackError(error, { name, args });
            transaction.finish();
            throw error;
          }) as ReturnType<T>;
      }

      transaction.finish();
      return result;
    } catch (error) {
      monitoring.trackError(error as Error, { name, args });
      transaction.finish();
      throw error;
    }
  };
}

/**
 * Monitor API routes
 */
export function monitorApiRoute(handler: Function, routeName: string) {
  return async (req: Request, ...rest: any[]) => {
    const transaction = monitoring.startTransaction(`api.${routeName}`, 'http.server');
    const method = req.method;
    const url = new URL(req.url);

    monitoring.setTag('http.method', method);
    monitoring.setTag('http.url', url.pathname);

    try {
      const response = await handler(req, ...rest);

      monitoring.setTag('http.status_code', response.status.toString());
      transaction.finish();

      return response;
    } catch (error) {
      monitoring.trackError(error as Error, {
        routeName,
        method,
        url: url.pathname,
      });

      transaction.finish();
      throw error;
    }
  };
}
