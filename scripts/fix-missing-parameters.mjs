#!/usr/bin/env node

/**
 * Fix missing parameter types in service functions
 *
 * This script specifically addresses functions with ...args parameters
 * and adds proper type definitions to them.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const servicesDir = join(rootDir, 'app', 'lib', 'services');

// Create a log directory
const logDir = join(rootDir, 'logs');
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Setup logging
const logFile = join(
  logDir,
  `parameter-fixes-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
);
let logContent = `Parameter Type Fixes - ${new Date().toISOString()}\n\n`;

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logContent += logMessage + '\n';
}

// Define parameter type mappings for known methods
const paramTypeMappings = {
  // Inventory service
  getProductInventory: 'productId: number',
  getVariationInventory: 'variationId: number',
  getLocationInventory: 'locationId: string, includeVariations = false',
  getStockLocations: 'activeOnly = false',

  // Order service
  getOrderById: 'orderId: string',
  getUserOrders:
    'userId: string, options: { page?: number; limit?: number; status?: OrderStatus } = {}',
  getDistributorOrders:
    'distributorId: string, options: { page?: number; limit?: number; status?: OrderStatus } = {}',

  // Task service
  listTasks:
    'options: { page?: number; limit?: number; status?: string; category?: string; priority?: string; assignedTo?: string } = {}',
  getTaskById: 'taskId: string',
  updateTaskStatus: 'taskId: string, status: string, userId: string',
  completeTask: 'taskId: string, userId: string, notes?: string',

  // Wholesale service
  listApplications: 'options: { page?: number; limit?: number; status?: string } = {}',
  getApplicationById: 'applicationId: string',
  approveApplication: 'applicationId: string, adminUserId: string, notes?: string',
  rejectApplication: 'applicationId: string, adminUserId: string, reason: string',

  // User service
  getUserReferrals: 'userId: string',
  getUserTasks: 'userId: string, status?: string',
  getUserCommissions:
    'userId: string, options: { page?: number; limit?: number; status?: string } = {}',
  verifyEmailToken: 'token: string',
};

// Process a file to fix parameter types
async function processFile(filePath) {
  try {
    log(`Processing ${filePath}...`);
    const content = readFileSync(filePath, 'utf8');

    // Regular expression to find methods with ...args
    const methodPattern = /async\s+(\w+)\(\.\.\.(args)\):\s*Promise<([^>]+)>/g;

    let modified = content;
    let match;
    let count = 0;

    // Process each match
    while ((match = methodPattern.exec(content)) !== null) {
      const methodName = match[1];
      const argsParam = match[2];
      const returnType = match[3];

      // Only replace if we have a mapping for this method
      if (paramTypeMappings[methodName]) {
        const oldSignature = `async ${methodName}(...${argsParam}): Promise<${returnType}>`;
        const newSignature = `async ${methodName}(${paramTypeMappings[methodName]}): Promise<${returnType}>`;

        modified = modified.replace(oldSignature, newSignature);
        count++;
        log(`Fixed ${methodName} in ${filePath}`);
      }
    }

    // Write changes if any were made
    if (count > 0) {
      writeFileSync(filePath, modified, 'utf8');
      log(`Updated ${count} methods in ${filePath}`);
    } else {
      log(`No methods to fix in ${filePath}`);
    }

    return count;
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

// Main function
async function main() {
  try {
    log('Starting parameter type fixes...');

    // Find all TypeScript files in services directory
    const files = await glob(`${servicesDir}/**/*.ts`);

    // Process each file
    let totalFixed = 0;
    for (const file of files) {
      const count = await processFile(file);
      totalFixed += count;
    }

    // Output summary
    log(`\nTotal methods fixed: ${totalFixed}`);

    // Save log
    writeFileSync(logFile, logContent, 'utf8');
    log(`Log saved to: ${logFile}`);
  } catch (error) {
    log(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
