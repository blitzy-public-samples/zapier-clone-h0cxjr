/**
 * Unit tests for the Button component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify test coverage meets minimum threshold (>90%)
 * 2. Add additional test cases for keyboard interactions
 * 3. Add visual regression tests for button states
 * 4. Review accessibility testing requirements
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest v29.0.0
import { expect, describe, test, jest } from '@jest/globals';

import { Button } from '../../../src/components/common/Button/Button';
import { ButtonStyles } from '../../../src/components/common/Button/Button.styles';

describe('Button Component', () => {
  // Requirement: Design System Specifications - Component rendering
  test('renders button with default props correctly', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  // Requirement: Design System Specifications - Button variants
  test.each([
    ['primary', ButtonStyles.primary],
    ['secondary', ButtonStyles.secondary],
    ['accent', ButtonStyles.accent],
  ])('applies correct styles for %s variant', (variant, expectedStyle) => {
    render(<Button variant={variant as 'primary' | 'secondary' | 'accent'}>Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeInTheDocument();
    expect(button.className).toContain(expectedStyle);
  });

  // Requirement: Design System Specifications - Button sizes
  test.each(['small', 'medium', 'large'])('renders correct size for %s button', (size) => {
    render(<Button size={size as 'small' | 'medium' | 'large'}>Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      padding: size === 'small' ? '4px 8px' : size === 'large' ? '16px 24px' : '8px 16px',
      fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem'
    });
  });

  // Requirement: Design System Specifications - Button states
  test('handles click events correctly', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('prevents click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  test('prevents click when loading', () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(screen.getByRole('button')).toContainElement(screen.getByRole('img', { hidden: true }));
  });

  // Requirement: Design System Specifications - Button width
  test('renders full width button when isFullWidth is true', () => {
    render(<Button isFullWidth>Full Width Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ width: '100%' });
  });

  // Requirement: Design System Specifications - Button icons
  test('renders button with left icon correctly', () => {
    const LeftIcon = () => <span data-testid="left-icon">←</span>;
    render(<Button leftIcon={<LeftIcon />}>Button with Left Icon</Button>);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('left-icon').parentElement).toHaveClass('button-left-icon');
  });

  test('renders button with right icon correctly', () => {
    const RightIcon = () => <span data-testid="right-icon">→</span>;
    render(<Button rightIcon={<RightIcon />}>Button with Right Icon</Button>);
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon').parentElement).toHaveClass('button-right-icon');
  });

  // Requirement: Design System Specifications - Loading state
  test('displays loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading Button</Button>);
    
    const loadingSpinner = screen.getByRole('img', { hidden: true });
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner.tagName.toLowerCase()).toBe('svg');
    expect(loadingSpinner).toHaveStyle({ animation: 'spin 1s linear infinite' });
  });

  // Requirement: Design System Specifications - Custom className
  test('applies custom className correctly', () => {
    const customClass = 'custom-button-class';
    render(<Button className={customClass}>Custom Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain(customClass);
  });

  // Requirement: Design System Specifications - Button types
  test.each(['button', 'submit', 'reset'])('renders button with correct type: %s', (type) => {
    render(<Button type={type as 'button' | 'submit' | 'reset'}>Type Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', type);
  });
});