/**
 * Human Tasks:
 * 1. Configure log rotation settings in production environment
 * 2. Set up log aggregation service (e.g., ELK Stack, DataDog) in production
 * 3. Define log retention policies based on environment
 * 4. Configure log monitoring and alerting thresholds
 */

// winston v3.8.2
import winston from 'winston';
import { InternalServerError } from '../constants/error.constants';

// Global logger level from environment or default to 'info'
const LOG_LEVEL = process.env.LOGGER_LEVEL || 'info';

/**
 * Creates and configures a Winston logger instance with specified transports and formats.
 * Addresses requirement: Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 */
export const createLogger = (): winston.Logger => {
  // Define custom format for structured logging
  const customFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.json()
  );

  // Configure transports based on environment
  const transports: winston.transport[] = [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ];

  // Add file transports in production
  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
      })
    );
  }

  // Create and return the logger instance
  return winston.createLogger({
    level: LOG_LEVEL,
    format: customFormat,
    transports,
    // Exit on error: false to prevent process crash on logging errors
    exitOnError: false
  });
};

/**
 * Logs an error message with the specified error code and additional metadata.
 * Addresses requirement: Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 */
export const logError = (
  errorCode: string = InternalServerError,
  message: string,
  metadata: Record<string, any> = {}
): void => {
  const logger = createLogger();
  logger.error(message, {
    errorCode,
    timestamp: new Date().toISOString(),
    ...metadata,
    // Include request context if available
    requestId: global.requestContext?.requestId,
    userId: global.requestContext?.userId,
    environment: process.env.NODE_ENV
  });
};

/**
 * Logs an informational message with optional metadata.
 * Addresses requirement: Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 */
export const logInfo = (
  message: string,
  metadata: Record<string, any> = {}
): void => {
  const logger = createLogger();
  logger.info(message, {
    timestamp: new Date().toISOString(),
    ...metadata,
    // Include request context if available
    requestId: global.requestContext?.requestId,
    userId: global.requestContext?.userId,
    environment: process.env.NODE_ENV
  });
};