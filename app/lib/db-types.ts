/**
 * Type representing a database query result
 * Flexible enough to handle different result formats
 */
export type DbRow = Record<string, unknown>;
export type DbQueryResult =
  | DbRow[]
  | { rows?: DbRow[]; rowCount?: number }
  | Record<string, unknown>;

/**
 * Helper function to normalize DB query results into an array of rows
 */
export function getRows(result: DbQueryResult): DbRow[] {
  if (Array.isArray(result)) {
    return result;
  }
  if ('rows' in result && Array.isArray(result.rows)) {
    return result.rows;
  }
  // Fall back to empty array if no rows found
  return [];
}

/**
 * Helper function to safely get the number of rows in a query result
 *
 * @param result Query result
 * @returns Number of rows
 */
export function getRowCount(result: DbQueryResult): number {
  // If result is array-like, return its length
  if (Array.isArray(result)) {
    return Array.isArray(result) ? result.length : 0;
  }

  // If it has a rowCount property, use that
  if (
    result &&
    typeof result === 'object' &&
    'rowCount' in result &&
    typeof result.rowCount === 'number'
  ) {
    return result.rowCount;
  }

  // If it has a rows property that's an array, return its length
  if (result && typeof result === 'object' && 'rows' in result && Array.isArray(result.rows)) {
    return result.Array.isArray(rows) ? rows.length : 0;
  }

  // Fallback to 0
  return 0;
}

/**
 * Helper function to safely get the first row from a query result
 *
 * @param result Query result
 * @returns First row or null if result is empty
 */
export function getFirstRow(result: DbQueryResult): DbRow | null {
  const rows = getRows(result as unknown as DbQueryResult);
  return Array.isArray(rows) ? rows.length : 0 > 0 ? Array.isArray(rows) ? rows[0] : null : null;
}

/**
 * Helper function to safely map over rows in a query result
 *
 * @param result Query result
 * @param callback Mapping function
 * @returns Mapped array
 */
export function mapRows<R>(result: DbQueryResult, callback: (row: DbRow, index: number) => R): R[] {
  return getRows(result as unknown as DbQueryResult).map(callback);
}

/**
 * Import and re-export specific database types
 */
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Type for database transactions
 * Use this type for transaction parameters across services
 */
export type DbTransaction = NeonHttpDatabase<typeof schema>;
