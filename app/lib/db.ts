// app/lib/db.ts
import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { mockPool, mockSql } from './db.mock';

// Configure WebSocket constructor for Pool
neonConfig.webSocketConstructor = ws;

// Get connection string from environment
const connectionString = process.env.POSTGRES_URL;

// Initialize pool and sql with either real or mock implementations
let pool: any;
let sql: any;

// Use real database if connection string is available, otherwise use mock
if (connectionString) {
  try {
    // Create real pool and sql
    pool = new Pool({ connectionString });
    sql = neon(connectionString);
    console.log('Database connection initialized with real implementation');
  } catch (error) {
    // Fallback to mock if error occurs
    console.error('Error initializing database connection:', error);
    console.warn('Falling back to mock database');
    pool = mockPool;
    sql = mockSql;
  }
} else {
  // Use mock database
  console.warn('POSTGRES_URL environment variable is not set. Using mock database.');
  pool = mockPool;
  sql = mockSql;
}

// Export pool and sql
export { pool };
export default sql;
