/**
 * Type representing a database query result
 * Flexible enough to handle different result formats
 */
export type DbRow = Record<string, unknown>;
export type DbQueryResult = Record<string, unknown>;

/**
 * Helper function to safely extract rows from SQL query results.
 * This function handles both Drizzle ORM SQL results and raw query results.
 *
 * @param result The SQL query result
 * @returns Array of row objects
 */
export function getRows(result: SQL<unknown> | DbQueryResult | any[]): DbRow[] {
  if (!result) return [];

  // Handle case where it's already an array
  if (Array.isArray(result)) {
    return result as DbRow[];
  }

  // Check if it's a Drizzle SQL result with rows property
  if (typeof result === 'object' && result !== null && 'rows' in result) {
    return result.rows as DbRow[];
  }

  // Return empty array if none of the above
  return [];
}

/**
 * Safe helper for type casting from DB rows to specific types
 * Use this instead of direct 'as' casting to avoid type errors
 */
export function castDbRows<T>(rows: DbRow[]): T[] {
  return rows as unknown as T[];
}

/**
 * Safe helper for type casting from a single DB row to a specific type
 */
export function castDbRow<T>(row: DbRow | null | undefined): T | null {
  if (!row) return null;
  return row as unknown as T;
}

/**
 * Helper to safely extract a count total from a query result
 */
export function extractTotal(result: SQL<unknown> | DbQueryResult): number {
  const rows = getRows(result);
  if (rows.length === 0) return 0;

  const firstRow = rows[0];
  if ('total' in firstRow) {
    const total = firstRow.total;
    return typeof total === 'number' ? total : Number(total) || 0;
  }

  return 0;
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
    return Array.isArray(result) ? (Array.isArray(result) ? result.length : 0) : 0;
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
    return result.Array.isArray(rows) ? (Array.isArray(rows) ? rows.length : 0) : 0;
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
  const rows = getRows(result as unknown as DbQueryResult as unknown as DbQueryResult);
  return Array.isArray(rows)
    ? Array.isArray(rows)
      ? rows.length
      : 0
    : 0 > 0
      ? Array.isArray(rows)
        ? Array.isArray(rows)
          ? rows[0]
          : null
        : null
      : null;
}

/**
 * Helper function to safely map over rows in a query result
 *
 * @param result Query result
 * @param callback Mapping function
 * @returns Mapped array
 */
export function mapRows<R>(result: DbQueryResult, callback: (row: DbRow, index: number) => R): R[] {
  return getRows(result as unknown as DbQueryResult as unknown as DbQueryResult).map(callback);
}

/**
 * Import and re-export specific database types
 */
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { SQL } from 'drizzle-orm';

/**
 * Type for database transactions
 * Use this type for transaction parameters across services
 */
export type DbTransaction = NeonHttpDatabase<typeof schema>;
