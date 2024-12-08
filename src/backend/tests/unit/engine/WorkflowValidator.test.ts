// jest v29.0.0
import { validateWorkflowDefinition } from '../../../src/core/engine/WorkflowValidator';
import { WorkflowType } from '../../../src/types/workflow.types';
import { validateWorkflow } from '../../../src/utils/validation.util';
import { 
  WORKFLOW_STATUSES, 
  MAX_WORKFLOW_NAME_LENGTH,
  MIN_WORKFLOW_NODES,
  MAX_WORKFLOW_NODES,
  MAX_WORKFLOW_NESTING_DEPTH,
  WORKFLOW_NAME_REGEX
} from '../../../src/constants/workflow.constants';
import { ERROR_CODES } from '../../../src/constants/error.constants';

/**
 * Human Tasks:
 * 1. Ensure test database is properly configured for integration tests
 * 2. Review test coverage thresholds and adjust if needed
 * 3. Set up continuous testing pipeline integration
 */

describe('WorkflowValidator Tests', () => {
  // Test requirement: Workflow Validation Testing - Ensures proper validation of workflow structure
  describe('validateWorkflowDefinition', () => {
    let validWorkflow: WorkflowType;

    beforeEach(() => {
      // Set up a valid workflow object before each test
      validWorkflow = {
        id: 'test-workflow-1',
        name: 'Test Workflow',
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    it('should validate a correctly structured workflow', () => {
      expect(() => validateWorkflowDefinition(validWorkflow)).not.toThrow();
      expect(validateWorkflowDefinition(validWorkflow)).toBe(true);
    });

    it('should throw error for workflow with invalid name format', () => {
      validWorkflow.name = '@Invalid#Name$';
      expect(() => validateWorkflowDefinition(validWorkflow))
        .toThrow(`${ERROR_CODES.ValidationError}: Workflow name contains invalid characters`);
    });

    it('should throw error for workflow name exceeding maximum length', () => {
      validWorkflow.name = 'a'.repeat(MAX_WORKFLOW_NAME_LENGTH + 1);
      expect(() => validateWorkflowDefinition(validWorkflow))
        .toThrow(ERROR_CODES.ValidationError);
    });

    it('should throw error for invalid workflow status', () => {
      (validWorkflow as any).status = 'InvalidStatus';
      expect(() => validateWorkflowDefinition(validWorkflow))
        .toThrow(ERROR_CODES.ValidationError);
    });

    describe('Node Validation', () => {
      beforeEach(() => {
        (validWorkflow as any).nodes = [
          { id: 'start', type: 'START' },
          { id: 'end', type: 'END' }
        ];
      });

      it('should validate workflow with minimum required nodes', () => {
        expect(validateWorkflowDefinition(validWorkflow)).toBe(true);
      });

      it('should throw error when workflow has fewer than minimum required nodes', () => {
        (validWorkflow as any).nodes = [{ id: 'start', type: 'START' }];
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Workflow must contain at least ${MIN_WORKFLOW_NODES} nodes`);
      });

      it('should throw error when workflow exceeds maximum allowed nodes', () => {
        (validWorkflow as any).nodes = Array(MAX_WORKFLOW_NODES + 1)
          .fill(null)
          .map((_, index) => ({ id: `node-${index}`, type: index === 0 ? 'START' : index === 1 ? 'END' : 'TASK' }));
        
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Workflow exceeds maximum allowed nodes`);
      });

      it('should throw error when workflow is missing START node', () => {
        (validWorkflow as any).nodes = [
          { id: 'task', type: 'TASK' },
          { id: 'end', type: 'END' }
        ];
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Workflow must contain both START and END nodes`);
      });

      it('should throw error when workflow is missing END node', () => {
        (validWorkflow as any).nodes = [
          { id: 'start', type: 'START' },
          { id: 'task', type: 'TASK' }
        ];
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Workflow must contain both START and END nodes`);
      });
    });

    describe('Subworkflow Validation', () => {
      it('should validate workflow with valid nesting depth', () => {
        (validWorkflow as any).subworkflows = [
          {
            id: 'sub1',
            subworkflows: [
              { id: 'sub2' }
            ]
          }
        ];
        expect(validateWorkflowDefinition(validWorkflow)).toBe(true);
      });

      it('should throw error when exceeding maximum nesting depth', () => {
        let currentLevel: any = { id: 'sub1' };
        const subworkflows = [currentLevel];
        
        // Create nested structure exceeding MAX_WORKFLOW_NESTING_DEPTH
        for (let i = 0; i < MAX_WORKFLOW_NESTING_DEPTH + 1; i++) {
          const newLevel = { id: `sub${i + 2}` };
          currentLevel.subworkflows = [newLevel];
          currentLevel = newLevel;
        }
        
        (validWorkflow as any).subworkflows = subworkflows;
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Workflow exceeds maximum nesting depth`);
      });
    });

    describe('Transition Validation', () => {
      beforeEach(() => {
        (validWorkflow as any).nodes = [
          { id: 'start', type: 'START' },
          { id: 'task1', type: 'TASK' },
          { id: 'end', type: 'END' }
        ];
      });

      it('should validate workflow with valid transitions', () => {
        (validWorkflow as any).transitions = [
          { from: 'start', to: 'task1' },
          { from: 'task1', to: 'end' }
        ];
        expect(validateWorkflowDefinition(validWorkflow)).toBe(true);
      });

      it('should throw error for duplicate transitions', () => {
        (validWorkflow as any).transitions = [
          { from: 'start', to: 'task1' },
          { from: 'start', to: 'task1' }
        ];
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Duplicate transition detected`);
      });

      it('should throw error for transitions referencing non-existent nodes', () => {
        (validWorkflow as any).transitions = [
          { from: 'start', to: 'nonexistent' },
          { from: 'task1', to: 'end' }
        ];
        expect(() => validateWorkflowDefinition(validWorkflow))
          .toThrow(`${ERROR_CODES.ValidationError}: Transition references non-existent node(s)`);
      });
    });
  });
});