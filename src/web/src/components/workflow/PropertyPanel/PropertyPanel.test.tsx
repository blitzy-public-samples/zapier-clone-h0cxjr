// React Testing Library v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// React v18.2.0
import React from 'react';
// Jest v29.0.0
import '@testing-library/jest-dom';
// Redux Provider and store
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// Internal imports
import PropertyPanel from './PropertyPanel';
import { validateWorkflowData } from '../../utils/validation.util';

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateWorkflowData: jest.fn()
}));

// Mock the useWorkflow hook
jest.mock('../../hooks/useWorkflow', () => ({
  __esModule: true,
  default: () => ({
    workflows: mockWorkflows,
    loading: false,
    error: null,
    updateWorkflow: jest.fn(),
    resetError: jest.fn()
  })
}));

// Test data
const mockWorkflows = [
  {
    workflowId: 'test-workflow-1',
    name: 'Test Workflow 1',
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Configure mock store
const mockStore = configureStore([thunk]);
const store = mockStore({
  workflow: {
    workflows: mockWorkflows,
    loading: false,
    error: null
  }
});

describe('PropertyPanel Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (validateWorkflowData as jest.Mock).mockReturnValue(true);
  });

  /**
   * Test PropertyPanel rendering
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   */
  describe('Rendering', () => {
    it('should render without errors', () => {
      render(
        <Provider store={store}>
          <PropertyPanel />
        </Provider>
      );
      expect(screen.getByText('Select a Step')).toBeInTheDocument();
    });

    it('should render edit mode when step is selected', () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" />
        </Provider>
      );
      expect(screen.getByText('Edit Step Properties')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      const loadingStore = mockStore({
        workflow: { ...store.getState().workflow, loading: true }
      });
      
      render(
        <Provider store={loadingStore}>
          <PropertyPanel />
        </Provider>
      );
      expect(screen.getByText('Loading properties...')).toBeInTheDocument();
    });

    it('should render error state', () => {
      const errorStore = mockStore({
        workflow: { ...store.getState().workflow, error: 'Test error' }
      });
      
      render(
        <Provider store={errorStore}>
          <PropertyPanel />
        </Provider>
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  /**
   * Test PropertyPanel validation
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   */
  describe('Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" />
        </Provider>
      );

      // Clear the name field
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should validate workflow data before saving', async () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" />
        </Provider>
      );

      // Mock validation failure
      (validateWorkflowData as jest.Mock).mockReturnValue(false);

      // Try to save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid workflow configuration')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test PropertyPanel interactions
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   */
  describe('Interactions', () => {
    it('should handle property changes', () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" />
        </Provider>
      );

      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      expect(nameInput).toHaveValue('Updated Name');
    });

    it('should handle type selection', () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" />
        </Provider>
      );

      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'integration' } });
      expect(typeSelect).toHaveValue('integration');
    });

    it('should disable inputs in readonly mode', () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" isReadOnly={true} />
        </Provider>
      );

      expect(screen.getByLabelText('Name')).toBeDisabled();
      expect(screen.getByLabelText('Type')).toBeDisabled();
      expect(screen.getByText('Save')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
    });

    it('should handle cancel action', async () => {
      render(
        <Provider store={store}>
          <PropertyPanel selectedStepId="test-workflow-1" />
        </Provider>
      );

      // Change name
      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Should revert to original name
      await waitFor(() => {
        expect(nameInput).toHaveValue('Test Workflow 1');
      });
    });
  });
});