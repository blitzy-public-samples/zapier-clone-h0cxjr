/**
 * @fileoverview Analytics Data Validation
 * This file provides validation logic for analytics-related data structures,
 * ensuring data integrity within the Workflow Automation Platform.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform)
 *   Implements validation mechanisms for analytics data to ensure comprehensive
 *   monitoring and optimization tools.
 * 
 * Human Tasks:
 * 1. Review and adjust validation thresholds for metrics based on production usage patterns
 * 2. Configure monitoring alerts for validation failures in production environment
 * 3. Ensure error messages are properly integrated with the logging system
 */

import { AnalyticsData } from '../../types/analytics.types';
import { validateWorkflow, validateIntegration } from '../../utils/validation.util';
import { ERROR_CODES } from '../../constants/error.constants';

/**
 * Validates an analytics data object to ensure all its components adhere to predefined constraints
 * 
 * @param data - The analytics data object to validate
 * @returns true if validation passes
 * @throws Error with ValidationError code if validation fails
 */
export const validateAnalyticsData = (data: AnalyticsData): boolean => {
  // Validate data existence
  if (!data) {
    throw new Error(`${ERROR_CODES.ValidationError}: Analytics data object is required`);
  }

  // Validate workflow component
  try {
    validateWorkflow(data.workflow);
  } catch (error) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid workflow in analytics data - ${error.message}`);
  }

  // Validate integration component
  try {
    validateIntegration(data.integration);
  } catch (error) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid integration in analytics data - ${error.message}`);
  }

  // Validate connector
  if (!data.connector) {
    throw new Error(`${ERROR_CODES.ValidationError}: Connector is required in analytics data`);
  }
  if (!data.connector.id || typeof data.connector.id !== 'string' || data.connector.id.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid connector ID in analytics data`);
  }

  // Validate execution
  if (!data.execution) {
    throw new Error(`${ERROR_CODES.ValidationError}: Execution is required in analytics data`);
  }
  if (!data.execution.id || typeof data.execution.id !== 'string' || data.execution.id.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid execution ID in analytics data`);
  }

  // Validate timestamp
  if (!(data.timestamp instanceof Date) || isNaN(data.timestamp.getTime())) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid timestamp in analytics data`);
  }

  // Validate metrics object
  if (!data.metrics || typeof data.metrics !== 'object') {
    throw new Error(`${ERROR_CODES.ValidationError}: Metrics object is required in analytics data`);
  }

  // Validate metric values if present
  if (data.metrics.executionTime !== undefined && 
      (typeof data.metrics.executionTime !== 'number' || data.metrics.executionTime < 0)) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid executionTime metric - must be a non-negative number`);
  }

  if (data.metrics.memoryUsage !== undefined && 
      (typeof data.metrics.memoryUsage !== 'number' || data.metrics.memoryUsage < 0)) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid memoryUsage metric - must be a non-negative number`);
  }

  if (data.metrics.apiCalls !== undefined && 
      (typeof data.metrics.apiCalls !== 'number' || data.metrics.apiCalls < 0 || !Number.isInteger(data.metrics.apiCalls))) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid apiCalls metric - must be a non-negative integer`);
  }

  if (data.metrics.dataProcessed !== undefined && 
      (typeof data.metrics.dataProcessed !== 'number' || data.metrics.dataProcessed < 0)) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid dataProcessed metric - must be a non-negative number`);
  }

  return true;
};