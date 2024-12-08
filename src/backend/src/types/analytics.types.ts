/**
 * @fileoverview Analytics Type Definitions
 * This file defines TypeScript types and interfaces for analytics-related data structures,
 * ensuring type safety and consistency in analytics operations across the Workflow Automation Platform.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform)
 *   Provides type definitions for analytics data structures, enabling comprehensive monitoring
 *   and optimization tools.
 */

import { IConnector } from '../interfaces/IConnector';
import { IExecution } from '../interfaces/IExecution';
import { IIntegration } from '../interfaces/IIntegration';
import { IWorkflow } from '../interfaces/IWorkflow';

/**
 * Represents the core analytics data structure used for monitoring and optimization.
 * This type combines data from various system components to provide a comprehensive
 * view of workflow execution and performance metrics.
 */
export type AnalyticsData = {
  /**
   * The connector instance involved in the analytics event
   * Contains identification and configuration details
   */
  connector: IConnector;

  /**
   * The execution instance being analyzed
   * Provides status and runtime information
   */
  execution: IExecution;

  /**
   * The integration configuration used in the execution
   * Contains protocol and connection details
   */
  integration: IIntegration;

  /**
   * The workflow definition being executed
   * Provides workflow identification and metadata
   */
  workflow: IWorkflow;

  /**
   * Timestamp when the analytics data was collected
   * Used for temporal analysis and data retention
   */
  timestamp: Date;

  /**
   * Custom metrics collected during execution
   * Can include performance data, business metrics, and other
   * relevant measurements for analysis and optimization
   */
  metrics: {
    /**
     * Execution timing metrics in milliseconds
     */
    executionTime?: number;
    
    /**
     * Memory usage in megabytes
     */
    memoryUsage?: number;
    
    /**
     * Number of API calls made during execution
     */
    apiCalls?: number;
    
    /**
     * Data throughput in bytes
     */
    dataProcessed?: number;
    
    /**
     * Custom business metrics
     */
    [key: string]: unknown;
  };
};