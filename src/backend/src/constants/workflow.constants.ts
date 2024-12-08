/**
 * @fileoverview Constants related to workflows, including statuses, default values, and constraints
 * Addresses requirement: Workflow Data Structure from Technical Specification/Database Design/Data Models
 * 
 * This file ensures consistency and type safety across the workflow engine by providing
 * centralized constants for workflow-related operations.
 */

import { ERROR_CODES } from './error.constants';

/**
 * Defines all possible workflow statuses in the system
 * These statuses represent the complete lifecycle of a workflow
 */
export const WORKFLOW_STATUSES = [
  'Draft',      // Initial status when workflow is being created/edited
  'Active',     // Workflow is running and processing tasks
  'Paused',     // Workflow execution is temporarily suspended
  'Completed',  // Workflow has finished execution successfully
  'Archived'    // Workflow is no longer active but preserved for reference
] as const;

/**
 * Type definition for workflow statuses to ensure type safety
 * This creates a union type of all possible workflow status values
 */
export type WorkflowStatus = typeof WORKFLOW_STATUSES[number];

/**
 * Default status assigned to newly created workflows
 * This ensures consistency in workflow initialization
 */
export const DEFAULT_WORKFLOW_STATUS: WorkflowStatus = 'Draft';

/**
 * Maximum allowed length for workflow names
 * This constraint helps maintain database efficiency and UI consistency
 * The value is set to 255 to align with common VARCHAR field limitations
 */
export const MAX_WORKFLOW_NAME_LENGTH = 255;

/**
 * Validation error code for workflow-related errors
 * Imported from error constants to maintain consistency in error handling
 */
const { ValidationError } = ERROR_CODES;

/**
 * Regular expression for validating workflow names
 * Ensures names contain only alphanumeric characters, spaces, and common punctuation
 */
export const WORKFLOW_NAME_REGEX = /^[a-zA-Z0-9\s\-_.,!?()]{1,255}$/;

/**
 * Minimum required nodes in a workflow to be considered valid
 * A workflow must have at least a start and an end node
 */
export const MIN_WORKFLOW_NODES = 2;

/**
 * Maximum number of nodes allowed in a single workflow
 * This limit helps prevent performance issues and ensures manageable workflows
 */
export const MAX_WORKFLOW_NODES = 100;

/**
 * Maximum allowed depth of nested workflows
 * Prevents infinite recursion and maintains system stability
 */
export const MAX_WORKFLOW_NESTING_DEPTH = 5;

/**
 * Timeout duration (in milliseconds) for workflow execution
 * Default timeout of 30 minutes for long-running workflows
 */
export const WORKFLOW_EXECUTION_TIMEOUT = 30 * 60 * 1000;

/**
 * Maximum time (in milliseconds) a workflow can remain in 'Paused' status
 * Prevents workflows from being indefinitely paused (7 days)
 */
export const MAX_WORKFLOW_PAUSE_DURATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Interval (in milliseconds) for automatic workflow status checks
 * System performs periodic checks every 5 minutes
 */
export const WORKFLOW_STATUS_CHECK_INTERVAL = 5 * 60 * 1000;