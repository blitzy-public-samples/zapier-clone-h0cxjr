/**
 * @fileoverview Utility functions for validating various data structures used in the web application.
 * Requirements addressed:
 * - Data Validation (Technical Specification/System Design/API Design)
 *   Provides utility functions to validate data structures for workflows, integrations,
 *   executions, and authentication.
 */

import { AnalyticsTypes } from '../types/analytics.types';
import { AuthTypes } from '../types/auth.types';
import { ExecutionTypes } from '../types/execution.types';
import { Integration } from '../types/integration.types';
import { Workflow } from '../types/workflow.types';

/**
 * Human Tasks:
 * 1. Review validation rules and thresholds for each data type
 * 2. Confirm if additional validation rules are needed for specific environments
 * 3. Determine if custom error messages should be added for validation failures
 */

/**
 * Validates analytics-related data structures to ensure they conform to the defined types
 * @param analyticsData - The analytics data object to validate
 * @returns boolean indicating whether the data is valid
 */
export const validateAnalyticsData = (analyticsData: Partial<AnalyticsTypes>): boolean => {
  // Check if the analyticsId property exists and is a non-empty string
  if (!analyticsData.analyticsId || typeof analyticsData.analyticsId !== 'string' || 
      analyticsData.analyticsId.trim() === '') {
    return false;
  }

  // Check if the workflow property exists and conforms to the workflow type
  if (!analyticsData.workflow || 
      typeof analyticsData.workflow !== 'object' ||
      !analyticsData.workflow.workflowId ||
      typeof analyticsData.workflow.workflowId !== 'string' ||
      !analyticsData.workflow.name ||
      typeof analyticsData.workflow.name !== 'string' ||
      !analyticsData.workflow.status ||
      typeof analyticsData.workflow.status !== 'string' ||
      !analyticsData.workflow.createdBy) {
    return false;
  }

  return true;
};

/**
 * Validates authentication-related data structures to ensure they conform to the defined types
 * @param authData - The authentication data object to validate
 * @returns boolean indicating whether the data is valid
 */
export const validateAuthData = (authData: Partial<AuthTypes>): boolean => {
  // Check if the username property exists and is a non-empty string
  if (!authData.username || typeof authData.username !== 'string' || 
      authData.username.trim() === '') {
    return false;
  }

  // Check if the password property exists and is a non-empty string
  if (!authData.password || typeof authData.password !== 'string' || 
      authData.password.trim() === '') {
    return false;
  }

  // Check if the token property exists and is a non-empty string
  if (!authData.token || typeof authData.token !== 'string' || 
      authData.token.trim() === '') {
    return false;
  }

  return true;
};

/**
 * Validates execution-related data structures to ensure they conform to the defined types
 * @param executionData - The execution data object to validate
 * @returns boolean indicating whether the data is valid
 */
export const validateExecutionData = (executionData: Partial<ExecutionTypes.ExecutionData>): boolean => {
  // Check if the executionId property exists and is a non-empty string
  if (!executionData.executionId || typeof executionData.executionId !== 'string' || 
      executionData.executionId.trim() === '') {
    return false;
  }

  // Check if the status property exists and is a valid string
  if (!executionData.status || typeof executionData.status !== 'string' || 
      !['Draft', 'Active', 'Completed', 'Archived'].includes(executionData.status)) {
    return false;
  }

  return true;
};

/**
 * Validates integration-related data structures to ensure they conform to the defined types
 * @param integrationData - The integration data object to validate
 * @returns boolean indicating whether the data is valid
 */
export const validateIntegrationData = (integrationData: Partial<Integration>): boolean => {
  // Check if the integrationId property exists and is a non-empty string
  if (!integrationData.integrationId || typeof integrationData.integrationId !== 'string' || 
      integrationData.integrationId.trim() === '') {
    return false;
  }

  // Check if the name property exists and is a non-empty string
  if (!integrationData.name || typeof integrationData.name !== 'string' || 
      integrationData.name.trim() === '') {
    return false;
  }

  return true;
};

/**
 * Validates workflow-related data structures to ensure they conform to the defined types
 * @param workflowData - The workflow data object to validate
 * @returns boolean indicating whether the data is valid
 */
export const validateWorkflowData = (workflowData: Partial<Workflow>): boolean => {
  // Check if the workflowId property exists and is a non-empty string
  if (!workflowData.workflowId || typeof workflowData.workflowId !== 'string' || 
      workflowData.workflowId.trim() === '') {
    return false;
  }

  // Check if the status property exists and is a valid string
  if (!workflowData.status || typeof workflowData.status !== 'string' || 
      !['Draft', 'Active', 'Completed', 'Archived'].includes(workflowData.status)) {
    return false;
  }

  return true;
};