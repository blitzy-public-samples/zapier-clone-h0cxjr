/**
 * @fileoverview Utility functions for handling and logging errors
 * Addresses requirements:
 * 1. Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 2. Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 * 
 * Human Tasks:
 * 1. Ensure error monitoring service is configured in production environment
 * 2. Set up error alerting thresholds and notification channels
 * 3. Configure error tracking integration (e.g., Sentry, Rollbar)
 * 4. Review and adjust error sampling rates for production
 */

// winston v3.8.2
import { Logger } from 'winston';
import { ERROR_CODES } from '../constants/error.constants';
import { createLogger } from '../config/logger.config';

/**
 * Interface for custom error with code property
 */
interface CustomError extends Error {
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Handles an error by logging it and optionally throwing it further
 * Addresses requirement: Error Handling Configuration
 * 
 * @param error - The error object to handle
 * @param shouldThrow - Whether to throw the error after logging
 */
export const handleError = (error: Error | CustomError, shouldThrow: boolean = false): void => {
  const logger: Logger = createLogger();
  
  // Determine error code
  const errorCode = (error as CustomError).code || ERROR_CODES.InternalServerError;
  
  // Prepare error metadata
  const metadata = {
    errorCode,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    details: (error as CustomError).details || {},
    requestId: global.requestContext?.requestId,
    userId: global.requestContext?.userId,
    path: global.requestContext?.path,
    environment: process.env.NODE_ENV
  };

  // Log the error with full context
  logger.error(error.message, metadata);

  // Emit error event in production for monitoring
  if (process.env.NODE_ENV === 'production' && global.errorEmitter) {
    global.errorEmitter.emit('error', {
      message: error.message,
      metadata
    });
  }

  // Optionally rethrow the error
  if (shouldThrow) {
    throw error;
  }
};

/**
 * Logs a validation error with standardized error codes and metadata
 * Addresses requirement: Logging Configuration
 * 
 * @param message - The validation error message
 * @param metadata - Additional metadata to include in the log
 */
export const logValidationError = (
  message: string,
  metadata: Record<string, unknown> = {}
): void => {
  const logger: Logger = createLogger();

  // Prepare validation error metadata
  const validationMetadata = {
    errorCode: ERROR_CODES.ValidationError,
    timestamp: new Date().toISOString(),
    ...metadata,
    requestId: global.requestContext?.requestId,
    userId: global.requestContext?.userId,
    path: global.requestContext?.path,
    environment: process.env.NODE_ENV
  };

  // Log the validation error
  logger.error(`Validation Error: ${message}`, validationMetadata);

  // Emit validation error event in production for monitoring
  if (process.env.NODE_ENV === 'production' && global.errorEmitter) {
    global.errorEmitter.emit('validationError', {
      message,
      metadata: validationMetadata
    });
  }
};