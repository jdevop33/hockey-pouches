#!/usr/bin/env node

/**
 * Script to run database migrations in order
 *
 * Usage: node scripts/run-migrations.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({ path: '.env.local' });

// Create a PostgreSQL pool
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Migration directory path
const MIGRATIONS_DIR = path.join(__dirname, '../db/migrations');
// Migration table name for tracking applied migrations
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Ensure the migrations tracking table exists
 */
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Check if a migration has already been applied
 */
async function isMigrationApplied(name) {
  const result = await pool.query(`SELECT 1 FROM ${MIGRATIONS_TABLE} WHERE name = $1`, [name]);
  return result.rowCount > 0;
}

/**
 * Run a single migration file
 */
async function runMigration(filePath, fileName) {
  try {
    // Check if the migration has already been applied
    if (await isMigrationApplied(fileName)) {
      console.log(`Skipping migration ${fileName} (already applied)`);
      return;
    }

    // Read the migration file
    const sql = await fs.readFile(filePath, 'utf8');

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Run the migration SQL
      await client.query(sql);

      // Record the migration as applied
      await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [fileName]);

      // Commit the transaction
      await client.query('COMMIT');
      console.log(`Applied migration: ${fileName}`);
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error(`Failed to apply migration ${fileName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error processing migration ${fileName}:`, error);
    throw error;
  }
}

/**
 * Run all migrations in the migrations directory
 */
async function runMigrations() {
  try {
    // Ensure the migrations table exists
    await ensureMigrationsTable();

    // Get all .sql files from the migrations directory
    const files = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort(); // Sort to ensure migrations run in order

    // Run each migration
    for (const file of sqlFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      await runMigration(filePath, file);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database pool
    await pool.end();
  }
}

// Run the migrations
runMigrations();
