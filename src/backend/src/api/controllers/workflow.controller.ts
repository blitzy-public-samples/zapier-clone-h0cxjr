/**
 * @fileoverview Controller for handling API requests related to workflows
 * Addresses requirements:
 * - Workflow Management from Technical Specification/Core Features and Functionalities/Workflow Creation
 * - Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * - Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 * 
 * Human Tasks:
 * 1. Configure API rate limiting based on environment requirements
 * 2. Set up monitoring alerts for workflow operation failures
 * 3. Review and adjust error handling strategies based on production patterns
 * 4. Configure request timeout settings based on workflow complexity
 */

import { Request, Response } from 'express';
import { 
  createWorkflow,
  executeWorkflow,
  getWorkflowVersion 
} from '../../services/workflow.service';
import { validateWorkflowData } from '../validators/workflow.validator';
import { handleError } from '../../utils/error.util';
import { logInfo } from '../../utils/logger.util';

/**
 * Handles the API request to create a new workflow
 * Addresses requirement: Workflow Management - Implements workflow creation functionality
 * 
 * @param req - Express request object containing workflow data
 * @param res - Express response object
 */
export const createWorkflowHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the start of workflow creation
    logInfo('Starting workflow creation request', {
      requestId: req.id,
      workflowName: req.body.name
    });

    // Validate the workflow data
    validateWorkflowData(req.body);

    // Create the workflow
    const createdWorkflow = await createWorkflow(req.body);

    // Log successful creation
    logInfo('Workflow created successfully', {
      requestId: req.id,
      workflowId: createdWorkflow.id,
      workflowName: createdWorkflow.name
    });

    // Send success response
    res.status(201).json({
      success: true,
      data: createdWorkflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    // Handle and log any errors
    handleError(error as Error, false);
    
    // Send error response
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workflow',
      code: error.code || 'WORKFLOW_CREATION_ERROR'
    });
  }
};

/**
 * Handles the API request to execute a workflow
 * Addresses requirement: Workflow Management - Implements workflow execution functionality
 * 
 * @param req - Express request object containing workflow ID
 * @param res - Express response object
 */
export const executeWorkflowHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workflowId } = req.params;

    // Log the start of workflow execution
    logInfo('Starting workflow execution request', {
      requestId: req.id,
      workflowId
    });

    // Execute the workflow
    const executionResult = await executeWorkflow(workflowId);

    // Log successful execution
    logInfo('Workflow executed successfully', {
      requestId: req.id,
      workflowId,
      executionId: executionResult.executionId
    });

    // Send success response
    res.status(200).json({
      success: true,
      data: executionResult,
      message: 'Workflow executed successfully'
    });
  } catch (error) {
    // Handle and log any errors
    handleError(error as Error, false);
    
    // Send error response
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute workflow',
      code: error.code || 'WORKFLOW_EXECUTION_ERROR'
    });
  }
};

/**
 * Handles the API request to retrieve a specific workflow version
 * Addresses requirement: Workflow Management - Implements workflow versioning functionality
 * 
 * @param req - Express request object containing version ID
 * @param res - Express response object
 */
export const getWorkflowVersionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { versionId } = req.params;

    // Log the start of version retrieval
    logInfo('Starting workflow version retrieval request', {
      requestId: req.id,
      versionId
    });

    // Get the workflow version
    const versionDetails = await getWorkflowVersion(versionId);

    // Check if version exists
    if (!versionDetails) {
      throw new Error(`Workflow version not found with ID: ${versionId}`);
    }

    // Log successful retrieval
    logInfo('Workflow version retrieved successfully', {
      requestId: req.id,
      versionId,
      workflowId: versionDetails.workflowId
    });

    // Send success response
    res.status(200).json({
      success: true,
      data: versionDetails,
      message: 'Workflow version retrieved successfully'
    });
  } catch (error) {
    // Handle and log any errors
    handleError(error as Error, false);
    
    // Send error response
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve workflow version',
      code: error.code || 'WORKFLOW_VERSION_ERROR'
    });
  }
};