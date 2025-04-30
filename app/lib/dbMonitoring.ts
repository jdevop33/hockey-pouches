// app/lib/dbMonitoring.ts
import { sql } from './db';
import { logger } from './logger';
import { getRowCount, getFirstRow, mapRows } from './db-types';

/**
 * Interface for query performance data
 */
interface QueryPerformance {
  query: string;
  params?: any[];
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: any;
}

/**
 * In-memory store for query performance data
 */
const queryPerformanceLog: QueryPerformance[] = [];

/**
 * Maximum number of queries to keep in the log
 */
const MAX_LOG_SIZE = 1000;

/**
 * Slow query threshold in milliseconds
 */
const SLOW_QUERY_THRESHOLD = 200;

let totalQueries = 0;
let failedQueries = 0;
let slowQueries = 0;

/**
 * Executes a SQL query with monitoring
 * @param query SQL query
 * @param params Query parameters
 * @returns Query results
 */
export async function monitoredQuery(query: string, params: any[] = []): Promise<any> {
  totalQueries++;
  const startTime = Date.now();

  try {
    console.log(`[DB] Executing query: ${query.replace(/\s+/g, ' ').trim()}`);
    console.log(`[DB] With parameters:`, params);

    const result = await sql.query(query, params);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration > SLOW_QUERY_THRESHOLD) {
      slowQueries++;
      logger.warn(`Slow query (${duration}ms): ${query}`, { duration, params });
    }

    // Log query performance data
    logQueryPerformance({
      query,
      params,
      startTime,
      endTime,
      duration,
      success: true,
    });

    const rowCount = getRowCount(result);
    console.log(`[DB] Query completed in ${duration}ms, returned ${rowCount} rows`);
    return result;
  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    failedQueries++;

    // Log the failed query performance
    logQueryPerformance({
      query,
      params,
      startTime,
      endTime,
      duration,
      success: false,
      error,
    });

    console.error('[DB] Query error:', error);
    console.error('[DB] Failed query:', query);
    console.error('[DB] Parameters:', params);

    // Check for common database error types
    if (error.code) {
      switch (error.code) {
        case '08001':
        case '08006':
        case 'ECONNREFUSED':
          console.error('[DB] Connection error detected. Check database connectivity.');
          break;
        case '42P01':
          console.error('[DB] Table does not exist. Check your schema.');
          break;
        case '42703':
          console.error('[DB] Column does not exist. Check your column names.');
          break;
        case '23505':
          console.error('[DB] Unique violation. A record with this key already exists.');
          break;
        default:
          console.error(`[DB] Database error code: ${error.code}`);
      }
    }

    logger.error('Query error', {
      query,
      params,
      error: error.message,
      stack: error.stack,
      code: error.code,
    });

    throw error;
  }
}

/**
 * Logs query performance data
 * @param data Query performance data
 */
function logQueryPerformance(data: QueryPerformance): void {
  queryPerformanceLog.unshift(data);

  // Trim log if it exceeds maximum size
  if (queryPerformanceLog.length > MAX_LOG_SIZE) {
    queryPerformanceLog.length = MAX_LOG_SIZE;
  }
}

/**
 * Gets recent query performance data
 * @param limit Maximum number of entries to return
 * @returns Array of query performance data
 */
export function getRecentQueries(limit: number = 100): QueryPerformance[] {
  return queryPerformanceLog.slice(0, limit);
}

/**
 * Gets slow queries
 * @param threshold Slow query threshold in milliseconds
 * @param limit Maximum number of entries to return
 * @returns Array of slow query performance data
 */
export function getSlowQueries(
  threshold: number = SLOW_QUERY_THRESHOLD,
  limit: number = 100
): QueryPerformance[] {
  return queryPerformanceLog.filter(data => data.duration > threshold).slice(0, limit);
}

/**
 * Resets query monitoring statistics
 */
export function resetQueryStats(): void {
  totalQueries = 0;
  failedQueries = 0;
  slowQueries = 0;
}

/**
 * Gets query monitoring statistics
 */
export function getQueryStats(): { total: number; failed: number; slow: number } {
  return {
    total: totalQueries,
    failed: failedQueries,
    slow: slowQueries,
  };
}

/**
 * Checks database connectivity
 * @returns True if database is connected
 */
export async function checkDatabaseConnectivity(): Promise<{
  connected: boolean;
  error?: string;
  metadata?: any;
}> {
  try {
    const startTime = Date.now();
    const result = await sql.query(
      'SELECT NOW() as time, current_database() as db, version() as version'
    );
    const duration = Date.now() - startTime;

    const firstRow = getFirstRow(result);
    return {
      connected: true,
      metadata: {
        time: firstRow?.time,
        database: firstRow?.db,
        version: firstRow?.version,
        latency: duration,
      },
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
      metadata: {
        code: error.code,
        details: error.details,
      },
    };
  }
}

/**
 * Executes EXPLAIN ANALYZE on a query to get execution plan
 * @param query SQL query string
 * @param params Query parameters
 * @returns Execution plan
 */
export async function explainQuery(query: string, params?: any[]): Promise<string[]> {
  const explainQuery = `EXPLAIN ANALYZE ${query}`;

  try {
    const result = await sql.query(explainQuery, params);
    return mapRows(result, (row: any) => row.QUERY_PLAN);
  } catch (error) {
    console.error('Error explaining query:', error);
    throw error;
  }
}
