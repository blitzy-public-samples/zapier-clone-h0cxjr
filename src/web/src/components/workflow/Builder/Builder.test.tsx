/**
 * Unit tests for the Builder component
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Ensures the Builder component functions correctly as part of the visual drag-and-drop workflow builder.
 */

// React Testing Library v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// React v18.2.0
import React from 'react';
// Redux Provider and store setup
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// Internal imports
import Builder from './Builder';
import { BuilderStyles } from './Builder.styles';

// Mock child components
jest.mock('../Canvas/Canvas', () => ({
  Canvas: ({ workflow, onWorkflowUpdate, onStepSelect, isEditable }) => (
    <div data-testid="mock-canvas">
      Canvas Component
      <button 
        onClick={() => onWorkflowUpdate({ id: '1', name: 'Test Workflow' })}
        data-testid="update-workflow-btn"
      >
        Update Workflow
      </button>
      <button 
        onClick={() => onStepSelect('step-1')}
        data-testid="select-step-btn"
      >
        Select Step
      </button>
    </div>
  )
}));

jest.mock('../PropertyPanel/PropertyPanel', () => ({
  __esModule: true,
  default: ({ selectedStepId, onPropertiesUpdate, isReadOnly }) => (
    <div data-testid="mock-property-panel">
      Property Panel
      <button 
        onClick={() => onPropertiesUpdate('step-1', { name: 'Updated Step' })}
        data-testid="update-properties-btn"
      >
        Update Properties
      </button>
    </div>
  )
}));

// Mock hooks
jest.mock('../../hooks/useWorkflow', () => ({
  __esModule: true,
  default: () => ({
    workflows: [],
    loading: false,
    error: null,
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
    resetError: jest.fn()
  })
}));

jest.mock('../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  })
}));

// Configure mock store
const mockStore = configureStore([thunk]);
const initialState = {
  workflow: {
    workflows: [],
    loading: false,
    error: null
  },
  ui: {
    modals: {},
    theme: 'light',
    loading: false
  }
};

describe('Builder Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('renders the Builder component with all required elements', () => {
    render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    // Verify main components are rendered
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('mock-property-panel')).toBeInTheDocument();
    
    // Verify the component uses the correct styles
    const builderElement = screen.getByTestId('mock-canvas').closest('.workflow-builder');
    expect(builderElement).toHaveStyle(`display: flex`);
  });

  it('handles workflow updates from Canvas component', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    // Trigger workflow update
    fireEvent.click(getByTestId('update-workflow-btn'));

    // Verify store actions were dispatched
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('workflow/editWorkflow')
        })
      );
    });
  });

  it('handles step selection and property updates', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    // Select a step
    fireEvent.click(getByTestId('select-step-btn'));

    // Update properties
    fireEvent.click(getByTestId('update-properties-btn'));

    // Verify store actions were dispatched
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('workflow/editWorkflow')
        })
      );
    });
  });

  it('displays loading state correctly', () => {
    store = mockStore({
      ...initialState,
      workflow: {
        ...initialState.workflow,
        loading: true
      }
    });

    render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    expect(screen.getByText(/Loading workflow/i)).toBeInTheDocument();
  });

  it('handles error states appropriately', () => {
    store = mockStore({
      ...initialState,
      workflow: {
        ...initialState.workflow,
        error: 'Failed to load workflow'
      }
    });

    render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    expect(screen.getByText(/Failed to load workflow/i)).toBeInTheDocument();
  });

  it('validates workflow data before updates', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    // Attempt to update with invalid workflow data
    const invalidWorkflow = {};
    fireEvent.click(getByTestId('update-workflow-btn'));

    // Verify validation error notification
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: expect.stringContaining('ui/toggleModal')
        })
      );
    });
  });

  it('applies correct styles from BuilderStyles', () => {
    render(
      <Provider store={store}>
        <Builder />
      </Provider>
    );

    const container = screen.getByTestId('mock-canvas').closest('.workflow-builder');
    const canvas = screen.getByTestId('mock-canvas');
    const propertyPanel = screen.getByTestId('mock-property-panel');

    // Verify container styles
    expect(container).toHaveStyle(BuilderStyles.container);

    // Verify canvas styles
    expect(canvas.parentElement).toHaveStyle(BuilderStyles.content);

    // Verify property panel container styles
    expect(propertyPanel.parentElement).toHaveClass('workflow-builder__properties');
  });
});