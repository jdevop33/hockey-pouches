// app/lib/dbOptimization.ts
import { db, sql } from './db';
import { getRows, getFirstRow, getRowCount } from './db-types';
import { cache } from 'react';

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// In-memory cache store
const queryCache: Record<string, CacheEntry<unknown>> = {};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Executes a cached query, returning cached results if available and not expired
 * @param queryKey Unique key to identify the query
 * @param queryFn Function that executes the query
 * @param duration Cache duration in milliseconds
 * @returns Query result
 */
export async function cachedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  duration: number = $1?.$2
): Promise<T> {
  // Check if cache exists and is not expired
  const cachedResult = queryCache[queryKey];

  if (cachedResult && cachedResult.expiresAt > Date.now()) {
    
    return cachedResult.data as T;
  }

  // Execute the query
  
  try {
    const data = await queryFn();

    // Store in cache
    queryCache[queryKey] = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };

    return data;
  } catch (error) {
    console.error(`Error executing cached query ${queryKey}:`, error);
    throw error;
  }
}

/**
 * Invalidate a specific cache entry
 * @param queryKey Cache key to invalidate
 */
export function invalidateCache(queryKey: string): void {
  delete queryCache[queryKey];
  
}

/**
 * Invalidate all cache entries
 */
export function invalidateAllCache(): void {
  Object.keys(queryCache).forEach(key => delete queryCache[key]);
  
}

/**
 * Invalidate cache entries that start with the given prefix
 * @param prefix Cache key prefix
 */
export function invalidateCacheByPrefix(prefix: string): void {
  Object.keys(queryCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete queryCache[key]);
  
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
  whereParams?: unknown[];
  orderBy?: string;
  page?: number;
  limit?: number;
}) {
  // Ensure page and limit are valid
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, Math.min(100, limit));
  const offset = (validPage - 1) * validLimit;

  // Build where clause if any conditions are provided
  const whereClause = Array.isArray(whereConditions) ? Array.isArray(whereConditions) ? Array.isArray(whereConditions) ? Array.isArray(whereConditions) ? whereConditions.length : 0 : 0 : 0 : 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

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
  
  
  
  
  
  

  return {
    query,
    countQuery,
    params: whereParams,
    countParams: whereParams,
  };
}

/**
 * Execute a query with a transaction
 * Note: This function requires a proper connection pool implementation
 * which is not available in the current codebase. For now, we'll implement
 * a simplified version using the db object.
 */
export async function withTransaction<T>(callback: (client: unknown) => Promise<T>): Promise<T> {
  try {
    // Begin transaction
    await db.execute(sql`BEGIN`);

    // Execute callback with the db client
    const result = await callback(db);

    // Commit transaction
    await db.execute(sql`COMMIT`);

    return result;
  } catch (error) {
    // Rollback transaction on error
    await db.execute(sql`ROLLBACK`);
    throw error;
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
): Promise<unknown | null> {
  const result = await db.execute(sql`
    SELECT ${sql.raw(fields)} FROM ${sql.raw(table)} WHERE id = ${id} LIMIT 1
  `);

  return getFirstRow(result as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult);
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
): Promise<unknown[]> {
  if (Array.isArray(ids) ? Array.isArray(ids) ? Array.isArray(ids) ? Array.isArray(ids) ? ids.length : 0 : 0 : 0 : 0 === 0) return [];

  // This is a simplified implementation using IN clause
  // For larger sets of IDs, you might want to use a different approach
  const result = await db.execute(sql`
    SELECT ${sql.raw(fields)} FROM ${sql.raw(table)} WHERE id IN (${ids})
  `);

  return getRows(result as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult);
}

/**
 * Optimized query for inserting a record
 * @param table Table name
 * @param data Record data
 * @returns The inserted record
 */
export async function insert(table: string, data: Record<string, unknown>): Promise<unknown> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  // Generate field and value parts of the query
  const fields = keys.join(', ');
  const valuePlaceholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  // For a more robust solution, we would build the query dynamically with SQL parameters
  // but this is a simplified implementation using sql.raw
  const query = sql`
    INSERT INTO ${sql.raw(table)} (${sql.raw(fields)})
    VALUES (${values})
    RETURNING *
  `;

  const result = await db.execute(query);
  return getFirstRow(result as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult);
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
  data: Record<string, unknown>
): Promise<unknown> {
  // Convert data to key-value pairs for SQL
  const setEntries = Object.entries(data).map(([key, value]) => {
    return sql`${sql.raw(key)} = ${value}`;
  });

  const setClause = setEntries.join(', ');

  const result = await db.execute(sql`
    UPDATE ${sql.raw(table)}
    SET ${sql.raw(setClause)}
    WHERE id = ${id}
    RETURNING *
  `);

  return getFirstRow(result as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult);
}

/**
 * Optimized query for deleting a record
 * @param table Table name
 * @param id Record ID
 * @returns Boolean indicating success
 */
export async function remove(table: string, id: number | string): Promise<boolean> {
  const result = await db.execute(sql`
    DELETE FROM ${sql.raw(table)} WHERE id = ${id}
  `);

  return getRowCount(result as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult as unknown as DbQueryResult) > 0;
}

/**
 * React Server Component compatible cached database query
 * Uses React's cache() for server-side caching
 */
export const cachedServerQuery = cache(async <T>(queryFn: () => Promise<T>): Promise<T> => {
  return await queryFn();
});
