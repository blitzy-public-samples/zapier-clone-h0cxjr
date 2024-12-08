/**
 * @fileoverview Workflow validation module that ensures workflow data integrity
 * Addresses requirement: Data Validation from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review and adjust validation rules based on specific business requirements
 * 2. Ensure error messages are properly localized
 * 3. Consider adding additional validation rules for specific workflow types
 */

import { 
  WORKFLOW_STATUSES, 
  MAX_WORKFLOW_NAME_LENGTH 
} from '../../constants/workflow.constants';
import { validateWorkflow } from '../../utils/validation.util';
import { logValidationError } from '../../utils/error.util';
import { IWorkflow } from '../../interfaces/IWorkflow';

/**
 * Validates workflow data to ensure it meets all required constraints
 * Addresses requirement: Data Validation - Ensures data integrity and adherence to predefined constraints for workflows
 * 
 * @param workflow - The workflow object to validate
 * @returns true if validation passes
 * @throws Error if validation fails
 */
export const validateWorkflowData = (workflow: IWorkflow): boolean => {
  try {
    // First perform basic workflow validation using the utility function
    validateWorkflow(workflow);

    // Additional workflow-specific validations
    if (!workflow.name || typeof workflow.name !== 'string') {
      logValidationError('Workflow name is required and must be a string', {
        workflowId: workflow.id,
        providedName: workflow.name
      });
      throw new Error('Invalid workflow name');
    }

    // Check name length
    if (workflow.name.length > MAX_WORKFLOW_NAME_LENGTH) {
      logValidationError(`Workflow name exceeds maximum length of ${MAX_WORKFLOW_NAME_LENGTH} characters`, {
        workflowId: workflow.id,
        nameLength: workflow.name.length,
        maxLength: MAX_WORKFLOW_NAME_LENGTH
      });
      throw new Error(`Workflow name cannot exceed ${MAX_WORKFLOW_NAME_LENGTH} characters`);
    }

    // Validate workflow status
    if (!workflow.status || !WORKFLOW_STATUSES.includes(workflow.status as any)) {
      logValidationError('Invalid workflow status', {
        workflowId: workflow.id,
        providedStatus: workflow.status,
        validStatuses: WORKFLOW_STATUSES
      });
      throw new Error(`Invalid workflow status. Must be one of: ${WORKFLOW_STATUSES.join(', ')}`);
    }

    // Validate timestamps
    if (!workflow.createdAt || !(workflow.createdAt instanceof Date)) {
      logValidationError('Invalid creation timestamp', {
        workflowId: workflow.id,
        createdAt: workflow.createdAt
      });
      throw new Error('Invalid workflow creation timestamp');
    }

    if (!workflow.updatedAt || !(workflow.updatedAt instanceof Date)) {
      logValidationError('Invalid update timestamp', {
        workflowId: workflow.id,
        updatedAt: workflow.updatedAt
      });
      throw new Error('Invalid workflow update timestamp');
    }

    // Ensure updatedAt is not before createdAt
    if (workflow.updatedAt < workflow.createdAt) {
      logValidationError('Update timestamp cannot be before creation timestamp', {
        workflowId: workflow.id,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
      });
      throw new Error('Invalid timestamp sequence: update time cannot be before creation time');
    }

    return true;
  } catch (error) {
    // Log the validation error with context
    logValidationError('Workflow validation failed', {
      workflowId: workflow?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      workflow: {
        name: workflow?.name,
        status: workflow?.status,
        createdAt: workflow?.createdAt,
        updatedAt: workflow?.updatedAt
      }
    });
    throw error;
  }
};