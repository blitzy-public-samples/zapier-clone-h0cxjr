/**
 * @fileoverview Execution types and interfaces for workflow management
 * Requirements addressed:
 * - Execution Features (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides type definitions for asynchronous processing, real-time monitoring,
 *   error recovery, and execution history.
 */

import { AuthTypes } from './auth.types';

/**
 * Valid workflow status values
 */
export type WorkflowStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';

/**
 * Interface defining the structure of a workflow
 */
export interface Workflow {
  /**
   * Unique identifier for the workflow
   */
  id: string;

  /**
   * Name of the workflow
   */
  name: string;

  /**
   * Current status of the workflow
   */
  status: WorkflowStatus;

  /**
   * Description of the workflow
   */
  description?: string;
}

/**
 * Interface defining integration configuration
 */
export interface Integration {
  /**
   * Unique identifier for the integration
   */
  id: string;

  /**
   * Type of integration (e.g., 'REST', 'GraphQL', 'SOAP')
   */
  type: string;

  /**
   * Configuration parameters for the integration
   */
  config: Record<string, unknown>;

  /**
   * Integration endpoint URL
   */
  endpoint: string;
}

/**
 * Interface defining execution data structure
 */
export interface ExecutionData {
  /**
   * Unique identifier for the execution
   */
  executionId: string;

  /**
   * Associated workflow information
   */
  workflow: Workflow;

  /**
   * Current status of the execution
   */
  status: WorkflowStatus;

  /**
   * Integration details for the execution
   */
  integration: Integration;

  /**
   * Authentication information
   */
  auth: Pick<AuthTypes, 'token'>;

  /**
   * Timestamp when the execution was created
   */
  createdAt: Date;

  /**
   * Timestamp when the execution was last updated
   */
  updatedAt: Date;
}

/**
 * Type for execution history entry
 */
export interface ExecutionHistoryEntry {
  /**
   * Timestamp of the history entry
   */
  timestamp: Date;

  /**
   * Type of event (e.g., 'status_change', 'error', 'completion')
   */
  eventType: string;

  /**
   * Details of the event
   */
  details: Record<string, unknown>;
}

/**
 * Type for execution error information
 */
export interface ExecutionError {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Stack trace if available
   */
  stack?: string;

  /**
   * Timestamp when the error occurred
   */
  timestamp: Date;
}

/**
 * Type for execution metrics
 */
export interface ExecutionMetrics {
  /**
   * Duration of execution in milliseconds
   */
  duration: number;

  /**
   * Resource utilization metrics
   */
  resources: {
    cpu: number;
    memory: number;
    network: number;
  };

  /**
   * Success rate as a percentage
   */
  successRate: number;
}

/**
 * Namespace containing all execution-related types
 */
export namespace ExecutionTypes {
  export type { 
    ExecutionData,
    Workflow,
    Integration,
    ExecutionHistoryEntry,
    ExecutionError,
    ExecutionMetrics,
    WorkflowStatus
  };
}