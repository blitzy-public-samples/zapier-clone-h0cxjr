/**
 * @fileoverview Workflow Validator implementation for ensuring workflow definitions meet required standards
 * Addresses requirement: Workflow Validation from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review and adjust validation thresholds based on production usage patterns
 * 2. Configure monitoring for validation failures to detect potential issues
 * 3. Ensure error messages are properly integrated with the application's logging strategy
 */

import { IWorkflow } from '../../interfaces/IWorkflow';
import { validateWorkflow } from '../../utils/validation.util';
import { ERROR_CODES } from '../../constants/error.constants';
import {
  MIN_WORKFLOW_NODES,
  MAX_WORKFLOW_NODES,
  MAX_WORKFLOW_NESTING_DEPTH,
  WORKFLOW_NAME_REGEX
} from '../../constants/workflow.constants';

/**
 * Validates a workflow definition to ensure it adheres to all predefined constraints
 * Addresses requirement: Workflow Validation - Ensures workflows meet structural and business rules
 * 
 * @param workflow - The workflow definition to validate
 * @returns true if the workflow is valid
 * @throws Error with ValidationError code if validation fails
 */
export const validateWorkflowDefinition = (workflow: IWorkflow): boolean => {
  // First, perform basic workflow validation using the utility function
  validateWorkflow(workflow);

  // Additional structural validations specific to workflow definitions
  
  // Validate workflow name format using regex
  if (!WORKFLOW_NAME_REGEX.test(workflow.name)) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Workflow name contains invalid characters. ` +
      'Only alphanumeric characters, spaces, and common punctuation are allowed.'
    );
  }

  // Validate workflow nodes if present
  if (workflow['nodes']) {
    const nodes = workflow['nodes'] as any[];
    
    // Check minimum required nodes
    if (nodes.length < MIN_WORKFLOW_NODES) {
      throw new Error(
        `${ERROR_CODES.ValidationError}: Workflow must contain at least ${MIN_WORKFLOW_NODES} nodes ` +
        '(start and end nodes).'
      );
    }

    // Check maximum allowed nodes
    if (nodes.length > MAX_WORKFLOW_NODES) {
      throw new Error(
        `${ERROR_CODES.ValidationError}: Workflow exceeds maximum allowed nodes (${MAX_WORKFLOW_NODES}).`
      );
    }

    // Validate start and end nodes existence
    const hasStartNode = nodes.some(node => node.type === 'START');
    const hasEndNode = nodes.some(node => node.type === 'END');

    if (!hasStartNode || !hasEndNode) {
      throw new Error(
        `${ERROR_CODES.ValidationError}: Workflow must contain both START and END nodes.`
      );
    }
  }

  // Validate nesting depth if workflow contains subworkflows
  if (workflow['subworkflows']) {
    const validateNestingDepth = (subworkflows: any[], currentDepth: number = 1): void => {
      if (currentDepth > MAX_WORKFLOW_NESTING_DEPTH) {
        throw new Error(
          `${ERROR_CODES.ValidationError}: Workflow exceeds maximum nesting depth of ` +
          `${MAX_WORKFLOW_NESTING_DEPTH} levels.`
        );
      }

      for (const subworkflow of subworkflows) {
        if (subworkflow.subworkflows) {
          validateNestingDepth(subworkflow.subworkflows, currentDepth + 1);
        }
      }
    };

    validateNestingDepth(workflow['subworkflows'] as any[]);
  }

  // Validate workflow transitions if present
  if (workflow['transitions']) {
    const transitions = workflow['transitions'] as any[];
    
    // Check for duplicate transitions
    const transitionKeys = new Set<string>();
    for (const transition of transitions) {
      const key = `${transition.from}-${transition.to}`;
      if (transitionKeys.has(key)) {
        throw new Error(
          `${ERROR_CODES.ValidationError}: Duplicate transition detected between nodes ` +
          `${transition.from} and ${transition.to}.`
        );
      }
      transitionKeys.add(key);
    }

    // Ensure all transitions reference existing nodes
    if (workflow['nodes']) {
      const nodes = workflow['nodes'] as any[];
      const nodeIds = new Set(nodes.map(node => node.id));

      for (const transition of transitions) {
        if (!nodeIds.has(transition.from) || !nodeIds.has(transition.to)) {
          throw new Error(
            `${ERROR_CODES.ValidationError}: Transition references non-existent node(s).`
          );
        }
      }
    }
  }

  return true;
};