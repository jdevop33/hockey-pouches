// app/lib/logger.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | unknown;
}

/**
 * In-memory log storage for development
 */
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 1000;

/**
 * Get current environment
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format error object for logging
 */
function formatError(error: Error | unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: errorMessage,
      stack: error.stack,
      cause: error.cause,
    };
  }
  
  return { error };
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error | unknown
): LogEntry {
  const timestamp = new Date().toISOString();
  
  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    context,
  };
  
  if (error) {
    logEntry.error = formatError(error);
  }
  
  return logEntry;
}

/**
 * Log to console with appropriate formatting
 */
function logToConsole(entry: LogEntry): void {
  const { timestamp, level, message, context, error } = entry;
  
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, context || '', error || '');
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, context || '', error || '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, context || '', error || '');
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, context || '', error || '');
      break;
  }
}

/**
 * Store log entry in memory (for development)
 */
function storeLogEntry(entry: LogEntry): void {
  logHistory.unshift(entry);
  
  // Trim log history if it exceeds maximum size
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.length = MAX_LOG_HISTORY;
  }
}

/**
 * Main logging function
 */
function log(
  level: LogLevel,
  message: string,
  context?: Record<string, any>,
  error?: Error | unknown
): void {
  const entry = createLogEntry(level, message, context, error);
  
  // Always log to console
  logToConsole(entry);
  
  // Store in memory for development
  if (isDevelopment) {
    storeLogEntry(entry);
  }
  
  // In production, we could send logs to a service like Vercel Logs, LogDNA, etc.
  // This would be implemented here
}

/**
 * Logger object with convenience methods
 */
export const logger = {
  debug: (message: string, context?: Record<string, any>) => 
    log(LogLevel.DEBUG, message, context),
  
  info: (message: string, context?: Record<string, any>) => 
    log(LogLevel.INFO, message, context),
  
  warn: (message: string, context?: Record<string, any>, error?: Error | unknown) => 
    log(LogLevel.WARN, message, context, error),
  
  error: (message: string, context?: Record<string, any>, error?: Error | unknown) => 
    log(LogLevel.ERROR, message, context, error),
  
  /**
   * Get log history (for development)
   */
  getHistory: (limit: number = MAX_LOG_HISTORY): LogEntry[] => 
    logHistory.slice(0, limit),
  
  /**
   * Clear log history (for development)
   */
  clearHistory: (): void => {
    logHistory.length = 0;
  },
  
  /**
   * Log API request
   */
  logRequest: (req: NextRequest, context?: Record<string, any>): void => {
    const url = new URL(req.url);
    
    log(LogLevel.INFO, `API Request: ${req.method} ${url.pathname}`, {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(req.headers),
      ...context,
    });
  },
  
  /**
   * Log API response
   */
  logResponse: (
    req: NextRequest,
    res: NextResponse,
    responseTime?: number,
    context?: Record<string, any>
  ): void => {
    const url = new URL(req.url);
    
    log(LogLevel.INFO, `API Response: ${req.method} ${url.pathname}`, {
      method: req.method,
      path: url.pathname,
      status: res.status,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      ...context,
    });
  },
};

/**
 * Create a logger with a specific context
 */
export function createContextLogger(
  contextName: string,
  defaultContext?: Record<string, any>
) {
  return {
    debug: (message: string, context?: Record<string, any>) => 
      logger.debug(message, { ...defaultContext, ...context, contextName }),
    
    info: (message: string, context?: Record<string, any>) => 
      logger.info(message, { ...defaultContext, ...context, contextName }),
    
    warn: (message: string, context?: Record<string, any>, error?: Error | unknown) => 
      $1?.$2(message, { ...defaultContext, ...context, contextName }, error),
    
    error: (message: string, context?: Record<string, any>, error?: Error | unknown) => 
      $1?.$2(message, { ...defaultContext, ...context, contextName }, error),
  };
}

/**
 * API route middleware for logging requests and responses
 */
export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    // Log the request
    logger.logRequest(req);
    
    try {
      // Execute the handler
      const response = await handler(req);
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Log the response
      logger.logResponse(req, response, responseTime);
      
      return response;
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Log the error
      logger.error(
        `API Error: ${req.method} ${new URL(req.url).pathname}`,
        { responseTime: `${responseTime}ms` },
        error
      );
      
      // Return error response
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
