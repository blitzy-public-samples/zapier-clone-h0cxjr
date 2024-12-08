/**
 * Human Tasks:
 * 1. Configure monitoring alerts for health check failures
 * 2. Set up uptime monitoring service integration
 * 3. Define health check thresholds and SLAs
 * 4. Implement integration with infrastructure monitoring tools
 */

// express v4.18.2
import { Request, Response } from 'express';
import { logInfo } from '../../utils/logger.util';
import { createLogger } from '../../config/logger.config';

/**
 * Handles the health check endpoint to verify the application's operational status.
 * Addresses requirement: System Health Monitoring from Technical Specification/System Design/Monitoring and Observability
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const healthCheck = (req: Request, res: Response): void => {
  // Create logger instance for health check monitoring
  const logger = createLogger();

  // Log health check request with request metadata
  logInfo('Health check request received', {
    endpoint: '/health',
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Prepare health check response
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    memory: {
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  };

  // Log successful health check response
  logger.info('Health check completed successfully', {
    ...healthStatus,
    responseTime: process.hrtime()[1] / 1000000 // Convert to milliseconds
  });

  // Send health check response
  res.status(200).json(healthStatus);
};