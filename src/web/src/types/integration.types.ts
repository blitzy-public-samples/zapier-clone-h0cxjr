/**
 * @fileoverview Integration types and interfaces for managing app connectors and workflows
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides type definitions for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 */

import { AuthTypes } from './auth.types';

/**
 * Rate limiting configuration for integrations
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed per time window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Optional delay between requests in milliseconds
   */
  requestDelay?: number;
}

/**
 * Retry configuration for failed integration requests
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxAttempts: number;

  /**
   * Initial delay before first retry in milliseconds
   */
  initialDelayMs: number;

  /**
   * Backoff multiplier for subsequent retries
   */
  backoffMultiplier: number;

  /**
   * Maximum delay between retries in milliseconds
   */
  maxDelayMs: number;
}

/**
 * Status of an integration
 */
export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'configuring';

/**
 * Workflow definition within an integration
 */
export interface WorkflowDefinition {
  /**
   * Unique identifier for the workflow
   */
  workflowId: string;

  /**
   * Name of the workflow
   */
  workflowName: string;

  /**
   * Trigger type for the workflow
   */
  triggerType: 'webhook' | 'scheduled' | 'event';

  /**
   * Current status of the workflow
   */
  status: 'active' | 'paused' | 'error';

  /**
   * Last execution timestamp
   */
  lastExecuted?: string;
}

/**
 * Main integration interface defining the structure of integration data
 */
export interface Integration {
  /**
   * Unique identifier for the integration
   */
  integrationId: string;

  /**
   * Name of the integration
   */
  name: string;

  /**
   * Description of the integration
   */
  description: string;

  /**
   * Version of the integration
   */
  version: string;

  /**
   * Current status of the integration
   */
  status: IntegrationStatus;

  /**
   * Authentication configuration for the integration
   */
  auth: AuthTypes;

  /**
   * Rate limiting configuration
   */
  rateLimit: RateLimitConfig;

  /**
   * Retry configuration for failed requests
   */
  retry: RetryConfig;

  /**
   * Array of workflows associated with this integration
   */
  workflows: WorkflowDefinition[];

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last updated timestamp
   */
  updatedAt: string;
}

/**
 * Integration event types for monitoring and logging
 */
export type IntegrationEventType = 
  | 'integration.created'
  | 'integration.updated'
  | 'integration.deleted'
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'rate.limit.exceeded'
  | 'retry.attempt'
  | 'retry.success'
  | 'retry.failed';

/**
 * Integration event interface for logging and monitoring
 */
export interface IntegrationEvent {
  /**
   * Type of the integration event
   */
  eventType: IntegrationEventType;

  /**
   * Integration ID associated with the event
   */
  integrationId: string;

  /**
   * Workflow ID if the event is workflow-related
   */
  workflowId?: string;

  /**
   * Timestamp of the event
   */
  timestamp: string;

  /**
   * Additional metadata about the event
   */
  metadata?: Record<string, unknown>;
}

/**
 * Integration metrics for monitoring performance
 */
export interface IntegrationMetrics {
  /**
   * Integration ID
   */
  integrationId: string;

  /**
   * Total number of requests made
   */
  totalRequests: number;

  /**
   * Number of successful requests
   */
  successfulRequests: number;

  /**
   * Number of failed requests
   */
  failedRequests: number;

  /**
   * Average response time in milliseconds
   */
  averageResponseTime: number;

  /**
   * Number of rate limit hits
   */
  rateLimitHits: number;

  /**
   * Number of retry attempts
   */
  retryAttempts: number;

  /**
   * Time period for the metrics
   */
  timePeriod: {
    start: string;
    end: string;
  };
}