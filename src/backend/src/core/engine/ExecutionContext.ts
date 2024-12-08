/**
 * @fileoverview Implements the ExecutionContext class for managing workflow execution context
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * Human Tasks:
 * 1. Configure database connection settings for workflow data storage
 * 2. Set up caching strategy for workflow data retrieval
 * 3. Review and adjust error handling thresholds
 * 4. Configure monitoring for execution context operations
 */

import { validate } from './WorkflowValidator';
import { ExecutionStatus } from '../../types/execution.types';
import { logInfo, logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { IWorkflow } from '../../interfaces/IWorkflow';
import { IExecution } from '../../interfaces/IExecution';

/**
 * Manages the execution context of workflows, including workflow data, execution data, and state management.
 * Addresses requirement: Execution Features - Provides functionality for managing execution context
 */
export class ExecutionContext {
  private validator: WorkflowValidator;
  private workflowCache: Map<string, IWorkflow>;
  private executionCache: Map<string, IExecution>;

  /**
   * Initializes the ExecutionContext with a WorkflowValidator instance
   * @param validator - Instance of WorkflowValidator for workflow validation
   */
  constructor(validator: WorkflowValidator) {
    this.validator = validator;
    this.workflowCache = new Map<string, IWorkflow>();
    this.executionCache = new Map<string, IExecution>();
  }

  /**
   * Retrieves workflow data for the given workflow ID
   * Addresses requirement: Execution Features - Workflow data management
   * 
   * @param workflowId - Unique identifier of the workflow
   * @returns The workflow data associated with the given ID
   * @throws Error if workflow validation fails or workflow is not found
   */
  public async getWorkflowData(workflowId: string): Promise<IWorkflow> {
    try {
      logInfo('Retrieving workflow data', { workflowId });

      // Check cache first
      if (this.workflowCache.has(workflowId)) {
        const cachedWorkflow = this.workflowCache.get(workflowId);
        if (cachedWorkflow) {
          logInfo('Retrieved workflow from cache', { workflowId });
          return cachedWorkflow;
        }
      }

      // Fetch workflow from database
      const workflow = await this.fetchWorkflowFromDatabase(workflowId);
      
      // Validate workflow
      await this.validator.validate(workflow);

      // Cache the workflow
      this.workflowCache.set(workflowId, workflow);

      logInfo('Successfully retrieved workflow data', { workflowId });
      return workflow;
    } catch (error) {
      logError('Failed to retrieve workflow data', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      handleError(error as Error, true);
      throw error;
    }
  }

  /**
   * Retrieves execution data for the given execution ID
   * Addresses requirement: Execution Features - Execution data management
   * 
   * @param executionId - Unique identifier of the execution
   * @returns The execution data associated with the given ID
   * @throws Error if execution is not found
   */
  public async getExecutionData(executionId: string): Promise<IExecution> {
    try {
      logInfo('Retrieving execution data', { executionId });

      // Check cache first
      if (this.executionCache.has(executionId)) {
        const cachedExecution = this.executionCache.get(executionId);
        if (cachedExecution) {
          logInfo('Retrieved execution from cache', { executionId });
          return cachedExecution;
        }
      }

      // Fetch execution from database
      const execution = await this.fetchExecutionFromDatabase(executionId);

      // Cache the execution
      this.executionCache.set(executionId, execution);

      logInfo('Successfully retrieved execution data', { executionId });
      return execution;
    } catch (error) {
      logError('Failed to retrieve execution data', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      handleError(error as Error, true);
      throw error;
    }
  }

  /**
   * Fetches workflow data from the database
   * @private
   * @param workflowId - Unique identifier of the workflow
   * @returns Promise resolving to the workflow data
   */
  private async fetchWorkflowFromDatabase(workflowId: string): Promise<IWorkflow> {
    // Note: Actual database implementation would be injected via dependency injection
    // This is a placeholder that should be replaced with actual database access
    throw new Error('Database implementation required');
  }

  /**
   * Fetches execution data from the database
   * @private
   * @param executionId - Unique identifier of the execution
   * @returns Promise resolving to the execution data
   */
  private async fetchExecutionFromDatabase(executionId: string): Promise<IExecution> {
    // Note: Actual database implementation would be injected via dependency injection
    // This is a placeholder that should be replaced with actual database access
    throw new Error('Database implementation required');
  }
}