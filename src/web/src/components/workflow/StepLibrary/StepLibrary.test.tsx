// @testing-library/react version ^14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// @testing-library/jest-dom version ^5.16.5
import '@testing-library/jest-dom';
// React v18.2.0
import React from 'react';

// Internal imports
import StepLibrary from './StepLibrary';
import { StepLibraryContainer } from './StepLibrary.styles';
import { validateWorkflowData } from '../../utils/validation.util';
import useWorkflow from '../../hooks/useWorkflow';

// Mock the useWorkflow hook
jest.mock('../../hooks/useWorkflow', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateWorkflowData: jest.fn()
}));

describe('StepLibrary Component', () => {
  // Default mock values for useWorkflow hook
  const mockUseWorkflow = {
    workflows: [],
    loading: false,
    error: null,
    getWorkflows: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useWorkflow as jest.Mock).mockReturnValue(mockUseWorkflow);
    (validateWorkflowData as jest.Mock).mockReturnValue(true);
  });

  /**
   * Test: Component Rendering
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies that the StepLibrary component renders correctly with all its elements
   */
  it('should render the StepLibrary component correctly', () => {
    render(<StepLibrary />);

    // Verify main elements are rendered
    expect(screen.getByText('Step Library')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search steps...')).toBeInTheDocument();

    // Verify default categories are rendered
    expect(screen.getByText('Triggers')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Logic')).toBeInTheDocument();
  });

  /**
   * Test: Loading State
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Ensures loading state is handled correctly
   */
  it('should display loading state when loading is true', () => {
    (useWorkflow as jest.Mock).mockReturnValue({
      ...mockUseWorkflow,
      loading: true
    });

    render(<StepLibrary />);
    expect(screen.getByText('Loading steps...')).toBeInTheDocument();
  });

  /**
   * Test: Error State
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies error handling and display
   */
  it('should display error message when there is an error', () => {
    const errorMessage = 'Failed to load steps';
    (useWorkflow as jest.Mock).mockReturnValue({
      ...mockUseWorkflow,
      error: errorMessage
    });

    render(<StepLibrary />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  /**
   * Test: Search Functionality
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Tests the search functionality for filtering steps
   */
  it('should filter steps based on search query', () => {
    render(<StepLibrary />);
    
    const searchInput = screen.getByPlaceholderText('Search steps...');
    fireEvent.change(searchInput, { target: { value: 'webhook' } });

    // Verify filtered results
    expect(screen.getByText('Webhook')).toBeInTheDocument();
    expect(screen.queryByText('Transform Data')).not.toBeInTheDocument();
  });

  /**
   * Test: Step Selection
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies step selection functionality
   */
  it('should handle step selection correctly', () => {
    render(<StepLibrary />);
    
    const webhookStep = screen.getByText('Webhook').closest('.step-library__step');
    expect(webhookStep).toBeInTheDocument();

    // Click the step
    if (webhookStep) {
      fireEvent.click(webhookStep);
      expect(webhookStep).toHaveClass('step-library__step--selected');
    }
  });

  /**
   * Test: Drag and Drop
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Tests drag and drop functionality for workflow steps
   */
  it('should handle drag start event correctly', () => {
    render(<StepLibrary />);
    
    const webhookStep = screen.getByText('Webhook').closest('.step-library__step');
    expect(webhookStep).toBeInTheDocument();

    if (webhookStep) {
      const mockDataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      fireEvent.dragStart(webhookStep, {
        dataTransfer: mockDataTransfer
      });

      // Verify drag data was set correctly
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        expect.any(String)
      );
      expect(mockDataTransfer.effectAllowed).toBe('copy');
    }
  });

  /**
   * Test: Styling Integration
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies that styled components are applied correctly
   */
  it('should apply correct styles from StepLibraryContainer', () => {
    render(<StepLibrary />);
    
    const container = document.querySelector('.step-library');
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle({
      display: 'flex',
      flexDirection: 'column'
    });
  });

  /**
   * Test: Workflow Data Validation
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Tests integration with workflow data validation
   */
  it('should validate workflow data when handling steps', () => {
    render(<StepLibrary />);
    
    const webhookStep = screen.getByText('Webhook').closest('.step-library__step');
    if (webhookStep) {
      fireEvent.click(webhookStep);
      expect(validateWorkflowData).toHaveBeenCalled();
    }
  });
});