/**
 * Human Tasks:
 * 1. Review drag-and-drop interaction patterns with UX team
 * 2. Verify workflow validation rules with business stakeholders
 * 3. Test component performance with large workflow configurations
 * 4. Ensure accessibility compliance for drag-and-drop operations
 */

// React v18.2.0
import React, { useState, useCallback, useEffect } from 'react';

// Internal imports with relative paths
import { Canvas } from '../Canvas/Canvas';
import PropertyPanel from '../PropertyPanel/PropertyPanel';
import useWorkflow from '../../hooks/useWorkflow';
import useNotification from '../../hooks/useNotification';
import { validateWorkflowData } from '../../utils/validation.util';
import { Workflow } from '../../types/workflow.types';

/**
 * Builder component for creating and managing workflows
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a visual drag-and-drop builder for creating workflows.
 */
const Builder: React.FC = () => {
  // Get workflow management functions from custom hook
  const {
    workflows,
    loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow
  } = useWorkflow();

  // Get notification functions from custom hook
  const notification = useNotification();

  // State for tracking the selected workflow step
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // State for tracking the current workflow being edited
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);

  /**
   * Handle workflow updates from the Canvas component
   */
  const handleWorkflowUpdate = useCallback((updatedWorkflow: Workflow) => {
    if (!validateWorkflowData(updatedWorkflow)) {
      notification.error('Invalid workflow configuration');
      return;
    }

    try {
      updateWorkflow(updatedWorkflow);
      setCurrentWorkflow(updatedWorkflow);
      notification.success('Workflow updated successfully');
    } catch (error) {
      notification.error('Failed to update workflow');
      console.error('Error updating workflow:', error);
    }
  }, [updateWorkflow, notification]);

  /**
   * Handle property updates from the PropertyPanel component
   */
  const handlePropertiesUpdate = useCallback((
    stepId: string,
    properties: any
  ) => {
    if (!currentWorkflow) return;

    try {
      const updatedWorkflow = {
        ...currentWorkflow,
        // Update the specific step's properties
        steps: currentWorkflow.steps?.map(step =>
          step.id === stepId
            ? { ...step, ...properties }
            : step
        ) || []
      };

      if (!validateWorkflowData(updatedWorkflow)) {
        notification.error('Invalid workflow configuration');
        return;
      }

      updateWorkflow(updatedWorkflow);
      setCurrentWorkflow(updatedWorkflow);
      notification.success('Step properties updated successfully');
    } catch (error) {
      notification.error('Failed to update step properties');
      console.error('Error updating step properties:', error);
    }
  }, [currentWorkflow, updateWorkflow, notification]);

  /**
   * Handle step selection from the Canvas component
   */
  const handleStepSelect = useCallback((stepId: string | null) => {
    setSelectedStepId(stepId);
  }, []);

  /**
   * Display error notifications when workflow errors occur
   */
  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  return (
    <div className="workflow-builder">
      <div className="workflow-builder__canvas">
        <Canvas
          workflow={currentWorkflow}
          onWorkflowUpdate={handleWorkflowUpdate}
          onStepSelect={handleStepSelect}
          isEditable={!loading}
        />
      </div>
      
      <div className="workflow-builder__properties">
        <PropertyPanel
          selectedStepId={selectedStepId}
          onPropertiesUpdate={handlePropertiesUpdate}
          isReadOnly={loading}
        />
      </div>

      {loading && (
        <div className="workflow-builder__loading">
          <div className="workflow-builder__loading-indicator">
            Loading workflow...
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;