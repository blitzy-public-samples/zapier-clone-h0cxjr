/**
 * @fileoverview Main entry point for initializing and configuring the Express application.
 * Addresses requirements:
 * - Application Initialization from Technical Specification/System Design/Deployment Architecture
 * - Middleware Configuration from Technical Specification/System Design/Monitoring and Observability
 * - API Routing from Technical Specification/API Design
 * 
 * Human Tasks:
 * 1. Configure environment-specific variables in deployment pipelines
 * 2. Set up monitoring alerts for application health checks
 * 3. Review and adjust rate limiting thresholds based on load testing
 * 4. Verify proper SSL/TLS configuration in production environment
 */

// Third-party imports
import express, { Express } from 'express'; // v4.18.2
import bodyParser from 'body-parser'; // v1.20.2
import cors from 'cors'; // v2.8.5

// Internal imports
import { getAppConfig } from './config/app.config';
import healthRoutes from './api/routes/health.routes';
import authRoutes from './api/routes/auth.routes';
import analyticsRoutes from './api/routes/analytics.routes';
import integrationRoutes from './api/routes/integration.routes';
import errorMiddleware from './api/middlewares/error.middleware';
import loggingMiddleware from './api/middlewares/logging.middleware';
import { rateLimiterMiddleware } from './api/middlewares/rateLimiter.middleware';
import validationMiddleware from './api/middlewares/validation.middleware';
import authMiddleware from './api/middlewares/auth.middleware';

/**
 * Initializes and configures the Express application with middleware, routes, and error handling.
 * Addresses requirement: Application Initialization - Initializes the Express application with middleware, routes, and error handling.
 * 
 * @returns The configured Express application instance
 */
export const initializeApp = (): Express => {
  // Create Express application instance
  const app = express();

  // Get application configuration
  const config = getAppConfig();

  // Configure global middleware
  // Parse JSON request bodies
  app.use(bodyParser.json({ limit: '10mb' }));
  
  // Parse URL-encoded request bodies
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Configure CORS
  app.use(cors({
    origin: config.app.corsOrigins,
    credentials: config.security.cors.credentials,
    methods: config.security.cors.methods
  }));

  // Trust proxy if configured (important for rate limiting behind reverse proxy)
  if (config.app.trustProxy) {
    app.set('trust proxy', 1);
  }

  // Apply global rate limiting
  app.use(rateLimiterMiddleware());

  // Apply logging middleware for all requests
  app.use(loggingMiddleware);

  // Apply validation middleware for all requests
  app.use(validationMiddleware);

  // Configure API routes with base path
  const apiBasePath = config.app.apiPrefix;

  // Health check routes (some endpoints public, some protected)
  app.use(`${apiBasePath}/health`, healthRoutes);

  // Protected routes requiring authentication
  app.use(`${apiBasePath}/auth`, authRoutes);
  app.use(`${apiBasePath}/analytics`, analyticsRoutes());
  app.use(`${apiBasePath}/integrations`, integrationRoutes);

  // Global error handling middleware - must be last
  app.use(errorMiddleware);

  // Return the configured application
  return app;
};