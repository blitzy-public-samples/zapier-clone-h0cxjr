/**
 * @fileoverview Analytics types and interfaces for monitoring and optimization
 * Requirements addressed:
 * - Analytics Platform (Technical Specification/System Overview/High-Level Description)
 *   Provides type definitions for comprehensive monitoring and optimization tools.
 */

import { AuthTypes } from './auth.types';

/**
 * Interface defining the structure of workflow analytics data
 */
export interface WorkflowAnalytics {
  /**
   * Unique identifier for the workflow
   */
  workflowId: string;

  /**
   * Name of the workflow
   */
  name: string;

  /**
   * Current status of the workflow
   */
  status: string;

  /**
   * User who created the workflow
   */
  createdBy: AuthTypes;
}

/**
 * Interface defining the structure of execution analytics data
 */
export interface ExecutionAnalytics {
  /**
   * Unique identifier for the execution
   */
  executionId: string;

  /**
   * Current status of the execution
   */
  status: string;
}

/**
 * Interface defining the structure of analytics-related data
 */
export interface AnalyticsTypes {
  /**
   * Unique identifier for analytics data
   */
  analyticsId: string;

  /**
   * Workflow analytics information
   */
  workflow: WorkflowAnalytics;

  /**
   * Execution analytics information
   */
  execution: ExecutionAnalytics;

  /**
   * Authentication information associated with analytics data
   */
  auth: AuthTypes;
}