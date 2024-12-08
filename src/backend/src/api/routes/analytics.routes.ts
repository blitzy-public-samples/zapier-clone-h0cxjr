/**
 * @fileoverview Analytics Routes Implementation
 * This file defines the API routes for analytics-related operations, including
 * retrieving workflow execution metrics and performance statistics.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform)
 *   Implements API routes for retrieving analytics data to support comprehensive
 *   monitoring and optimization tools.
 * 
 * Human Tasks:
 * 1. Configure rate limiting for analytics endpoints based on load requirements
 * 2. Set up monitoring alerts for analytics endpoint performance
 * 3. Review and adjust caching strategies for analytics data
 * 4. Verify proper logging configuration for analytics requests
 */

// express v4.18.2
import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller';
import { validateAnalyticsData } from '../validators/analytics.validator';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';
import errorMiddleware from '../middlewares/error.middleware';
import loggingMiddleware from '../middlewares/logging.middleware';

/**
 * Defines the API routes for analytics-related operations
 * Requirement Addressed: Analytics Platform - Implements API routes for retrieving analytics data
 * 
 * @param router - Express Router instance
 * @returns Router instance configured with analytics routes
 */
const analyticsRoutes = (): Router => {
    const router = Router();

    /**
     * GET /analytics
     * Retrieves analytics data based on specified filters
     * Requires authentication and validates request parameters
     * 
     * Query Parameters:
     * - startDate: Optional date filter for start of analytics period
     * - endDate: Optional date filter for end of analytics period
     * - workflowId: Optional filter for specific workflow
     * - integrationId: Optional filter for specific integration
     * - status: Optional filter for execution status
     * - metrics: Optional JSON string of metric thresholds
     * - limit: Optional limit for number of results (default: 100)
     * - offset: Optional offset for pagination (default: 0)
     */
    router.get(
        '/',
        [
            // Apply authentication middleware
            authMiddleware,
            
            // Apply request validation middleware
            validationMiddleware,
            
            // Apply logging middleware for request/response tracking
            loggingMiddleware,
            
            // Handle analytics data retrieval
            getAnalytics
        ]
    );

    // Attach error handling middleware last
    router.use(errorMiddleware);

    return router;
};

export default analyticsRoutes;