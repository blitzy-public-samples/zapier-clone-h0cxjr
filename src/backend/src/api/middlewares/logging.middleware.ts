/**
 * Human Tasks:
 * 1. Verify log aggregation service integration is properly configured in production
 * 2. Review and adjust log retention policies based on environment requirements
 * 3. Configure monitoring alerts for critical error thresholds
 * 4. Ensure proper log rotation settings are in place
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { logInfo, logError } from '../../utils/logger.util';
import { ERROR_CODES } from '../../constants/error.constants';

/**
 * Middleware for logging HTTP requests and responses.
 * Addresses requirement: Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Capture original request details before any modifications
  const requestMetadata = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.headers['x-request-id'] || req.headers['x-correlation-id'],
    userId: (req as any).user?.id, // If user is authenticated
    params: req.params,
    query: req.query,
    // Exclude sensitive data from body logging
    body: sanitizeRequestBody(req.body)
  };

  // Log incoming request
  logInfo('Incoming HTTP request', requestMetadata);

  // Capture response using response event listeners
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  let responseBody: any;

  // Override send method to capture response body
  res.send = function (body: any): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Override json method to capture response body
  res.json = function (body: any): Response {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Listen for response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const responseMetadata = {
      statusCode: res.statusCode,
      duration,
      responseSize: res.get('content-length'),
      ...requestMetadata
    };

    // Log response based on status code
    if (res.statusCode >= 400) {
      // For error responses, include sanitized response body
      const errorMetadata = {
        ...responseMetadata,
        error: sanitizeResponseBody(responseBody)
      };

      logError(
        res.statusCode >= 500 ? ERROR_CODES.InternalServerError : 'HTTP_ERROR',
        `HTTP request failed with status ${res.statusCode}`,
        errorMetadata
      );
    } else {
      logInfo('HTTP request completed successfully', responseMetadata);
    }
  });

  // Handle errors in the middleware
  res.on('error', (error: Error) => {
    logError(
      ERROR_CODES.InternalServerError,
      'Error processing HTTP request',
      {
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        ...requestMetadata
      }
    );
  });

  // Restore original methods
  res.on('close', () => {
    res.send = originalSend;
    res.json = originalJson;
    res.end = originalEnd;
  });

  next();
};

/**
 * Sanitizes request body to remove sensitive information before logging
 * @param body - Request body to sanitize
 * @returns Sanitized body object
 */
function sanitizeRequestBody(body: any): any {
  if (!body) return body;

  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Sanitizes response body to remove sensitive information before logging
 * @param body - Response body to sanitize
 * @returns Sanitized body object or truncated string
 */
function sanitizeResponseBody(body: any): any {
  if (!body) return body;

  // If body is a string, truncate if too long
  if (typeof body === 'string') {
    return body.length > 1000 ? `${body.substring(0, 1000)}...` : body;
  }

  // If body is an object, sanitize sensitive fields
  if (typeof body === 'object') {
    const sensitiveFields = ['token', 'secret', 'password', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  return body;
}

export default loggingMiddleware;