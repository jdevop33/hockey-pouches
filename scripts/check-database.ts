#!/usr/bin/env node

/**
 * check-database.ts
 * 
 * This script checks the database connection and reports any issues.
 * It's useful for diagnosing deployment issues related to database connectivity.
 */

import { isDatabaseHealthy, resetConnection } from '../app/lib/db';
import { logger } from '../app/lib/logger';

async function main() {
  logger.info('Checking database connection...');
  
  try {
    // Check database health
    const isHealthy = await isDatabaseHealthy();
    
    if (isHealthy) {
      logger.info('✅ Database connection is healthy');
      
      // Try a second check to verify connection reuse
      logger.info('Performing second health check to verify connection reuse...');
      const secondCheck = await isDatabaseHealthy();
      
      if (secondCheck) {
        logger.info('✅ Second database check successful - connection reuse is working');
      } else {
        logger.error('❌ Second database check failed - connection reuse may be broken');
      }
    } else {
      logger.error('❌ Database connection check failed');
      
      // Try resetting the connection and checking again
      logger.info('Resetting database connection and trying again...');
      resetConnection();
      
      const retryCheck = await isDatabaseHealthy();
      if (retryCheck) {
        logger.info('✅ Database connection successful after reset');
      } else {
        logger.error('❌ Database connection still failing after reset');
      }
    }
    
    // Check environment variables
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      logger.error('❌ POSTGRES_URL environment variable is missing');
    } else {
      // Mask the connection string for security
      const maskedConnectionString = connectionString.replace(
        /postgres:\/\/([^:]+):([^@]+)@/,
        'postgres://$1:****@'
      );
      logger.info(`ℹ️ Using connection string: ${maskedConnectionString}`);
    }
    
    // Print troubleshooting tips
    logger.info('\nTroubleshooting tips:');
    logger.info('1. Verify that the POSTGRES_URL environment variable is set correctly');
    logger.info('2. Check that the database server is running and accessible');
    logger.info('3. Ensure that the database user has the necessary permissions');
    logger.info('4. Check for network connectivity issues or firewall restrictions');
    logger.info('5. Verify that the database name in the connection string exists');
    
  } catch (error) {
    logger.error('Error during database check:', { error });
  }
}

main().catch(error => {
  logger.error('Unhandled error in database check script:', { error });
  process.exit(1);
});
