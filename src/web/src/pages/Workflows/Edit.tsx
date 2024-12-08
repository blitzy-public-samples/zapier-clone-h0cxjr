/**
 * Human Tasks:
 * 1. Review workflow validation rules with business stakeholders
 * 2. Verify error handling and notification messages with UX team
 * 3. Test workflow editing performance with large workflow configurations
 * 4. Ensure accessibility compliance for editing interface
 */

// React v18.2.0
import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Internal component imports
import Builder from '../../components/workflow/Builder/Builder';
import PropertyPanel from '../../components/workflow/PropertyPanel/PropertyPanel';
import Canvas from '../../components/workflow/Canvas/Canvas';

// Hooks and services
import useWorkflow from '../../hooks/useWorkflow';
import useNotification from '../../hooks/useNotification';
import { updateWorkflow } from '../../services/workflow.service';

// Types
import { Workflow } from '../../types/workflow.types';
import { validateWorkflowData } from '../../utils/validation.util';

/**
 * EditWorkflowPage component for modifying existing workflows
 * Requirements Addressed:
 * - Workflow Management (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a user interface for editing workflows, ensuring flexibility and customization.
 */
const EditWorkflowPage: React.FC = () => {
  // Get workflow ID from URL parameters
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  
  // Custom hooks for workflow management and notifications
  const { 
    workflows,
    loading,
    error,
    updateWorkflow: updateWorkflowState,
    getWorkflows
  } = useWorkflow();
  
  const notification = useNotification();

  // Local state for the workflow being edited
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load workflow data on component mount
  useEffect(() => {
    if (workflowId) {
      const workflow = workflows.find(w => w.workflowId === workflowId);
      if (workflow) {
        setCurrentWorkflow(workflow);
      } else {
        getWorkflows();
      }
    }
  }, [workflowId, workflows, getWorkflows]);

  /**
   * Handle workflow updates from the Builder component
   */
  const handleWorkflowUpdate = useCallback(async (updatedWorkflow: Workflow) => {
    if (!validateWorkflowData(updatedWorkflow)) {
      notification.error('Invalid workflow configuration');
      return;
    }

    setIsSaving(true);
    try {
      await updateWorkflow(updatedWorkflow);
      await updateWorkflowState(updatedWorkflow);
      setCurrentWorkflow(updatedWorkflow);
      notification.success('Workflow updated successfully');
    } catch (error) {
      notification.error('Failed to update workflow');
      console.error('Error updating workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }, [updateWorkflow, updateWorkflowState, notification]);

  /**
   * Handle navigation back to workflows list
   */
  const handleCancel = useCallback(() => {
    navigate('/workflows');
  }, [navigate]);

  // Show loading state
  if (loading || !currentWorkflow) {
    return (
      <div className="workflow-edit-page workflow-edit-page--loading">
        <div className="workflow-edit-page__loading-indicator">
          Loading workflow...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="workflow-edit-page workflow-edit-page--error">
        <div className="workflow-edit-page__error-message">
          {error}
        </div>
        <button 
          className="workflow-edit-page__retry-button"
          onClick={() => getWorkflows()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="workflow-edit-page">
      <div className="workflow-edit-page__header">
        <h1 className="workflow-edit-page__title">
          Edit Workflow: {currentWorkflow.name}
        </h1>
        <div className="workflow-edit-page__actions">
          <button
            className="workflow-edit-page__button workflow-edit-page__button--secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="workflow-edit-page__content">
        <div className="workflow-edit-page__builder">
          <Builder
            workflow={currentWorkflow}
            onWorkflowUpdate={handleWorkflowUpdate}
            isEditable={!isSaving}
          />
        </div>

        <div className="workflow-edit-page__canvas">
          <Canvas
            workflow={currentWorkflow}
            onWorkflowUpdate={handleWorkflowUpdate}
            isEditable={!isSaving}
          />
        </div>

        <div className="workflow-edit-page__properties">
          <PropertyPanel
            selectedStepId={currentWorkflow.workflowId}
            onPropertiesUpdate={(stepId, properties) => {
              if (currentWorkflow) {
                handleWorkflowUpdate({
                  ...currentWorkflow,
                  ...properties
                });
              }
            }}
            isReadOnly={isSaving}
          />
        </div>
      </div>

      {isSaving && (
        <div className="workflow-edit-page__saving-overlay">
          <div className="workflow-edit-page__saving-indicator">
            Saving workflow...
          </div>
        </div>
      )}
    </div>
  );
};

export default EditWorkflowPage;