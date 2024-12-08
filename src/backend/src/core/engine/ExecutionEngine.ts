/**
 * @fileoverview Implements the ExecutionEngine class for orchestrating workflow execution
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * Human Tasks:
 * 1. Configure monitoring thresholds for workflow execution metrics
 * 2. Set up alerting for workflow execution failures
 * 3. Review and adjust error handling strategies based on production patterns
 * 4. Configure workflow execution timeouts based on business requirements
 */

import { WorkflowValidator } from './WorkflowValidator';
import { WorkflowOptimizer } from './WorkflowOptimizer';
import { WorkflowCompiler } from './WorkflowCompiler';
import { ExecutionContext } from './ExecutionContext';
import { StepExecutor } from './StepExecutor';
import { logInfo, logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { ExecutionStatus } from '../../types/execution.types';

/**
 * Orchestrates the execution of workflows by integrating validation, optimization,
 * compilation, and step execution.
 * Addresses requirement: Execution Features - Provides functionality for orchestrating workflow execution
 */
export class ExecutionEngine {
  private validator: WorkflowValidator;
  private optimizer: WorkflowOptimizer;
  private compiler: WorkflowCompiler;
  private executionContext: ExecutionContext;
  private stepExecutor: StepExecutor;

  /**
   * Initializes the ExecutionEngine with required dependencies
   * @param validator - WorkflowValidator instance for workflow validation
   * @param optimizer - WorkflowOptimizer instance for workflow optimization
   * @param compiler - WorkflowCompiler instance for workflow compilation
   * @param executionContext - ExecutionContext instance for workflow data management
   * @param stepExecutor - StepExecutor instance for step execution
   */
  constructor(
    validator: WorkflowValidator,
    optimizer: WorkflowOptimizer,
    compiler: WorkflowCompiler,
    executionContext: ExecutionContext,
    stepExecutor: StepExecutor
  ) {
    this.validator = validator;
    this.optimizer = optimizer;
    this.compiler = compiler;
    this.executionContext = executionContext;
    this.stepExecutor = stepExecutor;
  }

  /**
   * Executes a workflow by orchestrating validation, optimization, compilation, and step execution
   * Addresses requirement: Execution Features - Workflow execution orchestration
   * 
   * @param workflowId - Unique identifier of the workflow to execute
   * @returns Result of the workflow execution
   * @throws Error if workflow execution fails
   */
  public async executeWorkflow(workflowId: string): Promise<Record<string, unknown>> {
    try {
      // Log workflow execution start
      logInfo('Starting workflow execution', { workflowId });

      // Step 1: Retrieve workflow data
      const workflowData = await this.executionContext.getWorkflowData(workflowId);
      logInfo('Retrieved workflow data', { workflowId });

      // Step 2: Validate workflow
      await this.validator.validate(workflowData);
      logInfo('Workflow validation completed', { workflowId });

      // Step 3: Optimize workflow
      const optimizedWorkflow = await this.optimizer.optimize(workflowData);
      logInfo('Workflow optimization completed', { workflowId });

      // Step 4: Compile workflow
      const compiledExecution = await this.compiler.compile(optimizedWorkflow);
      logInfo('Workflow compilation completed', { 
        workflowId,
        executionId: compiledExecution.id 
      });

      // Step 5: Execute workflow steps
      const executionData = await this.executionContext.getExecutionData(compiledExecution.id);
      const results: Record<string, unknown>[] = [];

      // Execute each step in the workflow
      for (const step of optimizedWorkflow['nodes'] || []) {
        try {
          const stepResult = await this.stepExecutor.executeStep(step.id, {
            executionId: compiledExecution.id,
            workflowId,
            stepData: step,
            context: executionData.context
          });
          results.push(stepResult);
        } catch (stepError) {
          // Log step execution failure
          logError('Step execution failed', {
            workflowId,
            executionId: compiledExecution.id,
            stepId: step.id,
            error: stepError instanceof Error ? stepError.message : 'Unknown error'
          });

          // Update execution status to failed
          executionData.status = ExecutionStatus.FAILED;
          executionData.context.lastError = {
            message: stepError instanceof Error ? stepError.message : 'Unknown error',
            code: 'STEP_EXECUTION_ERROR',
            timestamp: new Date(),
            nodeId: step.id
          };

          throw stepError;
        }
      }

      // Update execution status to completed
      executionData.status = ExecutionStatus.COMPLETED;
      executionData.completedAt = new Date();

      // Aggregate and return results
      const workflowResult = {
        executionId: compiledExecution.id,
        status: ExecutionStatus.COMPLETED,
        steps: results,
        metadata: {
          startedAt: compiledExecution.startedAt,
          completedAt: executionData.completedAt,
          duration: executionData.completedAt.getTime() - compiledExecution.startedAt.getTime(),
          stepsExecuted: results.length
        }
      };

      logInfo('Workflow execution completed successfully', {
        workflowId,
        executionId: compiledExecution.id,
        duration: workflowResult.metadata.duration
      });

      return workflowResult;
    } catch (error) {
      // Log workflow execution failure
      logError('Workflow execution failed', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Handle the error appropriately
      handleError(error as Error, true);

      // Re-throw the error to be handled by the caller
      throw error;
    }
  }
}