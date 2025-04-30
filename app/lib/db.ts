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
  throw new Error(errorMessage);
}

// At this point, connectionString is guaranteed to be defined
const validConnectionString: string = connectionString;

// Cache the SQL connection to reuse across serverless invocations
let cachedNeonSql: NeonQueryFunction<false, false> | null = null;
let cachedDb: NeonHttpDatabase<typeof schema> | null = null;

// Get the SQL client with connection reuse
function getNeonSql() {
  if (!cachedNeonSql) {
    logger.info('Initializing new Neon SQL connection');
    cachedNeonSql = neon(validConnectionString);
  }
  return cachedNeonSql;
}

// Get the Drizzle database instance with connection pooling
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!cachedDb) {
    const sql = getNeonSql();
    logger.info('Initializing new Drizzle ORM instance');
    cachedDb = drizzle(sql, { schema });
  }
  return cachedDb;
}

// Create and export a singleton instance for direct imports
// This is the recommended approach for most use cases
export const db = getDb();

// Export SQL helper for raw queries when needed
export const sql = drizzleSqlHelper;

// Database health check function
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT 1 as health_check`);
    if (Array.isArray(result) && result.length > 0 && result[0].health_check === 1) {
      return true;
    }
    logger.warn('DB health check returned unexpected result', { result });
    return false;
  } catch (error) {
    logger.error('DB health check failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

// For extreme cases where you need to reset the connection
export function resetConnection(): void {
  logger.info('Resetting database connection');
  cachedNeonSql = null;
  cachedDb = null;
}
