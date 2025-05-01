// app/lib/query.ts
import { db, sql } from './db';
import { SQL } from 'drizzle-orm';
import { logger } from './logger';
import { getRows, castDbRow, castDbRows } from './db-types';

// Defining a generic type for query results
export type DbQueryResult = Record<string, unknown>;
export type DbRow = Record<string, unknown>;

/**
 * Executes a raw SQL query with parameters using the db instance.
 * IMPORTANT: Prefer Drizzle ORM methods (db.query..., db.select..., db.insert...)
 * over this raw query function whenever possible for type safety.
 *
 * @param text The raw SQL query string.
 * @param params Optional array of parameters for the query.
 * @returns Promise<any[]> The array of rows returned by the query.
 */
export async function query(text: string, params?: unknown[]): Promise<any[]> {
  const start = Date.now();
  try {
    // Use db.execute with the sql helper tag for parameters
    // sql.raw is used here assuming `text` is a raw string; adjust if `text` is already tagged.
    logger.debug('Executing raw query:', { text, params });
    // Ensure db is not null before executing
    if (!db) {
      throw new Error('Database connection is not available.');
    }
    const result = await db.execute(sql.raw(text, ...(params || [])));
    const duration = Date.now() - start;
    const rowCount =
      'rowCount' in result && typeof result.rowCount === 'number'
        ? result.rowCount
        : 'rows' in result && Array.isArray(result.rows)
          ? result.rows.length
          : 0;
    logger.debug('Query executed successfully', { text, duration, rowCount });
    // Return the rows array directly (handle potential undefined rows)
    return 'rows' in result && Array.isArray(result.rows) ? result.rows : [];
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Error executing raw query:', { text, params, duration, error });
    throw error; // Re-throw the error after logging
  }
}

/**
 * Helper function to safely extract rows from SQL query results.
 * This function handles both Drizzle ORM SQL results and raw query results.
 *
 * @param result The SQL query result
 * @returns Array of row objects
 */
export function getRows(result: SQL<unknown> | DbQueryResult): DbRow[] {
  if (!result) return [];

  // Check if it's a Drizzle SQL result
  if (typeof result === 'object' && 'rows' in result) {
    return result.rows as DbRow[];
  }

  // Handle the case where it's already an array
  if (Array.isArray(result)) {
    return result as DbRow[];
  }

  // Return empty array if none of the above
  return [];
}

// Example usage (illustrative - prefer ORM methods)
// async function example() {
//     try {
//         const userId = 'some-user-id';
//         const status = 'Active';
//         const users = await query('SELECT * FROM users WHERE id = $1 AND status = $2', [userId, status]);
//
//     } catch (err) {
//         console.error('Query failed:', err);
//     }
// }
