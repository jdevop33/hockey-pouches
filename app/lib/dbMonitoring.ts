// app/lib/dbMonitoring.ts
import sql from './db';

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
const SLOW_QUERY_THRESHOLD = 500;

/**
 * Executes a query and logs its performance
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function monitoredQuery<T>(
  query: string,
  params?: any[]
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  let error: any;
  let result: any;

  try {
    result = await sql.query(query, params);
    success = true;
    return result as T;
  } catch (err) {
    error = err;
    throw err;
  } finally {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log query performance
    const performanceData: QueryPerformance = {
      query,
      params,
      startTime,
      endTime,
      duration,
      success,
      error,
    };
    
    logQueryPerformance(performanceData);
    
    // Log slow queries to console
    if (duration > SLOW_QUERY_THRESHOLD) {
      console.warn(`Slow query detected (${duration}ms):`, {
        query,
        params,
      });
    }
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
  return queryPerformanceLog
    .filter(data => data.duration > threshold)
    .slice(0, limit);
}

/**
 * Gets query performance statistics
 * @returns Query performance statistics
 */
export function getQueryStats(): {
  totalQueries: number;
  averageDuration: number;
  slowQueries: number;
  errors: number;
  fastestQuery: number;
  slowestQuery: number;
} {
  const totalQueries = queryPerformanceLog.length;
  
  if (totalQueries === 0) {
    return {
      totalQueries: 0,
      averageDuration: 0,
      slowQueries: 0,
      errors: 0,
      fastestQuery: 0,
      slowestQuery: 0,
    };
  }
  
  const durations = queryPerformanceLog.map(data => data.duration);
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  const averageDuration = totalDuration / totalQueries;
  const slowQueries = queryPerformanceLog.filter(data => data.duration > SLOW_QUERY_THRESHOLD).length;
  const errors = queryPerformanceLog.filter(data => !data.success).length;
  const fastestQuery = Math.min(...durations);
  const slowestQuery = Math.max(...durations);
  
  return {
    totalQueries,
    averageDuration,
    slowQueries,
    errors,
    fastestQuery,
    slowestQuery,
  };
}

/**
 * Clears the query performance log
 */
export function clearQueryLog(): void {
  queryPerformanceLog.length = 0;
}

/**
 * Executes EXPLAIN ANALYZE on a query to get execution plan
 * @param query SQL query string
 * @param params Query parameters
 * @returns Execution plan
 */
export async function explainQuery(
  query: string,
  params?: any[]
): Promise<string[]> {
  const explainQuery = `EXPLAIN ANALYZE ${query}`;
  
  try {
    const result = await sql.query(explainQuery, params);
    return result.map((row: any) => row.QUERY_PLAN);
  } catch (error) {
    console.error('Error explaining query:', error);
    throw error;
  }
}
