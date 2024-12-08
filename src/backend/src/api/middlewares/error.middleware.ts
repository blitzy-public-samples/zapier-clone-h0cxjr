/**
 * @fileoverview Express middleware for handling errors in the backend application
 * Addresses requirements:
 * 1. Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 2. Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 * 
 * Human Tasks:
 * 1. Configure error monitoring service in production environment
 * 2. Set up error alerting thresholds and notification channels
 * 3. Review and adjust error sampling rates for production
 * 4. Ensure proper error tracking integration (e.g., Sentry, Rollbar)
 */

// winston v3.8.2
import { Request, Response, NextFunction } from 'express';
import { handleError } from '../../utils/error.util';
import { createLogger } from '../../config/logger.config';
import { logError } from '../../utils/logger.util';

/**
 * Interface for custom error with additional properties
 */
interface CustomError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Express middleware for handling errors in the application.
 * Logs the error and sends a standardized error response to the client.
 * Addresses requirements: Error Handling Configuration and Logging Configuration
 * 
 * @param err - Error object thrown in the application
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const errorMiddleware = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Create logger instance
  const logger = createLogger();

  // Default error values
  const defaultErrorCode = 'INTERNAL_SERVER_ERROR';
  const defaultStatus = 500;
  const defaultMessage = 'An unexpected error occurred';

  // Extract error details
  const errorCode = (err as CustomError).code || defaultErrorCode;
  const status = (err as CustomError).status || defaultStatus;
  const message = err.message || defaultMessage;
  const details = (err as CustomError).details || {};

  // Prepare error metadata
  const errorMetadata = {
    errorCode,
    status,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details,
    timestamp: new Date().toISOString()
  };

  // Log the error with full context
  logError(errorCode, message, errorMetadata);

  // Handle the error using the error utility
  handleError(err, false);

  // Send error response to client
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      ...(Object.keys(details).length > 0 && { details })
    }
  };

  // Log additional debug information in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Error Middleware - Full Error Context', {
      error: err,
      request: {
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body
      }
    });
  }

  // Send the error response
  res.status(status).json(errorResponse);
};

export default errorMiddleware;