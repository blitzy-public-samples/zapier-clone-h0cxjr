/**
 * @fileoverview Implements the WorkflowOptimizer class for optimizing workflow definitions
 * Addresses requirement: Workflow Optimization from Technical Specification/Core Features and Functionalities/Workflow Creation
 * 
 * Human Tasks:
 * 1. Review and adjust optimization thresholds based on production usage patterns
 * 2. Configure monitoring for optimization performance metrics
 * 3. Set up alerts for optimization failures or degraded performance
 */

import { WorkflowValidator } from './WorkflowValidator';
import { ExecutionContext } from './ExecutionContext';
import { WorkflowType } from '../../types/workflow.types';
import { validateWorkflow } from '../../utils/validation.util';
import { logInfo } from '../../utils/logger.util';

/**
 * Class responsible for optimizing workflow definitions by analyzing their structure,
 * removing redundancies, and ensuring efficient execution.
 * Addresses requirement: Workflow Optimization - Implements optimization mechanisms
 */
export class WorkflowOptimizer {
  private validator: WorkflowValidator;
  private executionContext: ExecutionContext;

  /**
   * Initializes the WorkflowOptimizer with required dependencies
   * @param validator - Instance of WorkflowValidator for workflow validation
   * @param executionContext - Instance of ExecutionContext for workflow data access
   */
  constructor(validator: WorkflowValidator, executionContext: ExecutionContext) {
    this.validator = validator;
    this.executionContext = executionContext;
  }

  /**
   * Optimizes a workflow definition by analyzing its structure and removing redundancies
   * Addresses requirement: Workflow Optimization - Enhances workflow efficiency
   * 
   * @param workflow - The workflow definition to optimize
   * @returns The optimized workflow definition
   */
  public async optimize(workflow: WorkflowType): Promise<WorkflowType> {
    logInfo('Starting workflow optimization', { workflowId: workflow.id });

    // Validate the input workflow
    validateWorkflow(workflow);

    // Retrieve additional workflow data if needed
    const workflowData = await this.executionContext.getWorkflowData(workflow.id);

    // Create a deep copy of the workflow for optimization
    const optimizedWorkflow: WorkflowType = JSON.parse(JSON.stringify(workflow));

    // Optimize workflow structure
    this.optimizeWorkflowStructure(optimizedWorkflow);

    // Remove redundant nodes
    this.removeRedundantNodes(optimizedWorkflow);

    // Optimize transitions
    this.optimizeTransitions(optimizedWorkflow);

    // Validate the optimized workflow
    await this.validator.validate(optimizedWorkflow);

    logInfo('Workflow optimization completed', { 
      workflowId: workflow.id,
      originalNodes: workflow['nodes']?.length,
      optimizedNodes: optimizedWorkflow['nodes']?.length
    });

    return optimizedWorkflow;
  }

  /**
   * Optimizes the workflow structure by analyzing and reorganizing nodes
   * @private
   * @param workflow - The workflow to optimize
   */
  private optimizeWorkflowStructure(workflow: WorkflowType): void {
    if (!workflow['nodes']) return;

    const nodes = workflow['nodes'] as any[];

    // Analyze node dependencies and reorder for optimal execution
    nodes.sort((a, b) => {
      // Prioritize START nodes
      if (a.type === 'START') return -1;
      if (b.type === 'START') return 1;
      // Place END nodes last
      if (a.type === 'END') return 1;
      if (b.type === 'END') return -1;
      // Sort other nodes by dependencies
      return (a.dependencies?.length || 0) - (b.dependencies?.length || 0);
    });

    workflow['nodes'] = nodes;
  }

  /**
   * Removes redundant nodes from the workflow
   * @private
   * @param workflow - The workflow to optimize
   */
  private removeRedundantNodes(workflow: WorkflowType): void {
    if (!workflow['nodes'] || !workflow['transitions']) return;

    const nodes = workflow['nodes'] as any[];
    const transitions = workflow['transitions'] as any[];

    // Identify and remove pass-through nodes (nodes with single input and output)
    const redundantNodes = nodes.filter(node => {
      if (node.type === 'START' || node.type === 'END') return false;
      
      const incomingTransitions = transitions.filter(t => t.to === node.id);
      const outgoingTransitions = transitions.filter(t => t.from === node.id);
      
      return incomingTransitions.length === 1 && outgoingTransitions.length === 1 && !node.transformation;
    });

    // Remove redundant nodes and update transitions
    redundantNodes.forEach(node => {
      const incomingTransition = transitions.find(t => t.to === node.id);
      const outgoingTransition = transitions.find(t => t.from === node.id);

      if (incomingTransition && outgoingTransition) {
        // Create direct transition bypassing the redundant node
        transitions.push({
          from: incomingTransition.from,
          to: outgoingTransition.to,
          condition: incomingTransition.condition || outgoingTransition.condition
        });

        // Remove old transitions
        const transitionsToRemove = transitions.filter(t => 
          t.from === node.id || t.to === node.id
        );
        transitionsToRemove.forEach(t => {
          const index = transitions.indexOf(t);
          if (index > -1) transitions.splice(index, 1);
        });

        // Remove the redundant node
        const nodeIndex = nodes.indexOf(node);
        if (nodeIndex > -1) nodes.splice(nodeIndex, 1);
      }
    });

    workflow['nodes'] = nodes;
    workflow['transitions'] = transitions;
  }

  /**
   * Optimizes workflow transitions by removing unnecessary conditions and merging paths
   * @private
   * @param workflow - The workflow to optimize
   */
  private optimizeTransitions(workflow: WorkflowType): void {
    if (!workflow['transitions']) return;

    const transitions = workflow['transitions'] as any[];

    // Remove duplicate transitions
    const uniqueTransitions = new Map<string, any>();
    transitions.forEach(transition => {
      const key = `${transition.from}-${transition.to}`;
      if (!uniqueTransitions.has(key) || 
          !transition.condition || 
          transition.condition === 'true') {
        uniqueTransitions.set(key, transition);
      }
    });

    // Merge parallel paths with same conditions
    const mergedTransitions = Array.from(uniqueTransitions.values()).reduce((acc, transition) => {
      const existing = acc.find(t => 
        t.from === transition.from && 
        t.condition === transition.condition
      );

      if (existing) {
        existing.to = [existing.to, transition.to].flat();
      } else {
        acc.push(transition);
      }

      return acc;
    }, [] as any[]);

    workflow['transitions'] = mergedTransitions;
  }
}