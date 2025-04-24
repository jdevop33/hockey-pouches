// app/lib/dbIndexes.ts
import sql from './db';

/**
 * Interface for index definition
 */
interface IndexDefinition {
  table: string;
  columns: string[];
  name?: string;
  unique?: boolean;
}

/**
 * Creates a database index if it doesn't exist
 * @param index Index definition
 * @returns Result of the query
 */
export async function createIndexIfNotExists(index: IndexDefinition): Promise<any> {
  const { table, columns, name, unique = false } = index;
  
  // Generate index name if not provided
  const indexName = name || `idx_${table}_${columns.join('_')}`;
  
  // Build the query
  const uniqueClause = unique ? 'UNIQUE' : '';
  const columnsStr = columns.join(', ');
  
  const query = `
    CREATE ${uniqueClause} INDEX IF NOT EXISTS ${indexName}
    ON ${table} (${columnsStr})
  `;
  
  try {
    const result = await sql.query(query);
    console.log(`Index ${indexName} created or already exists`);
    return result;
  } catch (error) {
    console.error(`Error creating index ${indexName}:`, error);
    throw error;
  }
}

/**
 * Drops a database index if it exists
 * @param indexName Name of the index
 * @returns Result of the query
 */
export async function dropIndexIfExists(indexName: string): Promise<any> {
  const query = `DROP INDEX IF EXISTS ${indexName}`;
  
  try {
    const result = await sql.query(query);
    console.log(`Index ${indexName} dropped or doesn't exist`);
    return result;
  } catch (error) {
    console.error(`Error dropping index ${indexName}:`, error);
    throw error;
  }
}

/**
 * Checks if an index exists
 * @param indexName Name of the index
 * @returns Boolean indicating if the index exists
 */
export async function indexExists(indexName: string): Promise<boolean> {
  const query = `
    SELECT 1
    FROM pg_indexes
    WHERE indexname = $1
  `;
  
  try {
    const result = await sql.query(query, [indexName]);
    return result.length > 0;
  } catch (error) {
    console.error(`Error checking if index ${indexName} exists:`, error);
    throw error;
  }
}

/**
 * Gets all indexes for a table
 * @param tableName Name of the table
 * @returns Array of index information
 */
export async function getTableIndexes(tableName: string): Promise<any[]> {
  const query = `
    SELECT
      i.relname as index_name,
      a.attname as column_name,
      ix.indisunique as is_unique,
      ix.indisprimary as is_primary
    FROM
      pg_class t,
      pg_class i,
      pg_index ix,
      pg_attribute a
    WHERE
      t.oid = ix.indrelid
      AND i.oid = ix.indexrelid
      AND a.attrelid = t.oid
      AND a.attnum = ANY(ix.indkey)
      AND t.relkind = 'r'
      AND t.relname = $1
    ORDER BY
      i.relname
  `;
  
  try {
    const result = await sql.query(query, [tableName]);
    return result;
  } catch (error) {
    console.error(`Error getting indexes for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Creates recommended indexes for the application
 * This function should be called during application initialization
 */
export async function createRecommendedIndexes(): Promise<void> {
  const indexes: IndexDefinition[] = [
    // Users table indexes
    { table: 'users', columns: ['email'], unique: true },
    { table: 'users', columns: ['role'] },
    { table: 'users', columns: ['status'] },
    { table: 'users', columns: ['referral_code'], unique: true },
    { table: 'users', columns: ['referred_by_code'] },
    
    // Products table indexes
    { table: 'products', columns: ['is_active'] },
    { table: 'products', columns: ['category'] },
    { table: 'products', columns: ['flavor'] },
    { table: 'products', columns: ['strength'] },
    { table: 'products', columns: ['price'] },
    
    // Orders table indexes
    { table: 'orders', columns: ['user_id'] },
    { table: 'orders', columns: ['status'] },
    { table: 'orders', columns: ['payment_status'] },
    { table: 'orders', columns: ['assigned_distributor_id'] },
    { table: 'orders', columns: ['created_at'] },
    
    // Order items table indexes
    { table: 'order_items', columns: ['order_id'] },
    { table: 'order_items', columns: ['product_id'] },
    
    // Commissions table indexes
    { table: 'commissions', columns: ['user_id'] },
    { table: 'commissions', columns: ['order_id'] },
    { table: 'commissions', columns: ['status'] },
    { table: 'commissions', columns: ['earned_date'] },
    { table: 'commissions', columns: ['payout_date'] },
    { table: 'commissions', columns: ['payout_batch_id'] },
    
    // Discount codes table indexes
    { table: 'discount_codes', columns: ['code'], unique: true },
    { table: 'discount_codes', columns: ['is_active'] },
    { table: 'discount_codes', columns: ['start_date'] },
    { table: 'discount_codes', columns: ['end_date'] },
    
    // Inventory table indexes
    { table: 'inventory', columns: ['product_id'] },
    { table: 'inventory', columns: ['location'] },
    
    // Tasks table indexes
    { table: 'tasks', columns: ['status'] },
    { table: 'tasks', columns: ['priority'] },
    { table: 'tasks', columns: ['category'] },
    { table: 'tasks', columns: ['assigned_to'] },
    { table: 'tasks', columns: ['related_to', 'related_id'] },
  ];
  
  // Create indexes in parallel
  await Promise.all(indexes.map(index => createIndexIfNotExists(index)));
  console.log('All recommended indexes created or already exist');
}

/**
 * Analyzes a table to update statistics for the query planner
 * @param tableName Name of the table
 * @returns Result of the query
 */
export async function analyzeTable(tableName: string): Promise<any> {
  const query = `ANALYZE ${tableName}`;
  
  try {
    const result = await sql.query(query);
    console.log(`Table ${tableName} analyzed`);
    return result;
  } catch (error) {
    console.error(`Error analyzing table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Analyzes all tables in the database
 * @returns Result of the query
 */
export async function analyzeAllTables(): Promise<any> {
  const query = `ANALYZE`;
  
  try {
    const result = await sql.query(query);
    console.log('All tables analyzed');
    return result;
  } catch (error) {
    console.error('Error analyzing all tables:', error);
    throw error;
  }
}
