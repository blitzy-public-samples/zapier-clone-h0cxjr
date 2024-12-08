/**
 * @fileoverview Implements the StepExecutor class for executing individual workflow steps
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * Human Tasks:
 * 1. Configure monitoring thresholds for step execution metrics
 * 2. Set up alerting for step execution failures
 * 3. Review and adjust error handling strategies based on production patterns
 * 4. Configure step execution timeouts based on integration requirements
 */

import { ExecutionContext } from './ExecutionContext';
import { WorkflowValidator } from './WorkflowValidator';
import { logInfo, logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { ExecutionStatus } from '../../types/execution.types';

/**
 * Executes individual steps within a workflow, handling errors and logging execution details.
 * Addresses requirement: Execution Features - Provides functionality for executing individual workflow steps
 */
export class StepExecutor {
  private context: ExecutionContext;
  private validator: WorkflowValidator;

  /**
   * Initializes the StepExecutor with required dependencies
   * @param context - ExecutionContext instance for managing execution state
   * @param validator - WorkflowValidator instance for step validation
   */
  constructor(context: ExecutionContext, validator: WorkflowValidator) {
    this.context = context;
    this.validator = validator;
  }

  /**
   * Executes a single step within a workflow
   * Addresses requirement: Execution Features - Step execution and error handling
   * 
   * @param stepId - Unique identifier of the step to execute
   * @param stepData - Data required for step execution
   * @returns Result of the step execution
   * @throws Error if step execution fails
   */
  public async executeStep(stepId: string, stepData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // Log step execution start
      logInfo('Starting step execution', {
        stepId,
        executionId: stepData.executionId,
        workflowId: stepData.workflowId
      });

      // Retrieve execution context data
      const executionData = await this.context.getExecutionData(stepData.executionId as string);

      // Validate step data before execution
      await this.validator.validate({
        id: stepId,
        data: stepData,
        context: executionData
      });

      // Update execution status to running
      executionData.status = ExecutionStatus.RUNNING;
      executionData.context.currentNode = stepId;

      // Execute step logic
      const startTime = Date.now();
      const result = await this.processStep(stepId, stepData, executionData);
      const duration = Date.now() - startTime;

      // Log successful execution
      logInfo('Step execution completed successfully', {
        stepId,
        executionId: stepData.executionId,
        duration,
        status: ExecutionStatus.COMPLETED
      });

      // Return step execution result
      return {
        status: ExecutionStatus.COMPLETED,
        result,
        metadata: {
          stepId,
          duration,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      // Log step execution failure
      logError('Step execution failed', {
        stepId,
        executionId: stepData.executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Handle the error appropriately
      handleError(error as Error, true);

      // Re-throw the error to be handled by the workflow engine
      throw error;
    }
  }

  /**
   * Processes the actual step logic
   * @private
   * @param stepId - Unique identifier of the step
   * @param stepData - Data required for step execution
   * @param executionData - Current execution context
   * @returns Result of the step processing
   */
  private async processStep(
    stepId: string,
    stepData: Record<string, unknown>,
    executionData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Validate step exists in execution context
    if (!executionData.steps || !executionData.steps[stepId]) {
      throw new Error(`Step ${stepId} not found in execution context`);
    }

    // Execute step based on type
    const step = executionData.steps[stepId];
    switch (step.type) {
      case 'integration':
        return this.executeIntegrationStep(step, stepData);
      case 'transformation':
        return this.executeTransformationStep(step, stepData);
      case 'condition':
        return this.executeConditionStep(step, stepData);
      case 'custom':
        return this.executeCustomStep(step, stepData);
      default:
        throw new Error(`Unsupported step type: ${step.type}`);
    }
  }

  /**
   * Executes an integration step
   * @private
   * @param step - Step configuration
   * @param stepData - Step execution data
   */
  private async executeIntegrationStep(
    step: Record<string, unknown>,
    stepData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    logInfo('Executing integration step', { step: step.id, integration: step.integration });
    // Integration step implementation would go here
    return { status: 'completed' };
  }

  /**
   * Executes a transformation step
   * @private
   * @param step - Step configuration
   * @param stepData - Step execution data
   */
  private async executeTransformationStep(
    step: Record<string, unknown>,
    stepData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    logInfo('Executing transformation step', { step: step.id });
    // Transformation step implementation would go here
    return { status: 'completed' };
  }

  /**
   * Executes a condition step
   * @private
   * @param step - Step configuration
   * @param stepData - Step execution data
   */
  private async executeConditionStep(
    step: Record<string, unknown>,
    stepData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    logInfo('Executing condition step', { step: step.id });
    // Condition step implementation would go here
    return { status: 'completed' };
  }

  /**
   * Executes a custom step
   * @private
   * @param step - Step configuration
   * @param stepData - Step execution data
   */
  private async executeCustomStep(
    step: Record<string, unknown>,
    stepData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    logInfo('Executing custom step', { step: step.id });
    // Custom step implementation would go here
    return { status: 'completed' };
  }
}