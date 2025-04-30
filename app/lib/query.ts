// app/lib/query.ts
import { db, sql } from './db';
import { PoolClient } from 'pg'; // Keep pg type if PoolClient is still used elsewhere
import { logger } from './logger';

/**
 * Executes a raw SQL query with parameters using the db instance.
 * IMPORTANT: Prefer Drizzle ORM methods (db.query..., db.select..., db.insert...) 
 * over this raw query function whenever possible for type safety.
 *
 * @param text The raw SQL query string.
 * @param params Optional array of parameters for the query.
 * @returns Promise<any[]> The array of rows returned by the query.
 */
export async function query(text: string, params?: any[]): Promise<any[]> {
    const start = Date.now();
    try {
        // Use db.execute with the sql helper tag for parameters
        // sql.raw is used here assuming `text` is a raw string; adjust if `text` is already tagged.
        logger.debug('Executing raw query:', { text, params });
        const result = await db.execute(sql.raw(text, ...(params || [])));
        const duration = Date.now() - start;
        logger.debug('Query executed successfully', { text, duration, rowCount: result.rowCount });
        // Return the rows array directly
        return result.rows;
    } catch (error) {
        const duration = Date.now() - start;
        logger.error('Error executing raw query:', { text, params, duration, error });
        throw error; // Re-throw the error after logging
    }
}

// Example usage (illustrative - prefer ORM methods)
// async function example() {
//     try {
//         const userId = 'some-user-id';
//         const status = 'Active';
//         const users = await query('SELECT * FROM users WHERE id = $1 AND status = $2', [userId, status]);
//         console.log(users);
//     } catch (err) {
//         console.error('Query failed:', err);
//     }
// }
