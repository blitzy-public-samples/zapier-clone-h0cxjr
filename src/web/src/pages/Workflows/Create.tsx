/**
 * Human Tasks:
 * 1. Review workflow creation flow with UX team
 * 2. Verify default workflow name configuration with business stakeholders
 * 3. Test workflow creation with large configurations
 * 4. Ensure accessibility compliance for workflow creation interface
 */

// React v18.2.0
import React, { useCallback, useEffect } from 'react';

// Internal imports with relative paths
import Builder from '../../components/workflow/Builder/Builder';
import useWorkflow from '../../hooks/useWorkflow';
import { actions } from '../../store/slices/workflowSlice';
import { DEFAULT_WORKFLOW_NAME } from '../../constants/workflow.constants';
import useNotification from '../../hooks/useNotification';
import { validateWorkflowData } from '../../utils/validation.util';
import { Workflow } from '../../types/workflow.types';

/**
 * CreateWorkflowPage component for creating new workflows
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Implements the workflow creation page, allowing users to create workflows using
 *   a visual drag-and-drop interface.
 */
const CreateWorkflowPage: React.FC = () => {
  // Get workflow management functions from custom hook
  const {
    createWorkflow,
    loading,
    error,
    resetError
  } = useWorkflow();

  // Get notification functions from custom hook
  const notification = useNotification();

  /**
   * Handle workflow creation
   * Validates and creates a new workflow with the provided data
   */
  const handleWorkflowCreate = useCallback(async (workflowData: Partial<Workflow>) => {
    try {
      // Create workflow data object with default name if not provided
      const newWorkflow: Workflow = {
        workflowId: `workflow_${Date.now()}`,
        name: workflowData.name || DEFAULT_WORKFLOW_NAME,
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate workflow data
      if (!validateWorkflowData(newWorkflow)) {
        notification.error('Invalid workflow configuration');
        return;
      }

      // Create the workflow
      await createWorkflow(newWorkflow);
      notification.success('Workflow created successfully');
    } catch (error) {
      notification.error('Failed to create workflow');
      console.error('Error creating workflow:', error);
    }
  }, [createWorkflow, notification]);

  /**
   * Handle error display
   * Shows error notifications when workflow errors occur
   */
  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  /**
   * Reset error state when component unmounts
   */
  useEffect(() => {
    return () => {
      resetError();
    };
  }, [resetError]);

  return (
    <div className="create-workflow-page">
      <div className="create-workflow-page__header">
        <h1 className="create-workflow-page__title">
          Create New Workflow
        </h1>
      </div>

      <div className="create-workflow-page__content">
        <Builder />
      </div>

      {loading && (
        <div className="create-workflow-page__loading">
          <div className="create-workflow-page__loading-indicator">
            Creating workflow...
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkflowPage;