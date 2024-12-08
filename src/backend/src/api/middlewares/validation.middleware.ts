/**
 * @fileoverview Middleware for validating incoming API requests
 * Addresses requirements:
 * 1. Data Validation from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 2. Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review validation rules for each endpoint to ensure alignment with business requirements
 * 2. Configure validation error monitoring thresholds for production alerts
 * 3. Ensure validation error messages are properly localized
 */

import { Request, Response, NextFunction } from 'express';
import { validateWorkflow, validateIntegration } from '../../utils/validation.util';
import { validateAuthToken } from '../validators/auth.validator';
import { validateExecution } from '../validators/execution.validator';
import { validateIntegrationConfig } from '../validators/integration.validator';
import { validateWorkflowData } from '../validators/workflow.validator';
import errorMiddleware from './error.middleware';

/**
 * Express middleware for validating incoming API requests
 * Ensures that request data adheres to predefined constraints
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const validationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Determine the validation type based on the request path and method
    const path = req.path.toLowerCase();
    const method = req.method.toUpperCase();

    // Validate authentication token for protected routes
    if (path !== '/auth/login' && path !== '/auth/register') {
      const authToken = req.headers.authorization;
      if (!authToken) {
        throw new Error('Authentication token is required');
      }
      validateAuthToken({ token: authToken, expiresAt: new Date() });
    }

    // Validate request body based on the endpoint
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      if (!req.body) {
        throw new Error('Request body is required');
      }

      // Workflow-related validations
      if (path.includes('/workflow')) {
        validateWorkflowData(req.body);
        validateWorkflow(req.body);
      }

      // Integration-related validations
      else if (path.includes('/integration')) {
        validateIntegrationConfig(req.body);
        validateIntegration(req.body);
      }

      // Execution-related validations
      else if (path.includes('/execution')) {
        validateExecution(req.body);
      }
    }

    // Validate query parameters if present
    if (Object.keys(req.query).length > 0) {
      // Validate pagination parameters
      if (req.query.page) {
        const page = parseInt(req.query.page as string);
        if (isNaN(page) || page < 1) {
          throw new Error('Invalid page number');
        }
      }

      if (req.query.limit) {
        const limit = parseInt(req.query.limit as string);
        if (isNaN(limit) || limit < 1 || limit > 100) {
          throw new Error('Invalid limit value. Must be between 1 and 100');
        }
      }

      // Validate sorting parameters
      if (req.query.sortBy) {
        const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'status'];
        if (!allowedSortFields.includes(req.query.sortBy as string)) {
          throw new Error(`Invalid sort field. Must be one of: ${allowedSortFields.join(', ')}`);
        }
      }

      if (req.query.sortOrder) {
        const sortOrder = (req.query.sortOrder as string).toUpperCase();
        if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
          throw new Error('Invalid sort order. Must be ASC or DESC');
        }
      }

      // Validate filter parameters
      if (req.query.status) {
        const status = req.query.status as string;
        if (path.includes('/workflow')) {
          const validStatuses = ['Draft', 'Active', 'Paused', 'Completed', 'Archived'];
          if (!validStatuses.includes(status)) {
            throw new Error(`Invalid workflow status. Must be one of: ${validStatuses.join(', ')}`);
          }
        } else if (path.includes('/execution')) {
          const validStatuses = ['Pending', 'Running', 'Completed', 'Failed', 'Cancelled'];
          if (!validStatuses.includes(status)) {
            throw new Error(`Invalid execution status. Must be one of: ${validStatuses.join(', ')}`);
          }
        }
      }
    }

    // If all validations pass, proceed to the next middleware
    next();
  } catch (error) {
    // Pass validation errors to the error middleware
    errorMiddleware(error, req, res, next);
  }
};

export default validationMiddleware;