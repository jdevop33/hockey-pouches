// app/lib/db.ts - Production-ready DB connection setup
import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { sql as drizzleSqlHelper } from 'drizzle-orm';
import ws from 'ws';
import { logger } from './logger';

// Import the combined schema index
import * as schema from './schema';

// Configure neon to use WebSockets for Serverless environments
neonConfig.webSocketConstructor = ws;

// Connection string validation with detailed error messages
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  const errorMessage = 'Database connection error: POSTGRES_URL environment variable is missing';
  logger.error(errorMessage);

  // In production, we'll log the error but not crash the app
  // This allows the app to still function for non-database operations
  if (process.env.NODE_ENV === 'production') {
    logger.error('Running in production with missing database connection string. Some features will be unavailable.');
  } else {
    throw new Error(errorMessage);
  }
}

// At this point, connectionString might still be undefined in production
const validConnectionString: string = connectionString || '';

// Cache the SQL connection to reuse across serverless invocations
let cachedNeonSql: NeonQueryFunction<false, false> | null = null;
let cachedDb: NeonHttpDatabase<typeof schema> | null = null;

// Get the SQL client with connection reuse
function getNeonSql() {
  if (!cachedNeonSql) {
    try {
      // Only attempt to connect if we have a connection string
      if (!validConnectionString) {
        logger.error('Cannot initialize Neon SQL connection: No connection string available');
        return null;
      }

      logger.info('Initializing new Neon SQL connection');
      cachedNeonSql = neon(validConnectionString);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to initialize Neon SQL connection', {
        error: errorMessage,
      });
      return null;
    }
  }
  return cachedNeonSql;
}

// Get the Drizzle database instance with connection pooling
export function getDb(): NeonHttpDatabase<typeof schema> | null {
  if (!cachedDb) {
    try {
      const sql = getNeonSql();
      if (!sql) {
        logger.error('Cannot initialize Drizzle ORM: SQL client initialization failed');
        return null;
      }

      logger.info('Initializing new Drizzle ORM instance');
      cachedDb = drizzle(sql, { schema });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to initialize Drizzle ORM instance', {
        error: errorMessage,
      });
      return null;
    }
  }
  return cachedDb;
}

// Create and export a singleton instance for direct imports
// This is the recommended approach for most use cases
export const db = getDb() || createFallbackDb();

// Create a fallback DB object that logs errors instead of throwing them
// This allows the app to continue running even if the DB connection fails
function createFallbackDb(): NeonHttpDatabase<typeof schema> {
  logger.warn('Using fallback DB object. Database operations will fail gracefully.');

  // Create a proxy that logs errors for all operations
  return new Proxy({} as NeonHttpDatabase<typeof schema>, {
    get: (target, prop) => {
      // Return a function that logs the error and returns a rejected promise
      if (prop === 'execute' || prop === 'query' || prop === 'insert' ||
          prop === 'select' || prop === 'update' || prop === 'delete') {
        return (...args: any[]) => {
          logger.error(`Database operation '${String(prop)}' failed: No database connection`, { args });
          return Promise.reject(new Error('Database connection not available'));
        };
      }

      // For other properties, return a no-op function
      return () => {
        logger.error(`Database operation '${String(prop)}' failed: No database connection`);
        return Promise.reject(new Error('Database connection not available'));
      };
    }
  });
}

// Export SQL helper for raw queries when needed
export const sql = drizzleSqlHelper;

// Database health check function
export async function isDatabaseHealthy(): Promise<boolean> {
  // Check if we have a connection string
  if (!connectionString) {
    logger.error('Database health check failed: No connection string available');
    return false;
  }

  // Check if we have a database instance
  const dbInstance = getDb();
  if (!dbInstance) {
    logger.error('Database health check failed: Could not get database instance');
    return false;
  }

  try {
    // Attempt to execute a simple query
    const result = await dbInstance.execute(sql`SELECT 1 as health_check`);
    if (Array.isArray(result) && result.length > 0 && result[0].health_check === 1) {
      logger.info('Database health check passed');
      return true;
    }

    logger.warn('Database health check returned unexpected result', { result });
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Database health check failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // If the connection failed, try to reset it for next time
    resetConnection();

    return false;
  }
}

// For extreme cases where you need to reset the connection
export function resetConnection(): void {
  logger.info('Resetting database connection');
  cachedNeonSql = null;
  cachedDb = null;
}
