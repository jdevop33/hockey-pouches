// app/lib/dbInit.ts
import { createRecommendedIndexes, analyzeAllTables } from './dbIndexes';
import { checkConnection } from './dbConnectionPool';

/**
 * Initializes the database with optimizations
 * This function should be called during application startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
        
    // Check database connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
        
    // Create recommended indexes
    await createRecommendedIndexes();
    
    // Analyze tables for query optimization
    await analyzeAllTables();
    
      } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
