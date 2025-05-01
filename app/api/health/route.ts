// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseHealthy } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * GET /api/health
 * Health check endpoint for monitoring the application
 */
export async function GET(request: NextRequest) {
  logger.info('Health check requested');
  
  try {
    // Check database health
    const dbHealthy = await isDatabaseHealthy();
    
    // Get environment information
    const environment = process.env.NODE_ENV || 'development';
    const vercelEnv = process.env.VERCEL_ENV || 'local';
    
    // Construct response
    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment,
      vercelEnv,
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          message: dbHealthy ? 'Database connection successful' : 'Database connection failed'
        },
        api: {
          status: 'healthy',
          message: 'API is responding'
        }
      }
    };
    
    // Return 200 OK if everything is healthy, 503 Service Unavailable if degraded
    const statusCode = dbHealthy ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error during health check', {}, error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Error performing health check',
        error: error instanceof Error ? errorMessage : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
