// app/lib/db.ts - FINAL ATTEMPT AT CORE FIX
import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless';
import ws from 'ws';
import { logger } from './logger';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { sql as drizzleSqlHelper } from 'drizzle-orm'; // Import the sql helper from drizzle-orm
// Import the combined schema index
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;
const connectionString = process.env.POSTGRES_URL || '';
if (!connectionString) {
  logger.error('POSTGRES_URL missing');
  throw new Error('POSTGRES_URL missing');
}

// Raw Neon client (NOT exported by default)
const neonSqlFn: NeonQueryFunction<false, false> = neon(connectionString);

// --- Drizzle Instance (Exported - Explicitly Typed with Schema!) ---
export const db: NeonHttpDatabase<typeof schema> = drizzle(neonSqlFn, { schema });

// --- Drizzle SQL Helper (Exported for raw queries if absolutely needed) ---
// Use this instead of the old default export if you need the tagged template
export const sql = drizzleSqlHelper;

// --- Healthcheck using Drizzle ---
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    // Use the exported Drizzle sql helper for raw check
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    logger.error('DB health check failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

// Removing Pool and executeQuery as they should be replaced by Drizzle methods
