/**
 * @fileoverview Analytics Controller Implementation
 * This file implements the controller for handling analytics-related API endpoints.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform)
 *   Implements API endpoints for retrieving analytics data to support comprehensive
 *   monitoring and optimization tools.
 * 
 * Human Tasks:
 * 1. Configure analytics data retention policies in production environment
 * 2. Set up monitoring alerts for analytics endpoint performance
 * 3. Review and adjust rate limiting for analytics endpoints
 * 4. Verify proper logging configuration for analytics requests
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { validateAnalyticsData } from '../validators/analytics.validator';
import { retrieveAnalytics } from '../../services/analytics.service';
import errorMiddleware from '../middlewares/error.middleware';
import loggingMiddleware from '../middlewares/logging.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { ERROR_CODES } from '../../constants/error.constants';

/**
 * Handles GET requests to retrieve analytics data based on specified filters
 * Requirement Addressed: Analytics Platform - Data Retrieval
 * 
 * @param req - Express request object containing query parameters for filtering
 * @param res - Express response object
 * @param next - Express next function for error handling
 */
export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Apply middleware for authentication, logging, and error handling
    await authMiddleware(req, res, async () => {
      loggingMiddleware(req, res, async () => {
        try {
          // Extract filter parameters from query
          const filters = {
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            workflowId: req.query.workflowId as string,
            integrationId: req.query.integrationId as string,
            executionStatus: req.query.status as string,
            metricThresholds: req.query.metrics ? 
              JSON.parse(req.query.metrics as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
          };

          // Validate the analytics request data
          validateAnalyticsData({
            workflow: {
              id: filters.workflowId,
              name: 'temp',
              status: 'Active',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            integration: {
              id: filters.integrationId,
              name: 'temp',
              protocol: 'REST',
              retryCount: 0,
              timeout: 5000
            },
            connector: {
              id: 'temp',
              name: 'temp',
              protocol: 'REST'
            },
            execution: {
              id: 'temp',
              workflowId: filters.workflowId,
              status: 'Completed',
              context: { variables: {} },
              startedAt: new Date(),
              completedAt: null
            },
            timestamp: new Date(),
            metrics: filters.metricThresholds || {}
          });

          // Retrieve analytics data using the service
          const analyticsData = await retrieveAnalytics(filters);

          // Send successful response
          res.status(200).json({
            success: true,
            data: analyticsData,
            metadata: {
              count: analyticsData.length,
              filters: filters
            }
          });
        } catch (error) {
          // Handle errors using the error middleware
          errorMiddleware(error, req, res, next);
        }
      });
    });
  } catch (error) {
    // Handle authentication errors
    const err = new Error(
      `${ERROR_CODES.InternalServerError}: Failed to retrieve analytics data - ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    errorMiddleware(err, req, res, next);
  }
};