/**
 * Human Tasks:
 * 1. Review workflow view layout with UX team for optimal information display
 * 2. Verify accessibility of workflow visualization components
 * 3. Test performance with complex workflow structures
 * 4. Confirm error handling patterns meet business requirements
 */

// React v18.2.0
import React, { useEffect, useState } from 'react';
// React Router v6.14.1
import { useParams, useNavigate } from 'react-router-dom';

// Internal imports with relative paths
import Canvas from '../../components/workflow/Canvas/Canvas';
import PropertyPanel from '../../components/workflow/PropertyPanel/PropertyPanel';
import StepLibrary from '../../components/workflow/StepLibrary/StepLibrary';
import useWorkflow from '../../hooks/useWorkflow';
import { getWorkflows } from '../../services/workflow.service';
import { Workflow } from '../../types/workflow.types';
import { validateWorkflowData } from '../../utils/validation.util';

/**
 * ViewWorkflowPage component for displaying detailed workflow information
 * Requirements Addressed:
 * - Workflow Management (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a user interface for viewing detailed information about workflows,
 *   including their structure and properties.
 */
const ViewWorkflowPage: React.FC = () => {
  // Get workflow ID from URL parameters
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();

  // Get workflow management functions from custom hook
  const {
    workflows,
    loading,
    error,
    getWorkflows: refreshWorkflows,
    updateWorkflow
  } = useWorkflow();

  // State for the current workflow being viewed
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Fetch workflow data when component mounts or workflowId changes
  useEffect(() => {
    const fetchWorkflowData = async () => {
      if (!workflowId) {
        navigate('/workflows');
        return;
      }

      try {
        // Refresh workflows list
        await refreshWorkflows();
        
        // Find the requested workflow
        const workflow = workflows.find(w => w.workflowId === workflowId);
        
        if (workflow && validateWorkflowData(workflow)) {
          setCurrentWorkflow(workflow);
        } else {
          navigate('/workflows', { 
            state: { error: 'Workflow not found or invalid' }
          });
        }
      } catch (error) {
        console.error('Error fetching workflow:', error);
        navigate('/workflows', {
          state: { error: 'Failed to load workflow' }
        });
      }
    };

    fetchWorkflowData();
  }, [workflowId, refreshWorkflows, workflows, navigate]);

  /**
   * Handle workflow updates from the Canvas component
   */
  const handleWorkflowUpdate = async (updatedWorkflow: Workflow) => {
    if (!validateWorkflowData(updatedWorkflow)) {
      console.error('Invalid workflow data');
      return;
    }

    try {
      await updateWorkflow(updatedWorkflow);
      setCurrentWorkflow(updatedWorkflow);
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  };

  /**
   * Handle step selection in the Canvas
   */
  const handleStepSelect = (stepId: string | null) => {
    setSelectedStepId(stepId);
  };

  /**
   * Handle property updates from the PropertyPanel
   */
  const handlePropertiesUpdate = async (
    stepId: string,
    properties: any
  ) => {
    if (!currentWorkflow) return;

    try {
      const updatedWorkflow = {
        ...currentWorkflow,
        steps: currentWorkflow.steps?.map(step =>
          step.id === stepId
            ? { ...step, ...properties }
            : step
        ) || []
      };

      if (validateWorkflowData(updatedWorkflow)) {
        await updateWorkflow(updatedWorkflow);
        setCurrentWorkflow(updatedWorkflow);
      }
    } catch (error) {
      console.error('Error updating step properties:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="workflow-view workflow-view--loading">
        <div className="workflow-view__loading-indicator">
          Loading workflow...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="workflow-view workflow-view--error">
        <div className="workflow-view__error-message">
          {error}
        </div>
        <button
          className="workflow-view__back-button"
          onClick={() => navigate('/workflows')}
        >
          Back to Workflows
        </button>
      </div>
    );
  }

  return (
    <div className="workflow-view">
      <div className="workflow-view__header">
        <h1 className="workflow-view__title">
          {currentWorkflow?.name || 'View Workflow'}
        </h1>
        <div className="workflow-view__actions">
          <button
            className="workflow-view__back-button"
            onClick={() => navigate('/workflows')}
          >
            Back to Workflows
          </button>
          <button
            className="workflow-view__edit-button"
            onClick={() => navigate(`/workflows/${workflowId}/edit`)}
          >
            Edit Workflow
          </button>
        </div>
      </div>

      <div className="workflow-view__content">
        <div className="workflow-view__main">
          <Canvas
            workflow={currentWorkflow}
            onWorkflowUpdate={handleWorkflowUpdate}
            onStepSelect={handleStepSelect}
            isEditable={false}
          />
        </div>

        <div className="workflow-view__sidebar">
          <PropertyPanel
            selectedStepId={selectedStepId}
            onPropertiesUpdate={handlePropertiesUpdate}
            isReadOnly={true}
          />
          <StepLibrary />
        </div>
      </div>
    </div>
  );
};

export default ViewWorkflowPage;