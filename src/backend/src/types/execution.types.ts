/**
 * @fileoverview Defines TypeScript types and enums for execution-related entities
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * This file provides type definitions for managing execution-related data and operations,
 * including asynchronous processing, real-time monitoring, error recovery, and execution history.
 */

import { IExecution } from '../interfaces/IExecution';
import { WORKFLOW_STATUSES } from '../constants/workflow.constants';
import { ERROR_CODES } from '../constants/error.constants';

/**
 * Enum defining the possible states of an execution instance
 * These states represent the complete lifecycle of a workflow execution
 * from initialization to completion
 */
export enum ExecutionStatus {
  /**
   * Execution is queued but not yet started
   * Initial state when an execution is created
   */
  PENDING = 'Pending',

  /**
   * Execution is currently in progress
   * State when workflow steps are being processed
   */
  RUNNING = 'Running',

  /**
   * Execution has finished successfully
   * Terminal state for successful executions
   */
  COMPLETED = 'Completed',

  /**
   * Execution encountered an error
   * Terminal state for failed executions
   */
  FAILED = 'Failed'
}

/**
 * Type for execution context variables
 * Represents the dynamic data structure used during execution
 */
export type ExecutionContext = IExecution['context'];

/**
 * Type for execution error details
 * Used when capturing and handling execution failures
 */
export type ExecutionError = {
  message: string;
  code: typeof ERROR_CODES.ValidationError;
  timestamp: Date;
  nodeId?: string;
};

/**
 * Type for execution metadata
 * Additional information tracked during execution
 */
export type ExecutionMetadata = {
  workflowStatus: typeof WORKFLOW_STATUSES[number];
  retryAttempts: number;
  duration?: number;
  lastNodeId?: string;
  customData?: Record<string, unknown>;
};

/**
 * Type for execution result
 * Represents the final output of a completed execution
 */
export type ExecutionResult = {
  status: ExecutionStatus;
  output: Record<string, unknown>;
  error?: ExecutionError;
  metadata: ExecutionMetadata;
  completedAt: Date;
};

/**
 * Type for execution options
 * Configuration options for execution instances
 */
export type ExecutionOptions = {
  timeout?: number;
  retryLimit?: number;
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};