/**
 * Human Tasks:
 * 1. Verify log rotation settings are properly configured in production
 * 2. Ensure log aggregation service integration is set up (e.g., ELK Stack, DataDog)
 * 3. Review and adjust log retention policies based on environment requirements
 * 4. Configure monitoring alerts for critical error thresholds
 */

// winston v3.8.2
import { createLogger } from '../config/logger.config';
import { ERROR_CODES } from '../constants/error.constants';
import winston from 'winston';

/**
 * Logs an error message with the specified error code and additional metadata.
 * Addresses requirement: Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * @param errorCode - The standardized error code for the error event
 * @param message - The error message to be logged
 * @param metadata - Additional contextual information to be included in the log
 */
export const logError = (
  errorCode: string = ERROR_CODES.InternalServerError,
  message: string,
  metadata: Record<string, any> = {}
): void => {
  const logger = createLogger();
  
  // Ensure consistent metadata structure
  const enrichedMetadata = {
    errorCode,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    // Include request context if available
    requestId: global.requestContext?.requestId,
    userId: global.requestContext?.userId,
    path: global.requestContext?.path,
    // Merge additional metadata
    ...metadata
  };

  // Log the error with enriched metadata
  logger.error(message, enrichedMetadata);
};

/**
 * Logs an informational message with optional metadata.
 * Addresses requirement: Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 * 
 * @param message - The informational message to be logged
 * @param metadata - Additional contextual information to be included in the log
 */
export const logInfo = (
  message: string,
  metadata: Record<string, any> = {}
): void => {
  const logger = createLogger();
  
  // Ensure consistent metadata structure
  const enrichedMetadata = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    // Include request context if available
    requestId: global.requestContext?.requestId,
    userId: global.requestContext?.userId,
    path: global.requestContext?.path,
    // Merge additional metadata
    ...metadata
  };

  // Log the information with enriched metadata
  logger.info(message, enrichedMetadata);
};