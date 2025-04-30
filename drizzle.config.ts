import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env.local (or .env)
dotenv.config({ path: ".env.local" });

// Check for essential individual credentials
if (!process.env.POSTGRES_HOST) {
  throw new Error("POSTGRES_HOST environment variable is required for drizzle-kit");
}
if (!process.env.POSTGRES_DATABASE) {
  throw new Error("POSTGRES_DATABASE environment variable is required for drizzle-kit");
}
if (!process.env.POSTGRES_USER) {
  throw new Error("POSTGRES_USER environment variable is required for drizzle-kit");
}
if (!process.env.POSTGRES_PASSWORD) {
  throw new Error("POSTGRES_PASSWORD environment variable is required for drizzle-kit");
}

// Construct the connection URL which handles SSL correctly for Neon
// Ensure sslmode=require is part of the connection string if using Neon
const connectionUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DATABASE}?sslmode=require`;

export default {
  dialect: "pg", // Correct dialect for PostgreSQL
  schema: "./app/lib/schema/*",
  out: "./db/migrations/drizzle",
  // Use the connection URL for dbCredentials - Drizzle Kit often handles URL format better
  dbCredentials: {
    url: connectionUrl,
    // host: process.env.POSTGRES_HOST,
    // user: process.env.POSTGRES_USER,
    // password: process.env.POSTGRES_PASSWORD,
    // database: process.env.POSTGRES_DATABASE,
    // ssl: true, // SSL is typically handled by the URL
  },
  verbose: true,
  strict: true,
} satisfies Config;
