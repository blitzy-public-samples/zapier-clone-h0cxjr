/**
 * @fileoverview Unit tests for the WorkflowCompiler class
 * Addresses requirement: Workflow Compilation Testing from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review test coverage and add additional test cases as needed
 * 2. Verify test assertions align with business requirements
 * 3. Ensure mock data reflects real-world workflow scenarios
 */

// jest v29.0.0
import { WorkflowCompiler } from '../../../src/core/engine/WorkflowCompiler';
import { WorkflowValidator } from '../../../src/core/engine/WorkflowValidator';
import { ExecutionContext } from '../../../src/core/engine/ExecutionContext';
import { WorkflowType } from '../../../src/types/workflow.types';
import { handleError } from '../../../src/utils/error.util';

describe('WorkflowCompiler', () => {
  let workflowCompiler: WorkflowCompiler;
  let mockValidator: jest.Mocked<WorkflowValidator>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockWorkflowOptimizer: any;

  // Sample workflow for testing
  const sampleWorkflow: WorkflowType = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Workflow',
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create mock instances
    mockValidator = {
      validate: jest.fn().mockResolvedValue(true)
    } as any;

    mockExecutionContext = {
      getWorkflowData: jest.fn().mockResolvedValue(sampleWorkflow)
    } as any;

    mockWorkflowOptimizer = {
      optimize: jest.fn().mockResolvedValue(sampleWorkflow)
    };

    // Initialize WorkflowCompiler with mocked dependencies
    workflowCompiler = new WorkflowCompiler(
      mockValidator,
      mockWorkflowOptimizer,
      mockExecutionContext
    );
  });

  describe('compile', () => {
    it('should successfully compile a valid workflow', async () => {
      try {
        // Act
        const result = await workflowCompiler.compile(sampleWorkflow);

        // Assert
        expect(result).toBeDefined();
        expect(result.workflowId).toBe(sampleWorkflow.id);
        expect(result.status).toBe('Pending');
        expect(result.context).toBeDefined();
        expect(result.startedAt).toBeInstanceOf(Date);
        expect(result.completedAt).toBeNull();

        // Verify validator was called
        expect(mockValidator.validate).toHaveBeenCalledWith(sampleWorkflow);

        // Verify execution context was used
        expect(mockExecutionContext.getWorkflowData).toHaveBeenCalledWith(sampleWorkflow.id);

        // Verify optimizer was called
        expect(mockWorkflowOptimizer.optimize).toHaveBeenCalledWith(sampleWorkflow);
      } catch (error) {
        handleError(error as Error, true);
      }
    });

    it('should throw an error when workflow validation fails', async () => {
      // Arrange
      const validationError = new Error('Validation failed');
      mockValidator.validate.mockRejectedValue(validationError);

      // Act & Assert
      await expect(workflowCompiler.compile(sampleWorkflow))
        .rejects
        .toThrow('Validation failed');

      expect(mockValidator.validate).toHaveBeenCalledWith(sampleWorkflow);
    });

    it('should throw an error when workflow data retrieval fails', async () => {
      // Arrange
      const dataError = new Error('Data retrieval failed');
      mockExecutionContext.getWorkflowData.mockRejectedValue(dataError);

      // Act & Assert
      await expect(workflowCompiler.compile(sampleWorkflow))
        .rejects
        .toThrow('Data retrieval failed');

      expect(mockExecutionContext.getWorkflowData).toHaveBeenCalledWith(sampleWorkflow.id);
    });

    it('should throw an error when workflow optimization fails', async () => {
      // Arrange
      const optimizationError = new Error('Optimization failed');
      mockWorkflowOptimizer.optimize.mockRejectedValue(optimizationError);

      // Act & Assert
      await expect(workflowCompiler.compile(sampleWorkflow))
        .rejects
        .toThrow('Optimization failed');

      expect(mockWorkflowOptimizer.optimize).toHaveBeenCalledWith(sampleWorkflow);
    });

    it('should generate a unique execution ID for each compilation', async () => {
      // Act
      const result1 = await workflowCompiler.compile(sampleWorkflow);
      const result2 = await workflowCompiler.compile(sampleWorkflow);

      // Assert
      expect(result1.id).not.toBe(result2.id);
    });

    it('should initialize execution context with correct metadata', async () => {
      // Act
      const result = await workflowCompiler.compile(sampleWorkflow);

      // Assert
      expect(result.context.metadata).toEqual(expect.objectContaining({
        originalWorkflowStatus: sampleWorkflow.status,
        optimizationApplied: true,
        compiledAt: expect.any(String)
      }));
    });

    it('should handle workflows with different statuses', async () => {
      // Arrange
      const activeWorkflow = { ...sampleWorkflow, status: 'Active' };

      // Act
      const result = await workflowCompiler.compile(activeWorkflow);

      // Assert
      expect(result.context.metadata?.originalWorkflowStatus).toBe('Active');
    });
  });
});