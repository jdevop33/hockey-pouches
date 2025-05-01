import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local (or .env)
dotenv.config({ path: '.env.local' });

// Check only for the essential POSTGRES_URL for both runtime and drizzle-kit
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is required');
}

export default {
  dialect: "pg", // Updated from "pg" to "postgresql"
  schema: './app/lib/schema/*',
  out: './db/migrations/drizzle',
  // Use the single POSTGRES_URL environment variable
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
