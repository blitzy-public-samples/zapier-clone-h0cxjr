/**
 * Human Tasks:
 * 1. Configure monitoring alerts for health check failures
 * 2. Set up uptime monitoring service integration
 * 3. Define health check thresholds and SLAs
 * 4. Verify rate limiting thresholds align with monitoring requirements
 */

// express v4.18.2
import { Router } from 'express';

// Import controllers and middlewares using relative paths
import { healthCheck } from '../controllers/health.controller';
import authMiddleware from '../middlewares/auth.middleware';
import loggingMiddleware from '../middlewares/logging.middleware';
import { rateLimiterMiddleware } from '../middlewares/rateLimiter.middleware';

/**
 * Router instance for health check endpoints
 * Addresses requirement: System Health Monitoring from Technical Specification/System Design/Monitoring and Observability
 */
const healthRoutes = Router();

/**
 * Health check endpoint configuration
 * Implements health check routes to monitor the operational status and readiness of the backend application
 * 
 * Route is protected by:
 * - Authentication middleware to ensure secure access
 * - Logging middleware for request/response tracking
 * - Rate limiting to prevent abuse
 */
healthRoutes.get(
  '/health',
  loggingMiddleware,
  rateLimiterMiddleware(),
  authMiddleware,
  healthCheck
);

/**
 * Public health check endpoint for basic availability monitoring
 * This endpoint is not protected by authentication to allow external monitoring services
 * Still includes logging and rate limiting for security
 */
healthRoutes.get(
  '/health/public',
  loggingMiddleware,
  rateLimiterMiddleware(),
  healthCheck
);

export default healthRoutes;