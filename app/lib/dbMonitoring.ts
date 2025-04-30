// app/lib/dbMonitoring.ts
import { db, sql } from './db';
import { getRows, type DbQueryResult, type DbRow } from './db-types'; // Ensure DbRow is imported if used
import { logger } from './logger';
import { SQL } from 'drizzle-orm'; // Import SQL type for parameter typing

// ... (interfaces ConnectionStats, QueryPerformanceStats remain the same) ...
export interface ConnectionStats {
  total_connections: number;
  active_connections: number;
  idle_connections: number;
  idle_in_transaction_connections: number;
  max_connections: number;
  wait_event_counts: Record<string, number>;
}
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
 * Get current connection statistics
 */
export async function getConnectionStats(): Promise<ConnectionStats> {
  try {
    const statsQuery = sql`
      SELECT
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections,
        count(*) filter (where state = 'idle in transaction') as idle_in_transaction_connections
      FROM pg_stat_activity
      WHERE datname = current_database();
    `;
    const maxConnQuery = sql`SHOW max_connections;`;
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

    const statsRows = getRows(statsResult) as DbRow[];
    const maxConnRows = getRows(maxConnResult) as DbRow[];
    const waitEventsRows = getRows(waitEventsResult) as DbRow[];

    const stats = statsRows[0];
    const maxConnections = parseInt(maxConnRows[0]?.max_connections as string || '0');
    const waitEvents: Record<string, number> = {};
    waitEventsRows.forEach(row => {
      if (row.wait_event_type) {
          waitEvents[row.wait_event_type as string] = parseInt(row.count as string || '0');
      }
    });

    return {
      total_connections: parseInt(stats?.total_connections as string || '0'),
      active_connections: parseInt(stats?.active_connections as string || '0'),
      idle_connections: parseInt(stats?.idle_connections as string || '0'),
      idle_in_transaction_connections: parseInt(stats?.idle_in_transaction_connections as string || '0'),
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
    const rows = getRows(result) as DbRow[];

    return rows.map(row => ({
        query_id: String(row.query_id ?? ''),
        query: String(row.query ?? ''),
        calls: parseInt(String(row.calls ?? '0')),
        total_time_ms: parseFloat(String(row.total_time_ms ?? '0')),
        mean_time_ms: parseFloat(String(row.mean_time_ms ?? '0')),
        stddev_time_ms: parseFloat(String(row.stddev_time_ms ?? '0')),
        min_time_ms: parseFloat(String(row.min_time_ms ?? '0')),
        max_time_ms: parseFloat(String(row.max_time_ms ?? '0')),
        rows: parseInt(String(row.rows ?? '0')),
        shared_blks_hit: parseInt(String(row.shared_blks_hit ?? '0')),
        shared_blks_read: parseInt(String(row.shared_blks_read ?? '0')),
        local_blks_hit: parseInt(String(row.local_blks_hit ?? '0')),
        local_blks_read: parseInt(String(row.local_blks_read ?? '0')),
        temp_blks_read: parseInt(String(row.temp_blks_read ?? '0')),
        temp_blks_written: parseInt(String(row.temp_blks_written ?? '0')),
    }));
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation "pg_stat_statements" does not exist')) {
        logger.warn('pg_stat_statements extension not found or enabled. Cannot fetch slow queries.');
        return [];
    }
    logger.error('Failed to get slow query stats:', { error });
    throw new Error('Could not retrieve slow query statistics.');
  }
}

/**
 * Analyze a query plan using EXPLAIN
 * @param query The SQL query (Drizzle sql object)
 * @returns The query plan as a string
 */
// Rewriting the function body completely to fix syntax issues
export async function analyzeQueryPlan(query: SQL<unknown>): Promise<string> {
  try {
    const explainQuery = sql`EXPLAIN (ANALYZE, BUFFERS) ${query}`;
    const result = await db.execute(explainQuery);
    const rows = getRows(result) as { 'QUERY PLAN': string }[];

    // Correct way to join the plan lines with a newline
    if (rows && rows.length > 0) {
        return rows.map(row => row['QUERY PLAN']).join('
');
    } else {
        return 'No query plan returned.';
    }
  } catch (error) {
    logger.error('Failed to analyze query plan:', { query: query, error });
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
      logger.warn('Health check query returned unexpected result', { result });
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
