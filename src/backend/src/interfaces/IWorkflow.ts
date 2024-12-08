/**
 * @fileoverview Interface definition for workflow objects in the system
 * Addresses requirement: Workflow Data Structure from Technical Specification/Database Design/Data Models
 * 
 * This interface ensures type safety and consistency for workflow-related operations
 * by defining the required structure and types for workflow objects.
 */

import { 
  WORKFLOW_STATUSES,
  DEFAULT_WORKFLOW_STATUS,
  MAX_WORKFLOW_NAME_LENGTH
} from '../constants/workflow.constants';

/**
 * Interface representing a workflow object in the system.
 * Defines the structure and required properties for all workflow instances.
 * 
 * @property id - Unique identifier for the workflow
 * @property name - Human-readable name of the workflow (max length enforced by MAX_WORKFLOW_NAME_LENGTH)
 * @property status - Current state of the workflow (must be one of WORKFLOW_STATUSES)
 * @property createdAt - Timestamp when the workflow was created
 * @property updatedAt - Timestamp of the last workflow update
 */
export interface IWorkflow {
  /**
   * Unique identifier for the workflow
   * Typically a UUID or similar unique string
   */
  id: string;

  /**
   * Name of the workflow
   * Must not exceed MAX_WORKFLOW_NAME_LENGTH characters
   * Used for display and identification purposes
   */
  name: string;

  /**
   * Current status of the workflow
   * Must be one of the predefined WORKFLOW_STATUSES
   * Defaults to DEFAULT_WORKFLOW_STATUS for new workflows
   */
  status: typeof WORKFLOW_STATUSES[number];

  /**
   * Timestamp when the workflow was created
   * Automatically set when a new workflow is created
   */
  createdAt: Date;

  /**
   * Timestamp of the last modification to the workflow
   * Updated automatically whenever the workflow is modified
   */
  updatedAt: Date;
}