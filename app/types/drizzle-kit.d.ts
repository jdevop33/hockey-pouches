/**
 * Type declarations for drizzle-kit
 */

declare module 'drizzle-kit' {
  export interface Config {
    schema?: string;
    out?: string;
    driver?: unknown;
    dbCredentials?: {
      url?: string;
      host?: string;
      port?: number;
      user?: string;
      password?: string;
      database?: string;
    };
    dialect?: 'pg' | 'mysql' | 'sqlite';
    tablesFilter?: string | string[];
    verbose?: boolean;
    strict?: boolean;
  }

  export function introspect(config: Config): Promise<unknown>;
  export function migrate(config: Config): Promise<unknown>;
  export function push(config: Config): Promise<unknown>;
  export function studio(config: Config): Promise<unknown>;
  export function generate(config: Config): Promise<unknown>;
  export function drop(config: Config): Promise<unknown>;
  export function up(config: Config): Promise<unknown>;
  export function down(config: Config): Promise<unknown>;
}
