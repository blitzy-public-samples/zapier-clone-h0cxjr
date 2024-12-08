// React Testing Library v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// React v18.2.0
import React from 'react';
// Jest v29.0.0
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Internal imports
import Builder from '../../../src/components/workflow/Builder/Builder';
import { container } from '../../../src/components/workflow/Builder/Builder.styles';
import { actions } from '../../../src/store/slices/workflowSlice';
import useWorkflow from '../../../src/hooks/useWorkflow';

// Mock the custom hooks and dependencies
jest.mock('../../../src/hooks/useWorkflow');
jest.mock('../../../src/hooks/useNotification');

// Mock store setup
const mockStore = configureStore([]);

/**
 * Test suite for the Builder component
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Tests the Builder component's functionality for creating and managing workflows
 */
describe('Builder Component', () => {
  // Mock data
  const mockWorkflow = {
    workflowId: 'test-workflow-1',
    name: 'Test Workflow',
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock store
  const store = mockStore({
    workflow: {
      workflows: [mockWorkflow],
      loading: false,
      error: null
    }
  });

  // Mock hook implementation
  const mockUseWorkflow = {
    workflows: [mockWorkflow],
    loading: false,
    error: null,
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
    resetError: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useWorkflow as jest.Mock).mockReturnValue(mockUseWorkflow);
  });

  /**
   * Test if the Builder component renders correctly with its child components
   */
  describe('testBuilderRendering', () => {
    it('should render the Builder component with Canvas and PropertyPanel', () => {
      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      // Verify the main container is rendered with correct styles
      const builderContainer = screen.getByTestId('workflow-builder');
      expect(builderContainer).toHaveStyle(container);

      // Verify Canvas component is rendered
      expect(screen.getByTestId('workflow-builder__canvas')).toBeInTheDocument();

      // Verify PropertyPanel component is rendered
      expect(screen.getByTestId('workflow-builder__properties')).toBeInTheDocument();
    });

    it('should display loading state when workflow is being loaded', () => {
      (useWorkflow as jest.Mock).mockReturnValue({
        ...mockUseWorkflow,
        loading: true
      });

      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      expect(screen.getByText('Loading workflow...')).toBeInTheDocument();
    });

    it('should handle error states correctly', () => {
      const errorMessage = 'Failed to load workflow';
      (useWorkflow as jest.Mock).mockReturnValue({
        ...mockUseWorkflow,
        error: errorMessage
      });

      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  /**
   * Test the drag-and-drop functionality of the Builder component
   */
  describe('testDragAndDrop', () => {
    it('should update workflow structure when dragging steps', async () => {
      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      const canvas = screen.getByTestId('workflow-builder__canvas');
      const step = screen.getByTestId('workflow-step-1');

      // Simulate drag start
      fireEvent.dragStart(step);

      // Simulate drag over canvas
      fireEvent.dragOver(canvas, {
        clientX: 200,
        clientY: 200
      });

      // Simulate drop
      fireEvent.drop(canvas);

      // Verify workflow update was called with new position
      await waitFor(() => {
        expect(mockUseWorkflow.updateWorkflow).toHaveBeenCalledWith(
          expect.objectContaining({
            workflowId: mockWorkflow.workflowId,
            metadata: expect.objectContaining({
              elementPositions: expect.any(Object)
            })
          })
        );
      });
    });

    it('should prevent drag operations when workflow is loading', () => {
      (useWorkflow as jest.Mock).mockReturnValue({
        ...mockUseWorkflow,
        loading: true
      });

      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      const step = screen.getByTestId('workflow-step-1');
      
      // Simulate drag start
      fireEvent.dragStart(step);

      // Verify drag operation was prevented
      expect(step).toHaveAttribute('draggable', 'false');
    });
  });

  /**
   * Test if the Builder component validates workflow data before saving
   */
  describe('testWorkflowValidation', () => {
    it('should validate workflow data before saving', async () => {
      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      // Attempt to save invalid workflow
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Verify validation error is displayed
      expect(screen.getByText('Invalid workflow configuration')).toBeInTheDocument();

      // Verify update was not called
      expect(mockUseWorkflow.updateWorkflow).not.toHaveBeenCalled();
    });

    it('should save workflow when data is valid', async () => {
      const validWorkflow = {
        ...mockWorkflow,
        steps: [
          {
            id: 'step-1',
            type: 'task',
            name: 'Valid Step'
          }
        ]
      };

      (useWorkflow as jest.Mock).mockReturnValue({
        ...mockUseWorkflow,
        workflows: [validWorkflow]
      });

      render(
        <Provider store={store}>
          <Builder />
        </Provider>
      );

      // Trigger save operation
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Verify workflow was updated
      await waitFor(() => {
        expect(mockUseWorkflow.updateWorkflow).toHaveBeenCalledWith(
          expect.objectContaining({
            workflowId: validWorkflow.workflowId,
            steps: validWorkflow.steps
          })
        );
      });
    });
  });
});