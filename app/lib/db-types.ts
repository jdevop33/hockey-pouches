/**
 * Type representing a database query result
 * Flexible enough to handle different result formats
 */
export type DbQueryResult = any[] | { rows?: any[]; rowCount?: number } | Record<string, any>;

/**
 * Helper function to safely extract rows from a query result
 * Works with both array results and object results with a rows property
 *
 * @param result Query result from database
 * @returns Array of rows
 */
export function getRows(result: DbQueryResult): any[] {
  // If result is array-like, return it directly
  if (Array.isArray(result)) {
    return result;
  }

  // If it has a rows property that's an array, return that
  if (result && typeof result === 'object' && 'rows' in result && Array.isArray(result.rows)) {
    return result.rows;
  }

  // Fallback to empty array
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
    return result.length;
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
    return result.rows.length;
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
export function getFirstRow(result: DbQueryResult): any | null {
  const rows = getRows(result);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Helper function to safely map over rows in a query result
 *
 * @param result Query result
 * @param callback Mapping function
 * @returns Mapped array
 */
export function mapRows<R = any>(
  result: DbQueryResult,
  callback: (row: any, index: number) => R
): R[] {
  return getRows(result).map(callback);
}
