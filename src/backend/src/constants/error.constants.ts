/**
 * @fileoverview Error constants and logging utilities for consistent error handling across the backend
 * Addresses requirement: Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Configure centralized logging system (e.g., ELK Stack, DataDog) for production environment
 * 2. Set up appropriate log retention policies based on environment
 * 3. Configure log aggregation and alerting thresholds
 * 4. Ensure proper log rotation and archival strategies are in place
 */

/**
 * Standardized error codes used across the application
 * These codes ensure consistent error reporting and categorization
 */
export const ERROR_CODES = {
  ValidationError: 'VALIDATION_ERROR',
  AuthenticationError: 'AUTHENTICATION_ERROR',
  AuthorizationError: 'AUTHORIZATION_ERROR',
  ResourceNotFoundError: 'RESOURCE_NOT_FOUND_ERROR',
  RateLimitExceededError: 'RATE_LIMIT_EXCEEDED_ERROR',
  InternalServerError: 'INTERNAL_SERVER_ERROR'
} as const;

/**
 * Interface for standardized error metadata
 */
interface ErrorMetadata {
  code: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  path?: string;
  details?: Record<string, unknown>;
}

/**
 * Interface for structured log entry
 */
interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  metadata: ErrorMetadata;
  stack?: string;
}

/**
 * Logs error messages with appropriate metadata and severity levels
 * @param error - Error object or error message to be logged
 */
export const logError = (error: Error | string): void => {
  const timestamp = new Date().toISOString();
  let logEntry: LogEntry;

  if (error instanceof Error) {
    // Extract error code from custom errors if available
    const errorCode = (error as any).code || ERROR_CODES.InternalServerError;
    
    logEntry = {
      level: 'error',
      message: error.message,
      metadata: {
        code: errorCode,
        timestamp,
        // Include stack trace in non-production environments
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        // Additional context can be added here from error object
        details: (error as any).details
      },
      stack: error.stack
    };
  } else {
    // Handle string error messages
    logEntry = {
      level: 'error',
      message: error,
      metadata: {
        code: ERROR_CODES.InternalServerError,
        timestamp
      }
    };
  }

  // Add request context if available
  if (global.requestContext) {
    logEntry.metadata.requestId = global.requestContext.requestId;
    logEntry.metadata.userId = global.requestContext.userId;
    logEntry.metadata.path = global.requestContext.path;
  }

  // Log based on environment
  if (process.env.NODE_ENV === 'production') {
    // In production, send to centralized logging system
    // This should be configured based on the chosen logging service
    console.error(JSON.stringify(logEntry));
  } else {
    // In development, provide more detailed console output
    console.error('Error Log Entry:', {
      ...logEntry,
      timestamp: new Date(timestamp).toLocaleString()
    });
  }

  // Emit error event for potential error monitoring systems
  if (process.env.NODE_ENV === 'production' && global.errorEmitter) {
    global.errorEmitter.emit('error', logEntry);
  }
};