/**
 * Integration tests for workflow-related functionalities
 * Requirements addressed:
 * - Workflow Management (Technical Specification/Scope/Core Features and Functionalities)
 *   Validates the end-to-end functionality of workflow management, including creation,
 *   retrieval, updating, and deletion.
 * - Testing and Validation (Technical Specification/System Design/Testing)
 *   Ensures that workflows operate as expected through integration tests.
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// jest v29.6.0
import { jest } from '@jest/globals';

// Internal imports
import useWorkflow from '../../src/hooks/useWorkflow';
import { WorkflowService } from '../../src/services/workflow.service';
import { actions, reducer } from '../../src/store/slices/workflowSlice';
import WorkflowListPage from '../../src/pages/Workflows/List';
import CreateWorkflowPage from '../../src/pages/Workflows/Create';
import EditWorkflowPage from '../../src/pages/Workflows/Edit';
import ViewWorkflowPage from '../../src/pages/Workflows/View';

// Mock the Redux store
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn()
}));

// Mock the workflow service
jest.mock('../../src/services/workflow.service', () => ({
  createWorkflow: jest.fn(),
  getWorkflows: jest.fn(),
  updateWorkflow: jest.fn(),
  deleteWorkflow: jest.fn()
}));

describe('Workflow Integration Tests', () => {
  // Test data
  const mockWorkflow = {
    workflowId: 'test-workflow-1',
    name: 'Test Workflow',
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (WorkflowService.getWorkflows as jest.Mock).mockResolvedValue([mockWorkflow]);
    (WorkflowService.createWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);
    (WorkflowService.updateWorkflow as jest.Mock).mockResolvedValue(mockWorkflow);
    (WorkflowService.deleteWorkflow as jest.Mock).mockResolvedValue(undefined);
  });

  /**
   * Test workflow creation functionality
   * Validates that workflows can be created through the UI and API
   */
  export const testWorkflowCreation = async () => {
    // Render the create workflow page
    render(<CreateWorkflowPage />);

    // Fill in workflow details
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } });

    // Select workflow type
    const typeSelect = screen.getByLabelText('Type');
    fireEvent.change(typeSelect, { target: { value: 'integration' } });

    // Configure workflow
    const connectorSelect = screen.getByLabelText('Connector');
    fireEvent.change(connectorSelect, { target: { value: 'rest' } });

    // Submit the form
    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    // Verify workflow creation
    await waitFor(() => {
      expect(WorkflowService.createWorkflow).toHaveBeenCalledWith({
        name: 'Test Workflow',
        status: 'Draft',
        type: 'integration',
        configuration: { connector: 'rest' }
      });
    });
  };

  /**
   * Test workflow editing functionality
   * Validates that existing workflows can be modified through the UI and API
   */
  export const testWorkflowEditing = async () => {
    // Render the edit workflow page
    render(<EditWorkflowPage />);

    // Wait for workflow data to load
    await waitFor(() => {
      expect(WorkflowService.getWorkflows).toHaveBeenCalled();
    });

    // Modify workflow details
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Workflow' } });

    // Update workflow configuration
    const connectorSelect = screen.getByLabelText('Connector');
    fireEvent.change(connectorSelect, { target: { value: 'graphql' } });

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Verify workflow update
    await waitFor(() => {
      expect(WorkflowService.updateWorkflow).toHaveBeenCalledWith({
        ...mockWorkflow,
        name: 'Updated Workflow',
        configuration: { connector: 'graphql' }
      });
    });
  };

  /**
   * Test workflow viewing functionality
   * Validates that workflow details can be viewed correctly
   */
  export const testWorkflowViewing = async () => {
    // Render the view workflow page
    render(<ViewWorkflowPage />);

    // Wait for workflow data to load
    await waitFor(() => {
      expect(WorkflowService.getWorkflows).toHaveBeenCalled();
    });

    // Verify workflow details are displayed
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    // Verify workflow configuration is displayed
    const configSection = screen.getByText('Configuration');
    expect(configSection).toBeInTheDocument();
    expect(screen.getByText('REST API')).toBeInTheDocument();
  };

  /**
   * Test workflow deletion functionality
   * Validates that workflows can be deleted through the UI and API
   */
  export const testWorkflowDeletion = async () => {
    // Render the workflow list page
    render(<WorkflowListPage />);

    // Wait for workflows to load
    await waitFor(() => {
      expect(WorkflowService.getWorkflows).toHaveBeenCalled();
    });

    // Find and click delete button for the test workflow
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Confirm deletion in the modal
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    // Verify workflow deletion
    await waitFor(() => {
      expect(WorkflowService.deleteWorkflow).toHaveBeenCalledWith(mockWorkflow.workflowId);
    });

    // Verify workflow is removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Workflow')).not.toBeInTheDocument();
    });
  };

  // Run all tests
  it('should create a new workflow', testWorkflowCreation);
  it('should edit an existing workflow', testWorkflowEditing);
  it('should view workflow details', testWorkflowViewing);
  it('should delete a workflow', testWorkflowDeletion);
});