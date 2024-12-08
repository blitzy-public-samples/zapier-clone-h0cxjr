/**
 * @fileoverview TypeScript types and interfaces for workflows in the web application.
 * This file defines the core data structures used for workflow management.
 * 
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Defines types and interfaces for workflows to ensure type safety and consistency
 *   in workflow creation and management.
 */

/**
 * Enum representing the possible statuses of a workflow.
 * Maps to the workflow lifecycle states as defined in the technical specification.
 */
export enum WorkflowStatus {
  /**
   * Initial state when workflow is being created/edited
   */
  Draft = 'Draft',

  /**
   * Workflow is deployed and running
   */
  Active = 'Active',

  /**
   * Workflow has finished all executions successfully
   */
  Completed = 'Completed',

  /**
   * Workflow is no longer in use but preserved for reference
   */
  Archived = 'Archived'
}

/**
 * Interface defining the structure of a workflow object.
 * Contains all essential properties for workflow management.
 */
export interface Workflow {
  /**
   * Unique identifier for the workflow
   */
  workflowId: string;

  /**
   * Human-readable name of the workflow
   */
  name: string;

  /**
   * Current status of the workflow
   * @see WorkflowStatus
   */
  status: string;

  /**
   * Timestamp when the workflow was created
   */
  createdAt: Date;

  /**
   * Timestamp of the last workflow update
   */
  updatedAt: Date;
}