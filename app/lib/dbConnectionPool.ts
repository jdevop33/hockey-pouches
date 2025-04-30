// app/lib/dbConnectionPool.ts
import { Pool } from '@neondatabase/serverless';

// Create a new connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Interface for connection pool statistics
 */
interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
}

/**
 * Gets current connection pool statistics
 * @returns Pool statistics
 */
export function getPoolStats(): PoolStats {
  const stats = pool.totalCount;

  return {
    totalConnections: stats,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
    maxConnections: pool.options.max || 10,
  };
}

/**
 * Executes a query with a dedicated connection from the pool
 * @param callback Function that executes queries with the connection
 * @returns Result of the callback function
 */
export async function withConnection<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

/**
 * Executes a query with a transaction
 * @param callback Function that executes queries within the transaction
 * @returns Result of the callback function
 */
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  return withConnection(async client => {
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

/**
 * Ends all connections in the pool
 * @returns Promise that resolves when all connections are ended
 */
export async function endPool(): Promise<void> {
  await pool.end();
}

/**
 * Checks if the database connection is healthy
 * @returns Boolean indicating if the connection is healthy
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}
