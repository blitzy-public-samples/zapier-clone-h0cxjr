/**
 * @fileoverview Provides validation functions for execution-related entities
 * Addresses requirement: Execution Features from Technical Specification/Core Features and Functionalities/Execution Features
 * 
 * Human Tasks:
 * 1. Review and adjust validation rules based on specific business requirements
 * 2. Consider adding custom validation rules for specific workflow types
 * 3. Ensure error messages are aligned with the application's localization strategy
 */

import { ExecutionStatus } from '../../types/execution.types';
import { validateWorkflow } from '../../utils/validation.util';
import { ERROR_CODES } from '../../constants/error.constants';
import { IExecution } from '../../interfaces/IExecution';

/**
 * Validates an execution object to ensure it adheres to predefined constraints
 * Addresses requirement: Execution Features - Ensures data integrity and adherence to predefined constraints
 * 
 * @param execution - The execution object to validate
 * @returns true if validation passes
 * @throws Error with ValidationError code if validation fails
 */
export const validateExecution = (execution: IExecution): boolean => {
  // Validate execution existence
  if (!execution) {
    throw new Error(`${ERROR_CODES.ValidationError}: Execution object is required`);
  }

  // Validate execution ID
  if (!execution.id || typeof execution.id !== 'string' || execution.id.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid execution ID`);
  }

  // Validate workflow ID
  if (!execution.workflowId || typeof execution.workflowId !== 'string' || execution.workflowId.trim().length === 0) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid workflow ID`);
  }

  // Validate execution status
  const validStatuses = [
    ExecutionStatus.PENDING,
    ExecutionStatus.RUNNING,
    ExecutionStatus.COMPLETED,
    ExecutionStatus.FAILED
  ];

  if (!execution.status || !validStatuses.includes(execution.status as ExecutionStatus)) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Invalid execution status. Must be one of: ${validStatuses.join(', ')}`
    );
  }

  // Validate execution context
  if (!execution.context || typeof execution.context !== 'object') {
    throw new Error(`${ERROR_CODES.ValidationError}: Execution context is required and must be an object`);
  }

  // Validate context variables
  if (!execution.context.variables || typeof execution.context.variables !== 'object') {
    throw new Error(`${ERROR_CODES.ValidationError}: Context variables must be an object`);
  }

  // Validate timestamps
  if (!(execution.startedAt instanceof Date) || isNaN(execution.startedAt.getTime())) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid startedAt timestamp`);
  }

  // Validate completedAt if present
  if (execution.completedAt !== null) {
    if (!(execution.completedAt instanceof Date) || isNaN(execution.completedAt.getTime())) {
      throw new Error(`${ERROR_CODES.ValidationError}: Invalid completedAt timestamp`);
    }

    // Ensure completedAt is after startedAt
    if (execution.completedAt < execution.startedAt) {
      throw new Error(`${ERROR_CODES.ValidationError}: completedAt cannot be earlier than startedAt`);
    }
  }

  // Validate error details if present
  if (execution.context.lastError) {
    const { message, code, timestamp, nodeId } = execution.context.lastError;

    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new Error(`${ERROR_CODES.ValidationError}: Error message is required when lastError is present`);
    }

    if (typeof code !== 'string' || code.trim().length === 0) {
      throw new Error(`${ERROR_CODES.ValidationError}: Error code is required when lastError is present`);
    }

    if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      throw new Error(`${ERROR_CODES.ValidationError}: Invalid error timestamp`);
    }

    if (nodeId && (typeof nodeId !== 'string' || nodeId.trim().length === 0)) {
      throw new Error(`${ERROR_CODES.ValidationError}: Invalid nodeId in error details`);
    }
  }

  // Validate retry count if present
  if (execution.context.retryCount !== undefined) {
    if (typeof execution.context.retryCount !== 'number' || 
        execution.context.retryCount < 0 || 
        !Number.isInteger(execution.context.retryCount)) {
      throw new Error(`${ERROR_CODES.ValidationError}: Retry count must be a non-negative integer`);
    }
  }

  // Validate metadata if present
  if (execution.context.metadata !== undefined && 
      (typeof execution.context.metadata !== 'object' || execution.context.metadata === null)) {
    throw new Error(`${ERROR_CODES.ValidationError}: Execution metadata must be an object`);
  }

  // Validate the associated workflow
  try {
    validateWorkflow({ id: execution.workflowId } as any);
  } catch (error) {
    throw new Error(`${ERROR_CODES.ValidationError}: Invalid associated workflow - ${error.message}`);
  }

  return true;
};