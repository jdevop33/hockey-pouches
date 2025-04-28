// app/lib/db.ts
import { Pool } from '@neondatabase/serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import ws from 'ws';
import { logger } from './logger';

// Configure WebSocket constructor for neon
neonConfig.webSocketConstructor = ws;
// Enable fetch connection cache for better performance
neonConfig.fetchConnectionCache = true;

// Get connection string from environment
const connectionString = process.env.POSTGRES_URL || '';

if (!connectionString) {
  logger.error('POSTGRES_URL environment variable is not set or empty.');
  throw new Error('Database connection string is required. Set POSTGRES_URL environment variable.');
}

// Initialize pool and sql
let pool: Pool;
type NeonFn = NeonQueryFunction<false, false>;
// Initialize sql with a default value that will be replaced during initialization
let sql: NeonFn = neon(connectionString) as NeonFn;

// Number of connection retries
const MAX_CONNECTION_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Initialize database connection with retry logic
 */
async function initializeDatabaseConnection(retries = MAX_CONNECTION_RETRIES): Promise<void> {
  try {
    // Create pool with improved settings
    pool = new Pool({
      connectionString,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 5000, // Connection timeout after 5 seconds
    });

    // Set up error handler for pool
    pool.on('error', (err: Error) => {
      logger.error('Unexpected database pool error:', { error: err.message });
    });

    // Create neon SQL client
    sql = neon(connectionString) as NeonFn;

    logger.info('Database connection initialized');

    // Test the connection
    await pool.query('SELECT 1');
    logger.info('Database connection test successful');
  } catch (error) {
    if (retries > 0) {
      logger.warn(
        `Database connection failed. Retrying... (${MAX_CONNECTION_RETRIES - retries + 1}/${MAX_CONNECTION_RETRIES})`
      );
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return initializeDatabaseConnection(retries - 1);
    }

    if (error instanceof Error) {
      logger.error('Error initializing database connection:', { error: error.message });
    } else {
      logger.error('Unknown error initializing database connection');
    }
    throw error;
  }
}

// Initialize the database connection
initializeDatabaseConnection().catch(error => {
  logger.error('Failed to initialize database after multiple retries:', error);
  // In production, you might want to exit the process here
  // process.exit(1);
});

/**
 * Query parameters type
 */
type QueryParams = string | number | boolean | null | undefined;

/**
 * Generic database record type
 */
export type DbRecord = Record<string, unknown>;

/**
 * Execute database query with automatic retry
 * @param query SQL query string or template literal
 * @param params Query parameters
 * @param retries Number of retry attempts
 * @returns Query result
 */
export async function executeQuery(
  query: string,
  params: QueryParams[] = [],
  retries = 3
): Promise<DbRecord[]> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        logger.warn(`Database query retry attempt ${attempt}/${retries}`);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      lastError = error;

      // Check if error is a PostgreSQL error with a code
      const pgError = error as { code?: string; message?: string };

      // Don't retry if the error is a syntax error or constraint violation
      if (
        pgError.code === '42601' || // Syntax error
        pgError.code === '23505' || // Unique violation
        pgError.code === '23503' // Foreign key violation
      ) {
        const errorMessage = pgError.message || 'Unknown database error';
        logger.error('Database query error (not retrying):', { error: errorMessage });
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(100 * Math.pow(2, attempt), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Log the error
  if (lastError instanceof Error) {
    logger.error(`Database query failed after ${retries} retries:`, { error: lastError.message });
  } else {
    logger.error(`Database query failed after ${retries} retries`);
  }

  throw lastError;
}

/**
 * Healthcheck function to verify database connection
 * @returns Boolean indicating if the database is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Database health check failed:', { error: error.message });
    } else {
      logger.error('Database health check failed with unknown error');
    }
    return false;
  }
}

// Export pool and sql client
export { pool };
export default sql;
