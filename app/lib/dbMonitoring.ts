// app/lib/dbMonitoring.ts
import { db, sql } from './db';
import { getRows, type DbQueryResult } from './db-types';
import { logger } from './logger';

/**
 * Represents the structure of connection statistics
 */
export interface ConnectionStats {
  total_connections: number;
  active_connections: number;
  idle_connections: number;
  idle_in_transaction_connections: number;
  max_connections: number;
  wait_event_counts: Record<string, number>;
}

/**
 * Represents the structure of query performance statistics
 */
export interface QueryPerformanceStats {
  query_id: string;
  query: string;
  calls: number;
  total_time_ms: number;
  mean_time_ms: number;
  stddev_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  rows: number;
  shared_blks_hit: number;
  shared_blks_read: number;
  local_blks_hit: number;
  local_blks_read: number;
  temp_blks_read: number;
  temp_blks_written: number;
}

/**
 * Execute a read-only query with basic timing
 */
async function executeReadOnlyQuery(query: string, params: any[] = []): Promise<DbQueryResult> {
  const startTime = performance.now();
  try {
    // Use db.execute with the sql tag helper for parameters
    const result = await db.execute(sql.raw(query, ...params)); 
    // Note: sql.raw might be needed if the query string isn't already a tagged literal
    // If using a tagged literal directly: const result = await db.execute(sql`${query}`); etc.
    const endTime = performance.now();
    logger.debug(`Executed read-only query in ${endTime - startTime}ms`, { query });
    return result;
  } catch (error) {
    const endTime = performance.now();
    logger.error(`Error executing read-only query (${endTime - startTime}ms):`, { query, error });
    throw error;
  }
}

/**
 * Get current connection statistics
 */
export async function getConnectionStats(): Promise<ConnectionStats> {
  try {
    // Query to get basic connection counts
    const statsQuery = sql`
      SELECT
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections,
        count(*) filter (where state = 'idle in transaction') as idle_in_transaction_connections
      FROM pg_stat_activity
      WHERE datname = current_database();
    `;
    // Query to get max connections setting
    const maxConnQuery = sql`SHOW max_connections;`;
    // Query to get wait events (simplified example)
    const waitEventsQuery = sql`
      SELECT wait_event_type, count(*) as count 
      FROM pg_stat_activity 
      WHERE state = 'active' AND wait_event_type IS NOT NULL
      GROUP BY wait_event_type;`;

    const [statsResult, maxConnResult, waitEventsResult] = await Promise.all([
      db.execute(statsQuery),
      db.execute(maxConnQuery),
      db.execute(waitEventsQuery),
    ]);

    const stats = getRows(statsResult)[0];
    const maxConnections = parseInt(getRows(maxConnResult)[0].max_connections as string);
    const waitEventsRaw = getRows(waitEventsResult);
    const waitEvents: Record<string, number> = {};
    waitEventsRaw.forEach(row => {
      waitEvents[row.wait_event_type as string] = parseInt(row.count as string);
    });

    return {
      total_connections: parseInt(stats.total_connections as string),
      active_connections: parseInt(stats.active_connections as string),
      idle_connections: parseInt(stats.idle_connections as string),
      idle_in_transaction_connections: parseInt(stats.idle_in_transaction_connections as string),
      max_connections: maxConnections,
      wait_event_counts: waitEvents,
    };
  } catch (error) {
    logger.error('Failed to get connection stats:', { error });
    throw new Error('Could not retrieve connection statistics.');
  }
}

/**
 * Get slow query statistics (requires pg_stat_statements extension)
 */
export async function getSlowQueries(limit: number = 10): Promise<QueryPerformanceStats[]> {
  try {
    // Ensure pg_stat_statements is enabled and queryable
    const slowQuery = sql`
      SELECT
        queryid::text as query_id,
        query,
        calls,
        total_exec_time as total_time_ms,
        mean_exec_time as mean_time_ms,
        stddev_exec_time as stddev_time_ms,
        min_exec_time as min_time_ms,
        max_exec_time as max_time_ms,
        rows,
        shared_blks_hit,
        shared_blks_read,
        local_blks_hit,
        local_blks_read,
        temp_blks_read,
        temp_blks_written
      FROM pg_stat_statements
      ORDER BY mean_exec_time DESC
      LIMIT ${limit};
    `;

    const result = await db.execute(slowQuery);
    const rows = getRows(result);

    // Map results to the defined interface
    return rows.map(row => ({
        query_id: row.query_id as string,
        query: row.query as string,
        calls: parseInt(row.calls as string),
        total_time_ms: parseFloat(row.total_time_ms as string),
        mean_time_ms: parseFloat(row.mean_time_ms as string),
        stddev_time_ms: parseFloat(row.stddev_time_ms as string),
        min_time_ms: parseFloat(row.min_time_ms as string),
        max_time_ms: parseFloat(row.max_time_ms as string),
        rows: parseInt(row.rows as string),
        shared_blks_hit: parseInt(row.shared_blks_hit as string),
        shared_blks_read: parseInt(row.shared_blks_read as string),
        local_blks_hit: parseInt(row.local_blks_hit as string),
        local_blks_read: parseInt(row.local_blks_read as string),
        temp_blks_read: parseInt(row.temp_blks_read as string),
        temp_blks_written: parseInt(row.temp_blks_written as string),
    }));
  } catch (error) {
    // Check for specific error if pg_stat_statements doesn't exist
    if (error instanceof Error && error.message.includes('relation "pg_stat_statements" does not exist')) {
        logger.warn('pg_stat_statements extension not found or enabled. Cannot fetch slow queries.');
        return []; // Return empty array if extension is not available
    }
    logger.error('Failed to get slow query stats:', { error });
    throw new Error('Could not retrieve slow query statistics.');
  }
}

/**
 * Analyze a query plan using EXPLAIN
 * @param query The SQL query string
 * @param params Optional parameters for the query
 * @returns The query plan as a string
 */
export async function analyzeQueryPlan(query: string, params: any[] = []): Promise<string> {
  try {
    // Use sql.raw for dynamic query string with parameters
    const explainQuery = sql`EXPLAIN (ANALYZE, BUFFERS) ${sql.raw(query, ...params)}`;

    const result = await db.execute(explainQuery);
    const rows = getRows(result);

    // Format the plan rows into a single string
    return rows.map(row => row['QUERY PLAN'] as string).join('
');
  } catch (error) {
    logger.error('Failed to analyze query plan:', { query, error });
    throw new Error('Could not analyze query plan.');
  }
}

/**
 * Simple check for database health
 */
export async function checkDbHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const result = await db.execute(sql`SELECT 1 as check`);
    if (getRows(result)?.[0]?.check === 1) {
      return { healthy: true, message: 'Database connection successful.' };
    } else {
      return { healthy: false, message: 'Health check query returned unexpected result.' };
    }
  } catch (error) {
    logger.error('Database health check failed:', { error });
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown database connection error.',
    };
  }
}
