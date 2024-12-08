/**
 * @fileoverview Controller for handling execution-related API endpoints
 * Addresses requirements:
 * - Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * - Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * - Authentication Management from Technical Specification/Core Features and Functionalities/Integration Capabilities
 * - Rate Limiting from Technical Specification/API Design/Rate Limiting
 * 
 * Human Tasks:
 * 1. Configure monitoring thresholds for execution metrics
 * 2. Set up alerting for execution failures
 * 3. Review and adjust error recovery strategies
 * 4. Configure execution timeouts based on business requirements
 */

import { Request, Response, NextFunction } from 'express'; // v4.18.2
import { validateExecution } from '../validators/execution.validator';
import { startExecution, getExecutionStatus } from '../../services/execution.service';
import authMiddleware from '../middlewares/auth.middleware';
import errorMiddleware from '../middlewares/error.middleware';
import loggingMiddleware from '../middlewares/logging.middleware';
import { rateLimiterMiddleware } from '../middlewares/rateLimiter.middleware';
import { logInfo, logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { ERROR_CODES } from '../../constants/error.constants';

/**
 * Handles the initiation of a new workflow execution
 * Addresses requirement: Execution Features - Asynchronous processing and real-time monitoring
 * 
 * @param req - Express request object containing workflow execution details
 * @param res - Express response object
 * @param next - Express next function
 */
export const initiateExecution = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log execution initiation request
    logInfo('Initiating workflow execution', {
      workflowId: req.body.workflowId,
      userId: (req as any).user?.id
    });

    // Validate the execution request
    validateExecution({
      id: crypto.randomUUID(),
      workflowId: req.body.workflowId,
      status: 'Pending',
      context: {
        variables: req.body.variables || {},
        metadata: {
          initiatedBy: (req as any).user?.id,
          source: 'API',
          timestamp: new Date().toISOString()
        }
      },
      startedAt: new Date(),
      completedAt: null
    });

    // Start the workflow execution
    const result = await startExecution(req.body.workflowId);

    // Log successful execution initiation
    logInfo('Workflow execution initiated successfully', {
      workflowId: req.body.workflowId,
      executionId: result.executionId
    });

    // Send success response
    res.status(202).json({
      success: true,
      data: result,
      message: 'Workflow execution initiated successfully'
    });
  } catch (error) {
    // Log execution initiation failure
    logError(
      ERROR_CODES.InternalServerError,
      'Failed to initiate workflow execution',
      {
        workflowId: req.body.workflowId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    // Pass error to error handling middleware
    next(error);
  }
};

/**
 * Retrieves the current status of a workflow execution
 * Addresses requirement: Execution Features - Real-time monitoring
 * 
 * @param req - Express request object containing execution ID
 * @param res - Express response object
 * @param next - Express next function
 */
export const fetchExecutionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const executionId = req.params.executionId;

    // Log status retrieval request
    logInfo('Retrieving execution status', {
      executionId,
      userId: (req as any).user?.id
    });

    // Validate execution ID format
    if (!executionId || typeof executionId !== 'string') {
      throw new Error(`${ERROR_CODES.ValidationError}: Invalid execution ID`);
    }

    // Get execution status
    const status = await getExecutionStatus(executionId);

    // Log successful status retrieval
    logInfo('Execution status retrieved successfully', {
      executionId,
      status: status.status
    });

    // Send success response
    res.status(200).json({
      success: true,
      data: status,
      message: 'Execution status retrieved successfully'
    });
  } catch (error) {
    // Log status retrieval failure
    logError(
      ERROR_CODES.InternalServerError,
      'Failed to retrieve execution status',
      {
        executionId: req.params.executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    // Pass error to error handling middleware
    next(error);
  }
};