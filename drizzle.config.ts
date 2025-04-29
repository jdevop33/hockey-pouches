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
// User/Password might be optional depending on auth method, but usually needed
if (!process.env.POSTGRES_USER) {
  throw new Error("POSTGRES_USER environment variable is required for drizzle-kit");
}
if (!process.env.POSTGRES_PASSWORD) {
  throw new Error("POSTGRES_PASSWORD environment variable is required for drizzle-kit");
}


export default {
  dialect: "postgresql",
  schema: "./app/lib/schema/*",
  out: "./db/migrations/drizzle",
  // Use individual properties for dbCredentials
  dbCredentials: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    // Add port if it's non-standard, otherwise node-postgres defaults to 5432
    // port: parseInt(process.env.POSTGRES_PORT || "5432"), 
    ssl: true, // Explicitly set SSL based on Neon requirements (?sslmode=require)
  },
  verbose: true,
  strict: true,
} satisfies Config;
