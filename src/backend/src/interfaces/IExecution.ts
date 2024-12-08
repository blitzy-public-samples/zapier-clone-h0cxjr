/**
 * @fileoverview Interface definition for execution entities in the Workflow Automation Platform
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * This interface ensures type safety and consistency for execution-related operations
 * by defining the required structure and types for execution objects.
 */

import { IWorkflow } from './IWorkflow';

/**
 * Represents the possible states of a workflow execution
 * These states track the lifecycle of an execution from start to completion
 */
export type ExecutionStatus = 
  | 'Pending'    // Execution is queued but not yet started
  | 'Running'    // Execution is currently in progress
  | 'Completed'  // Execution finished successfully
  | 'Failed'     // Execution encountered an error
  | 'Cancelled'  // Execution was manually cancelled
  | 'Suspended'  // Execution is temporarily paused
  | 'TimedOut';  // Execution exceeded its time limit

/**
 * Interface representing an execution instance in the system.
 * Each execution represents a single run of a workflow.
 * 
 * @property id - Unique identifier for the execution instance
 * @property workflowId - Reference to the associated workflow
 * @property status - Current state of the execution
 * @property context - Runtime data and variables for the execution
 * @property startedAt - Timestamp when the execution began
 * @property completedAt - Timestamp when the execution finished (if completed)
 */
export interface IExecution {
  /**
   * Unique identifier for the execution
   * Typically a UUID or similar unique string
   */
  id: string;

  /**
   * Reference to the workflow being executed
   * Must match an existing workflow ID in the system
   */
  workflowId: string;

  /**
   * Current status of the execution
   * Tracks the execution's progress through its lifecycle
   */
  status: ExecutionStatus;

  /**
   * Runtime context for the execution
   * Stores variables, temporary data, and execution state
   * Structure is dynamic based on workflow needs
   */
  context: {
    variables: Record<string, unknown>;
    currentNode?: string;
    lastError?: {
      message: string;
      code: string;
      timestamp: Date;
      nodeId?: string;
    };
    retryCount?: number;
    metadata?: Record<string, unknown>;
  };

  /**
   * Timestamp when the execution started
   * Automatically set when execution begins
   */
  startedAt: Date;

  /**
   * Timestamp when the execution completed
   * Set to null while execution is in progress
   * Updated when execution reaches a terminal state
   */
  completedAt: Date | null;
}