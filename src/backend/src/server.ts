/**
 * @fileoverview Backend server entry point that initializes the Express application,
 * sets up middleware, and starts the server on the configured port.
 * 
 * Human Tasks:
 * 1. Configure environment-specific variables in deployment pipelines
 * 2. Set up monitoring alerts for server health checks
 * 3. Review and adjust rate limiting thresholds based on load testing
 * 4. Verify proper SSL/TLS configuration in production environment
 */

// Third-party imports
import express from 'express'; // v4.18.2
import http from 'http';

// Internal imports
import { initializeApp } from './app';
import { getAppConfig } from './config/app.config';
import { createLogger } from './config/logger.config';

/**
 * Starts the backend server by initializing the Express application and
 * listening on the configured port.
 * Addresses requirements:
 * - Application Initialization from Technical Specification/System Design/Deployment Architecture
 * - Middleware Configuration from Technical Specification/System Design/Monitoring and Observability
 * - API Routing from Technical Specification/API Design
 */
export const startServer = async (): Promise<void> => {
  try {
    // Get application configuration
    const config = getAppConfig();

    // Initialize logger
    const logger = createLogger();

    // Initialize Express application with middleware and routes
    const app = initializeApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Start server on configured port
    server.listen(config.app.port, () => {
      logger.info('Server started successfully', {
        port: config.app.port,
        environment: config.app.environment,
        version: config.app.version,
        apiPrefix: config.app.apiPrefix
      });
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      logger.error('Server error occurred', {
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed successfully');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error && process.env.NODE_ENV !== 'production' 
          ? reason.stack 
          : undefined
      });
      process.exit(1);
    });

  } catch (error) {
    const logger = createLogger();
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error && process.env.NODE_ENV !== 'production' 
        ? error.stack 
        : undefined
    });
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}