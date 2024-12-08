/**
 * @fileoverview Validation utilities for workflow and integration objects
 * Addresses requirement: Data Validation from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review and adjust validation rules based on specific business requirements
 * 2. Ensure error messages are aligned with the application's localization strategy
 * 3. Consider adding custom validation rules for specific workflow types if needed
 */

import { ERROR_CODES } from '../constants/error.constants';
import { 
  WORKFLOW_STATUSES, 
  MAX_WORKFLOW_NAME_LENGTH 
} from '../constants/workflow.constants';
import { SUPPORTED_PROTOCOLS } from '../constants/integration.constants';
import { IWorkflow } from '../interfaces/IWorkflow';
import { IIntegration } from '../interfaces/IIntegration';

/**
 * Validates a workflow object to ensure it adheres to predefined constraints
 * Addresses requirement: Data Validation - Ensures data integrity for workflow objects
 * 
 * @param workflow - The workflow object to validate
 * @returns true if validation passes
 * @throws Error with ValidationError code if validation fails
 */
export const validateWorkflow = (workflow: IWorkflow): boolean => {
  // Validate workflow existence
  if (!workflow) {
    throw new Error(`${ERROR_CODES.ValidationError}: Workflow object is required`);
  }

  // Validate workflow ID
  if (!workflow.id || typeof workflow.id !== 'string' || workflow.id.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid workflow ID`);
  }

  // Validate workflow name
  if (!workflow.name || typeof workflow.name !== 'string') {
    throw new Error(`${ERROR_CODES.ValidationError}: Workflow name is required and must be a string`);
  }

  if (workflow.name.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Workflow name cannot be empty`);
  }

  if (workflow.name.length > MAX_WORKFLOW_NAME_LENGTH) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Workflow name exceeds maximum length of ${MAX_WORKFLOW_NAME_LENGTH} characters`
    );
  }

  // Validate workflow status
  if (!workflow.status || !WORKFLOW_STATUSES.includes(workflow.status as any)) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Invalid workflow status. Must be one of: ${WORKFLOW_STATUSES.join(', ')}`
    );
  }

  // Validate timestamps
  if (!(workflow.createdAt instanceof Date) || isNaN(workflow.createdAt.getTime())) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid createdAt timestamp`);
  }

  if (!(workflow.updatedAt instanceof Date) || isNaN(workflow.updatedAt.getTime())) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid updatedAt timestamp`);
  }

  if (workflow.updatedAt < workflow.createdAt) {
    throw new Error(`${ERROR_CODES.ValidationError}: updatedAt cannot be earlier than createdAt`);
  }

  return true;
};

/**
 * Validates an integration object to ensure it adheres to predefined constraints
 * Addresses requirement: Data Validation - Ensures data integrity for integration configurations
 * 
 * @param integration - The integration object to validate
 * @returns true if validation passes
 * @throws Error with ValidationError code if validation fails
 */
export const validateIntegration = (integration: IIntegration): boolean => {
  // Validate integration existence
  if (!integration) {
    throw new Error(`${ERROR_CODES.ValidationError}: Integration object is required`);
  }

  // Validate integration ID
  if (!integration.id || typeof integration.id !== 'string' || integration.id.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid integration ID`);
  }

  // Validate integration name
  if (!integration.name || typeof integration.name !== 'string' || integration.name.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Integration name is required and must be a non-empty string`);
  }

  // Validate protocol
  if (!integration.protocol || !SUPPORTED_PROTOCOLS.includes(integration.protocol as any)) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Invalid integration protocol. Must be one of: ${SUPPORTED_PROTOCOLS.join(', ')}`
    );
  }

  // Validate retry count
  if (typeof integration.retryCount !== 'number' || integration.retryCount < 0 || !Number.isInteger(integration.retryCount)) {
    throw new Error(`${ERROR_CODES.ValidationError}: Retry count must be a non-negative integer`);
  }

  // Validate timeout
  if (typeof integration.timeout !== 'number' || integration.timeout <= 0 || !Number.isInteger(integration.timeout)) {
    throw new Error(`${ERROR_CODES.ValidationError}: Timeout must be a positive integer`);
  }

  return true;
};