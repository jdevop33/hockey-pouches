// app/lib/apiMonitoring.ts
import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from './monitoring';

/**
 * Wrap an API route handler with monitoring
 * @param handler API route handler
 * @param routeName Route name for monitoring
 * @returns Wrapped handler
 */
export function withApiMonitoring(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse,
  routeName: string
) {
  return async (req: NextRequest, ...args: any[]) => {
    const transaction = monitoring.startTransaction(`api.${routeName}`, 'http.server');
    const method = req.method;
    const url = new URL(req.url);
    
    monitoring.setTag('http.method', method);
    monitoring.setTag('http.url', url.pathname);
    
    const startTime = performance.now();
    
    try {
      const response = await handler(req, ...args);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      monitoring.trackPerformance(`api.${routeName}.duration`, duration, 'millisecond', {
        method,
        status: response.status.toString(),
      });
      
      monitoring.setTag('http.status_code', response.status.toString());
      transaction.finish();
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      monitoring.trackPerformance(`api.${routeName}.duration`, duration, 'millisecond', {
        method,
        status: 'error',
      });
      
      monitoring.trackError(error as Error, {
        routeName,
        method,
        url: url.pathname,
      });
      
      transaction.finish();
      
      // Re-throw the error to be handled by the API route
      throw error;
    }
  };
}
