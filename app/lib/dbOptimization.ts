// app/lib/dbOptimization.ts
import sql, { pool } from './db';
import { cache } from 'react';
import { getFirstRow, getRowCount, getRows } from './db-types';

/**
 * Cache duration in milliseconds
 */
export const CACHE_DURATIONS = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

/**
 * In-memory cache for database queries
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const queryCache = new Map<string, CacheEntry<any>>();

/**
 * Executes a cached query, returning cached results if available and not expired
 * @param queryKey Unique key for the query
 * @param queryFn Function that executes the query
 * @param duration Cache duration in milliseconds
 * @returns Query results
 */
export async function cachedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  duration: number = CACHE_DURATIONS.MEDIUM
): Promise<T> {
  const now = Date.now();
  const cached = queryCache.get(queryKey);

  // Return cached result if valid
  if (cached && now < cached.expiresAt) {
    console.log(`Cache hit for query: ${queryKey}`);
    return cached.data;
  }

  // Execute query and cache result
  console.log(`Cache miss for query: ${queryKey}`);
  const data = await queryFn();
  queryCache.set(queryKey, {
    data,
    timestamp: now,
    expiresAt: now + duration,
  });

  return data;
}

/**
 * Invalidates a specific cache entry
 * @param queryKey Key of the cache entry to invalidate
 */
export function invalidateCache(queryKey: string): void {
  queryCache.delete(queryKey);
  console.log(`Cache invalidated for query: ${queryKey}`);
}

/**
 * Invalidates all cache entries
 */
export function invalidateAllCache(): void {
  queryCache.clear();
  console.log('All cache entries invalidated');
}

/**
 * Invalidates cache entries that match a prefix
 * @param prefix Prefix to match
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
      console.log(`Cache invalidated for query: ${key}`);
    }
  }
}

/**
 * Optimized pagination query builder
 * @param table Table name
 * @param options Query options
 * @returns SQL query and count query
 */
export function buildPaginationQuery({
  table,
  selectFields,
  whereConditions = [],
  whereParams = [],
  orderBy = '',
  page = 1,
  limit = 10,
}: {
  table: string;
  selectFields: string;
  whereConditions?: string[];
  whereParams?: any[];
  orderBy?: string;
  page?: number;
  limit?: number;
}) {
  // Ensure page and limit are valid
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, Math.min(100, limit));
  const offset = (validPage - 1) * validLimit;

  // Build where clause if any conditions are provided
  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Build query string
  const query = `
    SELECT ${selectFields}
    FROM ${table}
    ${whereClause}
    ${orderBy ? `ORDER BY ${orderBy}` : ''}
    LIMIT ${validLimit} OFFSET ${offset}
  `;

  // Build count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ${table}
    ${whereClause}
  `;

  // Debug logging
  console.log('Building Pagination Query:');
  console.log('- Table:', table);
  console.log('- Where Conditions:', whereConditions);
  console.log('- Parameter Count:', whereParams.length);
  console.log('- Order By:', orderBy);
  console.log('- Page:', validPage, 'Limit:', validLimit, 'Offset:', offset);

  return {
    query,
    countQuery,
    params: whereParams,
    countParams: whereParams,
  };
}

/**
 * Execute a query with a transaction
 * @param callback Function that executes queries within the transaction
 * @returns Result of the callback function
 */
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Optimized query for fetching a single record by ID
 * @param table Table name
 * @param id Record ID
 * @param fields Fields to select
 * @returns The record or null if not found
 */
export async function getById(
  table: string,
  id: number | string,
  fields: string = '*'
): Promise<any | null> {
  const query = `SELECT ${fields} FROM ${table} WHERE id = $1 LIMIT 1`;
  const result = await sql.query(query, [id]);

  return getFirstRow(result);
}

/**
 * Optimized query for fetching multiple records by IDs
 * @param table Table name
 * @param ids Array of record IDs
 * @param fields Fields to select
 * @returns Array of records
 */
export async function getByIds(
  table: string,
  ids: (number | string)[],
  fields: string = '*'
): Promise<any[]> {
  if (ids.length === 0) return [];

  // Create placeholders for the ids
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT ${fields} FROM ${table} WHERE id IN (${placeholders})`;

  const result = await sql.query(query, ids);
  return getRows(result);
}

/**
 * Optimized query for inserting a record
 * @param table Table name
 * @param data Record data
 * @returns The inserted record
 */
export async function insert(table: string, data: Record<string, any>): Promise<any> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  // Build the query
  const fields = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const query = `
    INSERT INTO ${table} (${fields})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await sql.query(query, values);
  return getFirstRow(result);
}

/**
 * Optimized query for updating a record
 * @param table Table name
 * @param id Record ID
 * @param data Record data
 * @returns The updated record
 */
export async function update(
  table: string,
  id: number | string,
  data: Record<string, any>
): Promise<any> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  // Build the query
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  const query = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;

  const result = await sql.query(query, [...values, id]);
  return getFirstRow(result);
}

/**
 * Optimized query for deleting a record
 * @param table Table name
 * @param id Record ID
 * @returns Boolean indicating success
 */
export async function remove(table: string, id: number | string): Promise<boolean> {
  const result = await sql.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return getRowCount(result) > 0;
}

/**
 * React Server Component compatible cached database query
 * Uses React's cache() for server-side caching
 */
export const cachedServerQuery = cache(async <T>(queryFn: () => Promise<T>): Promise<T> => {
  return await queryFn();
});
