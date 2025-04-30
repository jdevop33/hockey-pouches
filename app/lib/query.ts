import { db, sql } from './db';
import { getRows } from './db-types';

/**
 * Helper to execute a SQL query and return plain rows.
 * Keeps Neon's rich typing under the hood but surfaces simple T[].
 */
export async function queryRows<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  try {
    // Use the sql tag function to create a parameterized query
    let query;

    if (!params || params.length === 0) {
      // If no params, use the raw SQL string
      query = sql`${sql.raw(text)}`;
      const result = await db.execute(query);
      return getRows(result) as T[];
    } else {
      // For parameterized queries, use the execute method directly
      const result = await db.execute(text, params);
      return getRows(result) as T[];
    }
  } catch (error) {
    console.error('Error executing query:', error);
    // Re-throw the error for handling at a higher level
    throw error;
  }
}
