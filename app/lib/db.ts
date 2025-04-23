import { neon } from '@neondatabase/serverless';

// Check for the environment variable and assert it's defined.
// Vercel automatically provides this when linked.
if (!process.env.POSTGRES_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const sql = neon(process.env.POSTGRES_URL);

export default sql;
