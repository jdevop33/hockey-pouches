// app/lib/db.ts
import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import ws from 'ws';
import { mockPool, mockSql } from './db.mock';

// Configure WebSocket constructor for Pool
neonConfig.webSocketConstructor = ws;

// Get connection string from environment
const connectionString = process.env.POSTGRES_URL;

// Initialize pool and sql with either real or mock implementations
let pool: Pool;
let sql: NeonQueryFunction<any, any>;

// Use real database if connection string is available, otherwise use mock
if (connectionString) {
  try {
    // Create real pool and sql
    pool = new Pool({ connectionString });
    sql = neon(connectionString);
    console.log('Database connection initialized with real implementation');
    console.log('Connection URL format:', connectionString.substring(0, 20) + '...');

    // Test the connection
    pool
      .query('SELECT 1')
      .then(() => {
        console.log('✅ Database connection test successful');
      })
      .catch((error: Error) => {
        console.error('❌ Database connection test failed:', error);
      });
  } catch (error) {
    // Fallback to mock if error occurs
    console.error('Error initializing database connection:', error);
    console.warn('Falling back to mock database');
    pool = mockPool as unknown as Pool;
    sql = mockSql as unknown as NeonQueryFunction<any, any>;
  }
} else {
  // Use mock database
  console.warn('POSTGRES_URL environment variable is not set or empty. Using mock database.');
  console.log(
    'Available env vars:',
    Object.keys(process.env)
      .filter(key => key.includes('PG') || key.includes('POSTGRES'))
      .join(', ')
  );
  pool = mockPool as unknown as Pool;
  sql = mockSql as unknown as NeonQueryFunction<any, any>;
}

// Export pool and sql
export { pool };
export default sql;
