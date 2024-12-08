// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';
// react v18.2.0
import React from 'react';

import Input from './Input';
import { InputWrapper, InputField } from './Input.styles';
import { validateAuthData } from '../../utils/validation.util';

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateAuthData: jest.fn()
}));

/**
 * Human Tasks:
 * 1. Review test coverage for edge cases and accessibility scenarios
 * 2. Verify test cases align with updated design system requirements
 * 3. Add additional test cases for specific form validation scenarios
 */

describe('Input Component', () => {
  // Common props used across tests
  const defaultProps = {
    type: 'text',
    placeholder: 'Enter text',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Component renders correctly
   * Requirement: Design System Specifications
   * Verifies that the Input component renders with all required elements
   */
  describe('renders correctly', () => {
    it('should render with default props', () => {
      render(<Input {...defaultProps} />);
      
      const inputElement = screen.getByTestId('input-field');
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toHaveAttribute('type', 'text');
      expect(inputElement).toHaveAttribute('placeholder', 'Enter text');
    });

    it('should render with custom className', () => {
      const className = 'custom-input';
      render(<Input {...defaultProps} className={className} />);
      
      const wrapperElement = screen.getByTestId('input-field').parentElement;
      expect(wrapperElement).toHaveClass(className);
    });

    it('should render in disabled state', () => {
      render(<Input {...defaultProps} disabled={true} />);
      
      const inputElement = screen.getByTestId('input-field');
      expect(inputElement).toBeDisabled();
    });

    it('should render as required field', () => {
      render(<Input {...defaultProps} required={true} />);
      
      const inputElement = screen.getByTestId('input-field');
      expect(inputElement).toHaveAttribute('required');
    });
  });

  /**
   * Test: Input validation handling
   * Requirement: Data Validation
   * Verifies that the input validation logic works correctly
   */
  describe('handles validation', () => {
    it('should validate email input on blur', () => {
      const mockValidateAuthData = validateAuthData as jest.Mock;
      mockValidateAuthData.mockReturnValue(true);

      render(
        <Input
          {...defaultProps}
          type="email"
          value="test@example.com"
        />
      );

      const inputElement = screen.getByTestId('input-field');
      fireEvent.blur(inputElement);

      expect(mockValidateAuthData).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: '',
        token: ''
      });
    });

    it('should validate password input on blur', () => {
      const mockValidateAuthData = validateAuthData as jest.Mock;
      mockValidateAuthData.mockReturnValue(true);

      render(
        <Input
          {...defaultProps}
          type="password"
          value="password123"
        />
      );

      const inputElement = screen.getByTestId('input-field');
      fireEvent.blur(inputElement);

      expect(mockValidateAuthData).toHaveBeenCalledWith({
        username: '',
        password: 'password123',
        token: ''
      });
    });

    it('should set custom validity when validation fails', () => {
      const mockValidateAuthData = validateAuthData as jest.Mock;
      mockValidateAuthData.mockReturnValue(false);

      render(
        <Input
          {...defaultProps}
          type="email"
          value="invalid-email"
        />
      );

      const inputElement = screen.getByTestId('input-field');
      fireEvent.blur(inputElement);

      expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    });
  });

  /**
   * Test: Styling application
   * Requirement: Design System Specifications
   * Verifies that the component applies styles correctly
   */
  describe('applies styles correctly', () => {
    it('should apply valid/invalid styles based on isValid prop', () => {
      render(
        <Input
          {...defaultProps}
          isValid={false}
        />
      );

      const wrapperElement = screen.getByTestId('input-field').parentElement;
      expect(wrapperElement).toHaveAttribute('data-valid', 'false');
    });

    it('should handle onChange events', () => {
      const handleChange = jest.fn();
      render(
        <Input
          {...defaultProps}
          onChange={handleChange}
        />
      );

      const inputElement = screen.getByTestId('input-field');
      fireEvent.change(inputElement, { target: { value: 'test input' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should apply name attribute when provided', () => {
      render(
        <Input
          {...defaultProps}
          name="test-input"
        />
      );

      const inputElement = screen.getByTestId('input-field');
      expect(inputElement).toHaveAttribute('name', 'test-input');
    });
  });
});