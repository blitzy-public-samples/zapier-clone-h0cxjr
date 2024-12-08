/**
 * @fileoverview Constants related to workflows, including default values, status mappings,
 * and other reusable workflow-related configurations.
 * 
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides reusable constants for workflows to ensure consistency in workflow creation
 *   and management.
 */

import { Workflow, WorkflowStatus } from '../types/workflow.types';

/**
 * Default name assigned to newly created workflows when no name is provided
 */
export const DEFAULT_WORKFLOW_NAME = 'Untitled Workflow';

/**
 * Mapping of workflow statuses to their human-readable descriptions
 * Used for displaying status information in the UI and generating documentation
 */
export const WORKFLOW_STATUS_MAPPING: Record<WorkflowStatus, string> = {
  [WorkflowStatus.Draft]: 'Workflow is in draft state.',
  [WorkflowStatus.Active]: 'Workflow is currently active.',
  [WorkflowStatus.Completed]: 'Workflow has been completed.',
  [WorkflowStatus.Archived]: 'Workflow is archived.'
} as const;

/**
 * Type guard to check if a status string is a valid WorkflowStatus
 * @param status - The status string to check
 * @returns boolean indicating if the status is valid
 */
export const isValidWorkflowStatus = (status: string): status is WorkflowStatus => {
  return Object.values(WorkflowStatus).includes(status as WorkflowStatus);
};

/**
 * Creates a default workflow object with initial values
 * @param name - Optional name for the workflow, defaults to DEFAULT_WORKFLOW_NAME
 * @returns A partial Workflow object with default values
 */
export const createDefaultWorkflow = (name: string = DEFAULT_WORKFLOW_NAME): Partial<Workflow> => {
  return {
    name,
    status: WorkflowStatus.Draft,
  };
};