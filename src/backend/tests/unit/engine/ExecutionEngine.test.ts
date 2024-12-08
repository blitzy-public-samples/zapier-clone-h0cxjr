/**
 * @fileoverview Unit tests for the ExecutionEngine class
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * Human Tasks:
 * 1. Review and adjust test coverage thresholds in jest configuration
 * 2. Set up test data fixtures for different workflow scenarios
 * 3. Configure CI/CD pipeline to run these tests automatically
 * 4. Review test results and performance metrics regularly
 */

// jest v29.0.0
import { ExecutionEngine } from '../../../src/core/engine/ExecutionEngine';
import { ExecutionContext } from '../../../src/core/engine/ExecutionContext';
import { WorkflowValidator } from '../../../src/core/engine/WorkflowValidator';
import { WorkflowOptimizer } from '../../../src/core/engine/WorkflowOptimizer';
import { WorkflowCompiler } from '../../../src/core/engine/WorkflowCompiler';
import { StepExecutor } from '../../../src/core/engine/StepExecutor';
import { ExecutionStatus } from '../../../src/types/execution.types';
import { logError, logInfo } from '../../../src/utils/logger.util';

// Mock all dependencies
jest.mock('../../../src/core/engine/ExecutionContext');
jest.mock('../../../src/core/engine/WorkflowValidator');
jest.mock('../../../src/core/engine/WorkflowOptimizer');
jest.mock('../../../src/core/engine/WorkflowCompiler');
jest.mock('../../../src/core/engine/StepExecutor');
jest.mock('../../../src/utils/logger.util');

describe('ExecutionEngine', () => {
  // Test setup variables
  let executionEngine: ExecutionEngine;
  let mockValidator: jest.Mocked<WorkflowValidator>;
  let mockOptimizer: jest.Mocked<WorkflowOptimizer>;
  let mockCompiler: jest.Mocked<WorkflowCompiler>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockStepExecutor: jest.Mocked<StepExecutor>;

  // Mock workflow and execution data
  const mockWorkflowId = 'test-workflow-123';
  const mockExecutionId = 'test-execution-456';
  const mockWorkflowData = {
    id: mockWorkflowId,
    name: 'Test Workflow',
    nodes: [
      { id: 'start', type: 'START' },
      { id: 'step1', type: 'TASK' },
      { id: 'end', type: 'END' }
    ]
  };
  const mockExecutionData = {
    id: mockExecutionId,
    workflowId: mockWorkflowId,
    status: ExecutionStatus.PENDING,
    context: {
      variables: {},
      currentNode: null
    },
    startedAt: new Date(),
    completedAt: null
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Initialize mocked dependencies
    mockValidator = new WorkflowValidator() as jest.Mocked<WorkflowValidator>;
    mockOptimizer = new WorkflowOptimizer(mockValidator, mockExecutionContext) as jest.Mocked<WorkflowOptimizer>;
    mockCompiler = new WorkflowCompiler(mockValidator, mockOptimizer, mockExecutionContext) as jest.Mocked<WorkflowCompiler>;
    mockExecutionContext = new ExecutionContext(mockValidator) as jest.Mocked<ExecutionContext>;
    mockStepExecutor = new StepExecutor(mockExecutionContext, mockValidator) as jest.Mocked<StepExecutor>;

    // Set up mock implementations
    mockExecutionContext.getWorkflowData.mockResolvedValue(mockWorkflowData);
    mockExecutionContext.getExecutionData.mockResolvedValue(mockExecutionData);
    mockValidator.validate.mockResolvedValue(true);
    mockOptimizer.optimize.mockResolvedValue(mockWorkflowData);
    mockCompiler.compile.mockResolvedValue({
      ...mockExecutionData,
      id: mockExecutionId,
      startedAt: new Date()
    });
    mockStepExecutor.executeStep.mockResolvedValue({
      status: ExecutionStatus.COMPLETED,
      result: { success: true }
    });

    // Initialize ExecutionEngine with mocked dependencies
    executionEngine = new ExecutionEngine(
      mockValidator,
      mockOptimizer,
      mockCompiler,
      mockExecutionContext,
      mockStepExecutor
    );
  });

  describe('executeWorkflow', () => {
    it('should successfully execute a workflow with all steps', async () => {
      // Execute the workflow
      const result = await executionEngine.executeWorkflow(mockWorkflowId);

      // Verify all dependencies were called with correct arguments
      expect(mockExecutionContext.getWorkflowData).toHaveBeenCalledWith(mockWorkflowId);
      expect(mockValidator.validate).toHaveBeenCalledWith(mockWorkflowData);
      expect(mockOptimizer.optimize).toHaveBeenCalledWith(mockWorkflowData);
      expect(mockCompiler.compile).toHaveBeenCalledWith(mockWorkflowData);
      expect(mockExecutionContext.getExecutionData).toHaveBeenCalledWith(mockExecutionId);

      // Verify step execution
      expect(mockStepExecutor.executeStep).toHaveBeenCalledTimes(mockWorkflowData.nodes.length);

      // Verify logging calls
      expect(logInfo).toHaveBeenCalledWith('Starting workflow execution', { workflowId: mockWorkflowId });
      expect(logInfo).toHaveBeenCalledWith('Workflow execution completed successfully', expect.any(Object));

      // Verify result structure
      expect(result).toEqual(expect.objectContaining({
        executionId: mockExecutionId,
        status: ExecutionStatus.COMPLETED,
        steps: expect.any(Array),
        metadata: expect.objectContaining({
          startedAt: expect.any(Date),
          completedAt: expect.any(Date),
          duration: expect.any(Number),
          stepsExecuted: mockWorkflowData.nodes.length
        })
      }));
    });

    it('should handle workflow execution failure', async () => {
      // Mock execution failure
      const mockError = new Error('Workflow execution failed');
      mockStepExecutor.executeStep.mockRejectedValueOnce(mockError);

      // Execute workflow and expect it to throw
      await expect(executionEngine.executeWorkflow(mockWorkflowId))
        .rejects.toThrow(mockError);

      // Verify error logging
      expect(logError).toHaveBeenCalledWith('Workflow execution failed', {
        workflowId: mockWorkflowId,
        error: mockError.message
      });
    });

    it('should handle validation failure', async () => {
      // Mock validation failure
      const mockError = new Error('Validation failed');
      mockValidator.validate.mockRejectedValueOnce(mockError);

      // Execute workflow and expect it to throw
      await expect(executionEngine.executeWorkflow(mockWorkflowId))
        .rejects.toThrow(mockError);

      // Verify error was logged
      expect(logError).toHaveBeenCalledWith('Workflow execution failed', {
        workflowId: mockWorkflowId,
        error: mockError.message
      });
    });

    it('should handle optimization failure', async () => {
      // Mock optimization failure
      const mockError = new Error('Optimization failed');
      mockOptimizer.optimize.mockRejectedValueOnce(mockError);

      // Execute workflow and expect it to throw
      await expect(executionEngine.executeWorkflow(mockWorkflowId))
        .rejects.toThrow(mockError);

      // Verify error was logged
      expect(logError).toHaveBeenCalledWith('Workflow execution failed', {
        workflowId: mockWorkflowId,
        error: mockError.message
      });
    });

    it('should handle compilation failure', async () => {
      // Mock compilation failure
      const mockError = new Error('Compilation failed');
      mockCompiler.compile.mockRejectedValueOnce(mockError);

      // Execute workflow and expect it to throw
      await expect(executionEngine.executeWorkflow(mockWorkflowId))
        .rejects.toThrow(mockError);

      // Verify error was logged
      expect(logError).toHaveBeenCalledWith('Workflow execution failed', {
        workflowId: mockWorkflowId,
        error: mockError.message
      });
    });
  });
});