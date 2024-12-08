/**
 * @fileoverview Rate limiting middleware to prevent API abuse
 * Addresses requirement: Rate Limiting from Technical Specification/API Design/Rate Limiting
 * 
 * Human Tasks:
 * 1. Review and adjust rate limiting thresholds based on production load testing results
 * 2. Configure monitoring alerts for rate limit violations
 * 3. Set up rate limit metrics collection for capacity planning
 * 4. Ensure Redis is configured if using distributed rate limiting in production
 */

// express-rate-limit v6.7.0
import rateLimit from 'express-rate-limit';
import { getAppConfig } from '../../config/app.config';
import { handleError } from '../../utils/error.util';
import { logInfo } from '../../utils/logger.util';

/**
 * Creates and configures the rate limiting middleware
 * Addresses requirement: Implements rate limiting to control the frequency of API requests
 * 
 * @returns The configured rate limiting middleware
 */
export const rateLimiterMiddleware = () => {
  try {
    // Get rate limiting configuration from app config
    const config = getAppConfig();
    const { windowMs, maxRequests } = config.security.rateLimiting;

    // Initialize rate limiter with configuration
    const limiter = rateLimit({
      windowMs,
      max: maxRequests,
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: {
        status: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      },
      handler: (req, res) => {
        // Log rate limit violation
        handleError(
          new Error('Rate limit exceeded'),
          false
        );

        res.status(429).json({
          status: 429,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
      },
      skip: (req) => {
        // Skip rate limiting for health check endpoints
        return req.path === '/health' || req.path === '/metrics';
      },
      keyGenerator: (req) => {
        // Use IP address as default key, fallback to a generic key if IP is not available
        return req.ip || req.headers['x-forwarded-for'] || 'unknown';
      }
    });

    // Log rate limiter initialization
    logInfo('Rate limiter middleware initialized', {
      windowMs,
      maxRequests,
      environment: process.env.NODE_ENV
    });

    return limiter;
  } catch (error) {
    // Log error and re-throw
    handleError(error as Error, true);
    throw error; // This ensures the application fails to start if rate limiter cannot be initialized
  }
};