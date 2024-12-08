/**
 * Select component implementation
 * A reusable dropdown UI element with customizable styles and validation
 * 
 * Human Tasks:
 * 1. Verify keyboard navigation meets accessibility standards
 * 2. Test dropdown positioning in different viewport sizes
 * 3. Validate color contrast ratios for all states
 * 4. Review focus management behavior
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SelectStyles } from './Select.styles';
import { validateWorkflowData } from '../../utils/validation.util';
import { themeConstants } from '../../constants/theme.constants';

// Requirement: Data Validation - Define type-safe interface for Select options
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Requirement: Data Validation - Define type-safe props interface
interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
  'aria-label'?: string;
}

// Requirement: Design System Specifications - Implement Select component with consistent styling
const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  required = false,
  name,
  id,
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Requirement: Data Validation - Validate options data structure
  useEffect(() => {
    const isValid = validateWorkflowData({ 
      workflowId: value, 
      status: options.find(opt => opt.value === value)?.label || '' 
    });
    if (!isValid) {
      console.warn('Invalid Select options data structure');
    }
  }, [options, value]);

  // Requirement: Design System Specifications - Handle dropdown positioning
  useEffect(() => {
    if (isOpen && optionsRef.current && selectRef.current) {
      const selectRect = selectRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - selectRect.bottom;
      const spaceAbove = selectRect.top;
      
      optionsRef.current.style.maxHeight = `${Math.min(250, Math.max(spaceBelow, spaceAbove) - 10)}px`;
      
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        optionsRef.current.style.bottom = '100%';
        optionsRef.current.style.top = 'auto';
      } else {
        optionsRef.current.style.top = '100%';
        optionsRef.current.style.bottom = 'auto';
      }
    }
  }, [isOpen]);

  // Requirement: Design System Specifications - Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Requirement: Design System Specifications - Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          const option = options[highlightedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(prev => !prev);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [disabled, isOpen, highlightedIndex, options, onChange]);

  // Requirement: Design System Specifications - Render select component with proper styling
  return (
    <SelectStyles.container
      ref={selectRef}
      onKeyDown={handleKeyDown}
      style={{ 
        borderColor: error ? themeConstants.errorColor : undefined,
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        aria-label={ariaLabel}
        aria-invalid={!!error}
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {isOpen && !disabled && (
        <SelectStyles.dropdown ref={optionsRef}>
          {options.map((option, index) => (
            <SelectStyles.option
              key={option.value}
              className={`
                ${value === option.value ? 'selected' : ''}
                ${option.disabled ? 'disabled' : ''}
                ${index === highlightedIndex ? 'highlighted' : ''}
              `}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled}
            >
              {option.label}
            </SelectStyles.option>
          ))}
        </SelectStyles.dropdown>
      )}

      {error && (
        <div 
          role="alert"
          style={{ 
            color: themeConstants.errorColor,
            fontSize: '0.875rem',
            marginTop: themeConstants.baseSpacingUnit,
          }}
        >
          {error}
        </div>
      )}
    </SelectStyles.container>
  );
};

export default Select;