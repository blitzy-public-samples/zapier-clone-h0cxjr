/**
 * @fileoverview Unit tests for the useWorkflow custom React hook
 * Requirements addressed:
 * - Workflow Management Testing (Technical Specification/Scope/Core Features and Functionalities)
 *   Validates the functionality of the useWorkflow hook, ensuring it correctly integrates 
 *   state management and API interactions for workflows.
 */

// react version ^18.2.0
import { act } from 'react';
// @testing-library/react-hooks version ^8.0.1
import { renderHook } from '@testing-library/react-hooks';
// redux-mock-store version ^1.5.4
import configureMockStore from 'redux-mock-store';
// jest version ^29.0.0
import { jest } from '@jest/globals';

import useWorkflow from '../../../src/hooks/useWorkflow';
import { WorkflowService } from '../../../src/services/workflow.service';
import { actions as workflowActions } from '../../../src/store/slices/workflowSlice';

// Mock the Redux store
const mockStore = configureMockStore();

// Mock the WorkflowService
jest.mock('../../../src/services/workflow.service', () => ({
  WorkflowService: {
    getWorkflow: jest.fn(),
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
  },
}));

describe('useWorkflow Hook', () => {
  let store: any;

  beforeEach(() => {
    // Initialize mock store with default state
    store = mockStore({
      workflow: {
        workflows: [],
        loading: false,
        error: null,
      },
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWorkflow());

    expect(result.current.workflows).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch workflows and update state', async () => {
    const mockWorkflows = [
      {
        workflowId: '1',
        name: 'Test Workflow',
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Mock the getWorkflows service call
    WorkflowService.getWorkflow.mockResolvedValueOnce(mockWorkflows);

    const { result, waitForNextUpdate } = renderHook(() => useWorkflow());

    // Wait for the initial fetch to complete
    await waitForNextUpdate();

    expect(WorkflowService.getWorkflow).toHaveBeenCalled();
    expect(store.getActions()).toContainEqual(
      workflowActions.setWorkflows(mockWorkflows)
    );
  });

  it('should handle workflow creation', async () => {
    const newWorkflow = {
      workflowId: '2',
      name: 'New Workflow',
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock the createWorkflow service call
    WorkflowService.createWorkflow.mockResolvedValueOnce(newWorkflow);

    const { result } = renderHook(() => useWorkflow());

    await act(async () => {
      await result.current.createWorkflow(newWorkflow);
    });

    expect(WorkflowService.createWorkflow).toHaveBeenCalledWith(newWorkflow);
    expect(store.getActions()).toContainEqual(
      workflowActions.addWorkflow(newWorkflow)
    );
  });

  it('should handle workflow updates', async () => {
    const updatedWorkflow = {
      workflowId: '1',
      name: 'Updated Workflow',
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock the updateWorkflow service call
    WorkflowService.updateWorkflow.mockResolvedValueOnce(updatedWorkflow);

    const { result } = renderHook(() => useWorkflow());

    await act(async () => {
      await result.current.updateWorkflow(updatedWorkflow);
    });

    expect(WorkflowService.updateWorkflow).toHaveBeenCalledWith(updatedWorkflow);
    expect(store.getActions()).toContainEqual(
      workflowActions.editWorkflow(updatedWorkflow)
    );
  });

  it('should handle workflow deletion', async () => {
    const workflowId = '1';

    // Mock the deleteWorkflow service call
    WorkflowService.deleteWorkflow.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useWorkflow());

    await act(async () => {
      await result.current.deleteWorkflow(workflowId);
    });

    expect(WorkflowService.deleteWorkflow).toHaveBeenCalledWith(workflowId);
    expect(store.getActions()).toContainEqual(
      workflowActions.removeWorkflow(workflowId)
    );
  });

  it('should handle errors during workflow operations', async () => {
    const error = new Error('API Error');

    // Mock the service call to throw an error
    WorkflowService.getWorkflow.mockRejectedValueOnce(error);

    const { result, waitForNextUpdate } = renderHook(() => useWorkflow());

    await waitForNextUpdate();

    expect(store.getActions()).toContainEqual(
      workflowActions.setError('Failed to fetch workflows')
    );
  });

  it('should reset error state', () => {
    const { result } = renderHook(() => useWorkflow());

    act(() => {
      result.current.resetError();
    });

    expect(store.getActions()).toContainEqual(
      workflowActions.setError(null)
    );
  });

  it('should handle invalid workflow data during creation', async () => {
    const invalidWorkflow = {
      // Missing required fields
      name: 'Invalid Workflow',
    };

    const { result } = renderHook(() => useWorkflow());

    await act(async () => {
      await result.current.createWorkflow(invalidWorkflow as any);
    });

    expect(WorkflowService.createWorkflow).not.toHaveBeenCalled();
    expect(store.getActions()).toContainEqual(
      workflowActions.setError('Invalid workflow data')
    );
  });

  it('should handle invalid workflow data during update', async () => {
    const invalidWorkflow = {
      // Missing required fields
      workflowId: '1',
    };

    const { result } = renderHook(() => useWorkflow());

    await act(async () => {
      await result.current.updateWorkflow(invalidWorkflow as any);
    });

    expect(WorkflowService.updateWorkflow).not.toHaveBeenCalled();
    expect(store.getActions()).toContainEqual(
      workflowActions.setError('Invalid workflow data')
    );
  });
});