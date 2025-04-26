import sql from './db';
import { getRows } from './db-types';

/**
 * Helper to execute a SQL query and return plain rows.
 * Keeps Neon's rich typing under the hood but surfaces simple T[].
 */
export async function queryRows<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await sql.query(text, params as any[]);
  return getRows(result) as T[];
}
