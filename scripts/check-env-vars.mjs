#!/usr/bin/env node

/**
 * check-env-vars.mjs
 * 
 * This script checks for required environment variables and reports any that are missing.
 * It's useful for diagnosing deployment issues related to missing environment variables.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Try to load environment variables from .env.local
try {
  dotenv.config({ path: path.join(rootDir, '.env.local') });
  log('Loaded environment variables from .env.local');
} catch (error) {
  log(`Warning: Could not load .env.local file: ${error.message}`);
}

// Define required environment variables
const requiredEnvVars = [
  {
    name: 'POSTGRES_URL',
    description: 'Database connection string',
    critical: true
  },
  {
    name: 'JWT_SECRET',
    description: 'Secret key for JWT authentication',
    critical: true
  },
  {
    name: 'COOKIE_SECRET',
    description: 'Secret key for cookie encryption',
    critical: true
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    description: 'Base URL for the application',
    critical: false
  },
  {
    name: 'NEXT_PUBLIC_SITE_NAME',
    description: 'Site name for display',
    critical: false
  },
  {
    name: 'NEXT_PUBLIC_CONTACT_EMAIL',
    description: 'Contact email for display',
    critical: false
  }
];

// Check for missing environment variables
log('Checking for required environment variables...');

let missingCriticalVars = 0;
let missingNonCriticalVars = 0;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar.name]) {
    if (envVar.critical) {
      log(`❌ CRITICAL: Missing required environment variable: ${envVar.name} - ${envVar.description}`);
      missingCriticalVars++;
    } else {
      log(`⚠️ WARNING: Missing recommended environment variable: ${envVar.name} - ${envVar.description}`);
      missingNonCriticalVars++;
    }
  } else {
    log(`✅ Found environment variable: ${envVar.name}`);
  }
}

// Summary
log('\nEnvironment variables check summary:');
if (missingCriticalVars === 0 && missingNonCriticalVars === 0) {
  log('✅ All required environment variables are set.');
} else {
  if (missingCriticalVars > 0) {
    log(`❌ Missing ${missingCriticalVars} critical environment variables. Application may not function correctly.`);
  }
  
  if (missingNonCriticalVars > 0) {
    log(`⚠️ Missing ${missingNonCriticalVars} recommended environment variables. Some features may be degraded.`);
  }
  
  log('\nTo fix these issues:');
  log('1. Create or update your .env.local file with the missing variables');
  log('2. If deploying to Vercel, add the missing variables in the Vercel dashboard');
  log('3. Refer to .env.example for the expected format of each variable');
}

// Exit with error code if critical variables are missing
if (missingCriticalVars > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
