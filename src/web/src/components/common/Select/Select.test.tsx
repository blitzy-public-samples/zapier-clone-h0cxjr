// @testing-library/react@13.4.0
// jest@29.0.0

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Select from './Select';
import { SelectStyles } from './Select.styles';
import { validateWorkflowData } from '../../utils/validation.util';

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateWorkflowData: jest.fn().mockReturnValue(true)
}));

// Common test props
const defaultProps = {
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ],
  value: '',
  onChange: jest.fn(),
};

/**
 * Test suite for the Select component
 * Requirements addressed:
 * - Component Testing (Technical Specification/System Design/Testing)
 * - Data Validation (Technical Specification/System Design/API Design)
 */
describe('Select Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Component Rendering
   * Requirement: Component Testing
   * Verifies that the Select component renders correctly with default props
   */
  describe('rendersSelectComponent', () => {
    it('renders the Select component with default props', () => {
      const { container, getByRole } = render(<Select {...defaultProps} />);
      
      // Verify select element is rendered
      const selectElement = getByRole('combobox');
      expect(selectElement).toBeInTheDocument();
      
      // Verify container styles are applied
      const containerElement = container.firstChild;
      expect(containerElement).toHaveStyle({
        position: 'relative',
        width: '100%'
      });
    });

    it('renders placeholder text when no value is selected', () => {
      const { getByText } = render(<Select {...defaultProps} placeholder="Custom placeholder" />);
      expect(getByText('Custom placeholder')).toBeInTheDocument();
    });
  });

  /**
   * Test: User Interaction
   * Requirement: Component Testing
   * Validates the component's behavior during user interactions
   */
  describe('handlesUserSelection', () => {
    it('calls onChange handler when an option is selected', () => {
      const onChange = jest.fn();
      const { getByRole } = render(<Select {...defaultProps} onChange={onChange} />);
      
      const selectElement = getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: 'option1' } });
      
      expect(onChange).toHaveBeenCalledWith('option1');
    });

    it('handles disabled state correctly', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <Select {...defaultProps} onChange={onChange} disabled={true} />
      );
      
      const selectElement = getByRole('combobox');
      expect(selectElement).toBeDisabled();
      
      fireEvent.change(selectElement, { target: { value: 'option1' } });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Data Validation
   * Requirement: Data Validation
   * Ensures the component validates input data correctly
   */
  describe('validatesInputData', () => {
    it('validates workflow data when options or value changes', () => {
      const { rerender } = render(<Select {...defaultProps} />);
      
      expect(validateWorkflowData).toHaveBeenCalledWith({
        workflowId: '',
        status: ''
      });

      // Test with new value
      rerender(<Select {...defaultProps} value="option1" />);
      
      expect(validateWorkflowData).toHaveBeenCalledWith({
        workflowId: 'option1',
        status: 'Option 1'
      });
    });

    it('handles validation errors gracefully', () => {
      (validateWorkflowData as jest.Mock).mockReturnValueOnce(false);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      render(<Select {...defaultProps} />);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid Select options data structure');
      consoleWarnSpy.mockRestore();
    });
  });

  /**
   * Test: Styling
   * Requirement: Component Testing
   * Verifies that styles are applied correctly
   */
  describe('appliesStylesCorrectly', () => {
    it('applies error styles when error prop is provided', () => {
      const { container } = render(
        <Select {...defaultProps} error="Error message" />
      );
      
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error message');
    });

    it('applies custom styles to dropdown options', () => {
      const { container, getByRole } = render(<Select {...defaultProps} />);
      
      const selectElement = getByRole('combobox');
      fireEvent.click(selectElement);
      
      const dropdownContainer = container.querySelector(SelectStyles.dropdown);
      expect(dropdownContainer).toHaveStyle({
        position: 'absolute',
        top: '100%'
      });
    });
  });
});