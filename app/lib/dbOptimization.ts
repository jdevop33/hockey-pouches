// app/lib/dbOptimization.ts
import { Pool } from '@neondatabase/serverless';
import sql from './db';
import { cache } from 'react';

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
  selectFields = '*',
  countField = '*',
  whereConditions = [],
  whereParams = [],
  joinClauses = [],
  orderBy = 'id ASC',
  page = 1,
  limit = 10,
  groupBy = '',
}: {
  table: string;
  selectFields?: string;
  countField?: string;
  whereConditions?: string[];
  whereParams?: any[];
  joinClauses?: string[];
  orderBy?: string;
  page?: number;
  limit?: number;
  groupBy?: string;
}) {
  const offset = (page - 1) * limit;
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const joins = joinClauses.length > 0 ? joinClauses.join(' ') : '';
  const groupByClause = groupBy ? `GROUP BY ${groupBy}` : '';

  // Main query with pagination
  const query = `
    SELECT ${selectFields}
    FROM ${table}
    ${joins}
    ${whereClause}
    ${groupByClause}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Count query for pagination
  const countQuery = `
    SELECT COUNT(${countField}) as total
    FROM ${table}
    ${joins}
    ${whereClause}
    ${groupByClause}
  `;

  return {
    query,
    countQuery,
    params: [...whereParams, limit, offset],
    countParams: [...whereParams],
  };
}

/**
 * Execute a query with a transaction
 * @param callback Function that executes queries within the transaction
 * @returns Result of the callback function
 */
export async function withTransaction<T>(
  callback: (client: Pool) => Promise<T>
): Promise<T> {
  const client = await sql.connect();
  
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
  const result = await sql`
    SELECT ${sql.raw(fields)}
    FROM ${sql.raw(table)}
    WHERE id = ${id}
    LIMIT 1
  `;

  return result.length > 0 ? result[0] : null;
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

  const result = await sql`
    SELECT ${sql.raw(fields)}
    FROM ${sql.raw(table)}
    WHERE id IN ${sql(ids)}
  `;

  return result;
}

/**
 * Optimized query for inserting a record
 * @param table Table name
 * @param data Record data
 * @returns The inserted record
 */
export async function insert(
  table: string,
  data: Record<string, any>
): Promise<any> {
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
  return result[0];
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
  return result[0];
}

/**
 * Optimized query for deleting a record
 * @param table Table name
 * @param id Record ID
 * @returns Boolean indicating success
 */
export async function remove(
  table: string,
  id: number | string
): Promise<boolean> {
  const result = await sql.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return result.length > 0;
}

/**
 * React Server Component compatible cached database query
 * Uses React's cache() for server-side caching
 */
export const cachedServerQuery = cache(async <T>(
  queryFn: () => Promise<T>
): Promise<T> => {
  return await queryFn();
});
