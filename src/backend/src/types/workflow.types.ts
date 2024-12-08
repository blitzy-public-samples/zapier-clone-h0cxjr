/**
 * @fileoverview TypeScript types and utilities for workflows
 * Addresses requirement: Workflow Data Structure from Technical Specification/Database Design/Data Models
 * 
 * This file defines the core types used throughout the workflow automation platform,
 * ensuring type safety and consistency across all workflow-related operations.
 */

import { IWorkflow } from '../interfaces/IWorkflow';
import { 
  WORKFLOW_STATUSES,
  DEFAULT_WORKFLOW_STATUS,
  MAX_WORKFLOW_NAME_LENGTH
} from '../constants/workflow.constants';
import {
  validateWorkflowName,
  validateWorkflowStatus
} from '../utils/validation.util';

/**
 * Type definition for workflow objects
 * Implements the IWorkflow interface to ensure structural consistency
 * Addresses requirement: Workflow Data Structure - Defines core workflow data types
 */
export type WorkflowType = {
  /**
   * Unique identifier for the workflow
   * Typically a UUID or similar unique string
   */
  id: string;

  /**
   * Name of the workflow
   * Must not exceed MAX_WORKFLOW_NAME_LENGTH characters
   * Validated using validateWorkflowName utility
   */
  name: string;

  /**
   * Current status of the workflow
   * Must be one of the predefined WORKFLOW_STATUSES
   * Defaults to DEFAULT_WORKFLOW_STATUS for new workflows
   * Validated using validateWorkflowStatus utility
   */
  status: string;

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
};