// app/lib/db.ts
import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket constructor for Pool
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set.');
}

// Export a connection pool (for transactions or more complex scenarios)
const pool = new Pool({ connectionString });
console.log('Database connection pool initialized.');
export { pool }; // Named export for the pool

// Export the sql tagged template function (for simpler queries)
const sql = neon(connectionString);
console.log('Database sql tagged template function initialized.');
export default sql; // Default export for sql function
