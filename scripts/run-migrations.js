#!/usr/bin/env node

/**
 * Script to run database migrations in order
 *
 * Usage: node scripts/run-migrations.js
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: '.env.local' });

// Get database connection string from environment variables
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('Error: POSTGRES_URL environment variable is not set');
  process.exit(1);
}

// Migration directory path
const MIGRATIONS_DIR = path.join(__dirname, '../db/migrations');
// Migration table name for tracking applied migrations
const MIGRATIONS_TABLE = 'migrations';

/**
 * Ensure the migrations tracking table exists
 */
async function ensureMigrationsTable() {
  const pool = new Pool({ connectionString });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.end();
}

/**
 * Check if a migration has already been applied
 */
async function isMigrationApplied(name) {
  const pool = new Pool({ connectionString });
  const result = await pool.query(`SELECT 1 FROM ${MIGRATIONS_TABLE} WHERE name = $1`, [name]);
  await pool.end();
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
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Run the migration SQL
      await client.query(sql);

      // Record the migration as applied
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [fileName]);

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
  console.log('🚀 Starting migrations...');

  const pool = new Pool({ connectionString });

  try {
    // Ensure the migrations table exists
    await ensureMigrationsTable();

    // Get list of applied migrations
    const { rows: appliedMigrations } = await pool.query('SELECT name FROM migrations');
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Get migration files
    const files = await fs.readdir(MIGRATIONS_DIR);

    // Sort to ensure migrations run in order
    const migrationFiles = files.filter(file => file.endsWith('.sql')).sort();

    // Run each migration that hasn't been applied yet
    for (const file of migrationFiles) {
      if (appliedMigrationNames.includes(file)) {
        console.log(`✓ Migration ${file} already applied, skipping`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);

      const filePath = path.join(MIGRATIONS_DIR, file);
      await runMigration(filePath, file);
    }

    console.log('✨ All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migrations
runMigrations().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});
