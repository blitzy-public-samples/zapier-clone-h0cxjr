/**
 * Input component implementation
 * Requirements addressed:
 * - Design System Specifications - Implements consistent UI elements and styling
 * - Data Validation - Integrates validation capabilities for input fields
 * 
 * Human Tasks:
 * 1. Verify input field accessibility with screen readers
 * 2. Test input validation behavior across different form scenarios
 * 3. Review input field states (focus, error, disabled) with design team
 */

// react v18.2.0
import React from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

import { InputWrapper, InputField } from './Input.styles';
import { validateAuthData } from '../../utils/validation.util';

interface InputProps {
  /**
   * Type of the input field (e.g., 'text', 'password', 'email')
   */
  type: string;
  
  /**
   * Placeholder text to display when input is empty
   */
  placeholder: string;
  
  /**
   * Current value of the input field
   */
  value: string;
  
  /**
   * Handler function for input changes
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Flag indicating if the input value is valid
   */
  isValid?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Flag to disable the input field
   */
  disabled?: boolean;
  
  /**
   * Required field indicator
   */
  required?: boolean;
  
  /**
   * Input field name attribute
   */
  name?: string;
}

/**
 * Input component that provides a styled and validated input field
 * Implements Design System Specifications for consistent UI elements
 */
const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  isValid = true,
  className = '',
  disabled = false,
  required = false,
  name
}) => {
  /**
   * Handler for input validation on blur
   * Implements Data Validation requirements
   */
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (type === 'password' || type === 'email') {
      const isValidInput = validateAuthData({
        username: type === 'email' ? event.target.value : '',
        password: type === 'password' ? event.target.value : '',
        token: ''
      });
      
      // Trigger native form validation if input is invalid
      if (!isValidInput) {
        event.target.setCustomValidity('Invalid input');
      } else {
        event.target.setCustomValidity('');
      }
    }
  };

  return (
    <InputWrapper 
      className={className}
      data-valid={isValid}
    >
      <InputField
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        name={name}
        aria-invalid={!isValid}
        data-testid="input-field"
      />
    </InputWrapper>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isValid: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  name: PropTypes.string
};

export default Input;