/**
 * @fileoverview Implements the WorkflowCompiler class for compiling workflow definitions into executable formats
 * Addresses requirement: Workflow Compilation from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review and adjust compilation performance metrics based on production usage
 * 2. Configure monitoring for compilation failures and performance degradation
 * 3. Set up alerts for compilation errors that may require human intervention
 * 4. Verify error handling and logging configuration in production environment
 */

import { ExecutionContext } from './ExecutionContext';
import { WorkflowValidator } from './WorkflowValidator';
import { WorkflowOptimizer } from './WorkflowOptimizer';
import { IWorkflow } from '../../interfaces/IWorkflow';
import { IExecution } from '../../interfaces/IExecution';
import { logInfo } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';

/**
 * Compiles workflow definitions into executable formats by integrating validation,
 * optimization, and execution context management.
 * Addresses requirement: Workflow Compilation - Implements compilation mechanisms
 */
export class WorkflowCompiler {
  private validator: WorkflowValidator;
  private optimizer: WorkflowOptimizer;
  private executionContext: ExecutionContext;

  /**
   * Initializes the WorkflowCompiler with required dependencies
   * @param validator - Instance of WorkflowValidator for workflow validation
   * @param optimizer - Instance of WorkflowOptimizer for workflow optimization
   * @param executionContext - Instance of ExecutionContext for workflow data access
   */
  constructor(
    validator: WorkflowValidator,
    optimizer: WorkflowOptimizer,
    executionContext: ExecutionContext
  ) {
    this.validator = validator;
    this.optimizer = optimizer;
    this.executionContext = executionContext;
  }

  /**
   * Compiles a workflow definition into an executable format
   * Addresses requirement: Workflow Compilation - Transforms workflows into executable format
   * 
   * @param workflow - The workflow definition to compile
   * @returns The compiled workflow in an executable format
   * @throws Error if compilation fails
   */
  public async compile(workflow: IWorkflow): Promise<IExecution> {
    try {
      logInfo('Starting workflow compilation', { workflowId: workflow.id });

      // Step 1: Validate the workflow definition
      await this.validator.validate(workflow);
      logInfo('Workflow validation completed', { workflowId: workflow.id });

      // Step 2: Optimize the workflow
      const optimizedWorkflow = await this.optimizer.optimize(workflow);
      logInfo('Workflow optimization completed', { workflowId: workflow.id });

      // Step 3: Retrieve workflow data from execution context
      const workflowData = await this.executionContext.getWorkflowData(workflow.id);
      logInfo('Retrieved workflow data', { workflowId: workflow.id });

      // Step 4: Transform workflow into executable format
      const execution: IExecution = {
        id: crypto.randomUUID(), // Generate unique execution ID
        workflowId: workflow.id,
        status: 'Pending',
        context: {
          variables: {},
          currentNode: null,
          metadata: {
            originalWorkflowStatus: workflow.status,
            optimizationApplied: true,
            compiledAt: new Date().toISOString()
          }
        },
        startedAt: new Date(),
        completedAt: null
      };

      logInfo('Workflow compilation completed successfully', {
        workflowId: workflow.id,
        executionId: execution.id
      });

      return execution;
    } catch (error) {
      handleError(error as Error, true);
      throw error; // Re-throw after logging
    }
  }
}