/**
 * @fileoverview Custom React hook for managing workflows, providing state management and API interactions.
 * Requirements addressed:
 * - Workflow Management (Technical Specification/Scope/Core Features and Functionalities)
 *   Implements a custom hook to manage workflows, integrating state management and API interactions.
 */

/**
 * Human Tasks:
 * 1. Review error handling strategies for production use
 * 2. Verify workflow validation rules match business requirements
 * 3. Confirm state management patterns align with team standards
 */

// react version ^18.2.0
import { useState, useEffect, useCallback } from 'react';
// react-redux version ^8.0.5
import { useDispatch, useSelector } from 'react-redux';

import { Workflow } from '../types/workflow.types';
import { WorkflowService } from '../services/workflow.service';
import { validateWorkflowData } from '../utils/validation.util';
import {
  fetchWorkflows,
  addWorkflow,
  editWorkflow,
  removeWorkflow,
  setError,
} from '../store/slices/workflowSlice';
import type { RootState } from '../store/store';

interface UseWorkflowReturn {
  workflows: Workflow[];
  loading: boolean;
  error: string | null;
  getWorkflows: () => Promise<void>;
  createWorkflow: (workflowData: Workflow) => Promise<void>;
  updateWorkflow: (workflowData: Workflow) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  resetError: () => void;
}

/**
 * Custom hook for managing workflows, providing state management and API interactions
 * @returns Object containing workflow state and management functions
 */
const useWorkflow = (): UseWorkflowReturn => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Select workflow state from Redux store
  const workflows = useSelector((state: RootState) => state.workflow.workflows);
  const loading = useSelector((state: RootState) => state.workflow.loading);
  const error = useSelector((state: RootState) => state.workflow.error);

  /**
   * Fetches all workflows from the backend
   */
  const getWorkflows = useCallback(async () => {
    try {
      await dispatch(fetchWorkflows()).unwrap();
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  }, [dispatch]);

  /**
   * Creates a new workflow
   * @param workflowData - The workflow data to create
   */
  const createWorkflow = useCallback(async (workflowData: Workflow) => {
    try {
      if (!validateWorkflowData(workflowData)) {
        dispatch(setError('Invalid workflow data'));
        return;
      }
      await dispatch(addWorkflow(workflowData)).unwrap();
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  }, [dispatch]);

  /**
   * Updates an existing workflow
   * @param workflowData - The updated workflow data
   */
  const updateWorkflow = useCallback(async (workflowData: Workflow) => {
    try {
      if (!validateWorkflowData(workflowData)) {
        dispatch(setError('Invalid workflow data'));
        return;
      }
      await dispatch(editWorkflow(workflowData)).unwrap();
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  }, [dispatch]);

  /**
   * Deletes a workflow
   * @param workflowId - The ID of the workflow to delete
   */
  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      if (!workflowId || typeof workflowId !== 'string' || workflowId.trim() === '') {
        dispatch(setError('Invalid workflow ID'));
        return;
      }
      await dispatch(removeWorkflow(workflowId)).unwrap();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  }, [dispatch]);

  /**
   * Resets the error state
   */
  const resetError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  // Initialize workflows on mount
  useEffect(() => {
    if (!isInitialized) {
      getWorkflows();
      setIsInitialized(true);
    }
  }, [isInitialized, getWorkflows]);

  return {
    workflows,
    loading,
    error,
    getWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    resetError,
  };
};

export default useWorkflow;