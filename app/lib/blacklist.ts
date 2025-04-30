import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { tokenBlacklist } from '@/lib/schema';
import { logger } from '@/lib/logger';

/**
 * Add a token to the blacklist
 * @param token JWT token to blacklist
 * @param expiresAt Optional expiration date. If not provided, token will be blacklisted for 30 days
 */
export async function blacklistToken(token: string, expiresAt?: Date): Promise<void> {
  try {
    // Set default expiration to 30 days from now if not provided
    const expiration = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Add token to blacklist table
    await db.insert(tokenBlacklist).values({
      token: token,
      createdAt: new Date(),
      expiresAt: expiration,
    });

    // Clean up expired tokens occasionally (1% chance per request)
    if (Math.random() < 0.01) {
      await db.delete(tokenBlacklist).where(sql`${tokenBlacklist.expiresAt} < NOW()`);
    }
  } catch (error) {
    logger.error('Error blacklisting token', {}, error);
    throw error;
  }
}

/**
 * Check if a token is blacklisted
 * @param token JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tokenBlacklist)
      .where(sql`${tokenBlacklist.token} = ${token} AND ${tokenBlacklist.expiresAt} > NOW()`)
      .execute();

    return result[0]?.count > 0;
  } catch (error) {
    logger.error('Error checking token blacklist', {}, error);
    // In case of error, return true to be safe (reject the token)
    return true;
  }
}
