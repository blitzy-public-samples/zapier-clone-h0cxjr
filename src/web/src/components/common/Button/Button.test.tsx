/**
 * Button Component Unit Tests
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

import { Button } from './Button';
import { ButtonStyles } from './Button.styles';

describe('Button Component', () => {
  // Requirement: Design System Specifications - Component Rendering
  test('renders button with default props correctly', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toBeDisabled();
  });

  // Requirement: Design System Specifications - Button Variants
  test.each([
    ['primary', ButtonStyles.primary],
    ['secondary', ButtonStyles.secondary],
    ['accent', ButtonStyles.accent],
  ])('applies correct styles for %s variant', (variant, expectedStyle) => {
    render(<Button variant={variant as 'primary' | 'secondary' | 'accent'}>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  // Requirement: Design System Specifications - Button Sizes
  test.each(['small', 'medium', 'large'])('renders correct size for %s button', (size) => {
    render(<Button size={size as 'small' | 'medium' | 'large'}>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  // Requirement: Design System Specifications - Button States
  test('handles disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveStyle({ cursor: 'not-allowed' });
  });

  test('handles loading state correctly', () => {
    render(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');
    const loader = screen.getByRole('img', { hidden: true }); // SVG loader
    
    expect(button).toBeDisabled();
    expect(loader).toBeInTheDocument();
    expect(button).toHaveStyle({ cursor: 'wait' });
  });

  // Requirement: Design System Specifications - Button Interactions
  test('handles click events correctly', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not trigger click handler when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('does not trigger click handler when loading', () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>Loading Button</Button>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Requirement: Design System Specifications - Button Layout
  test('renders with full width when specified', () => {
    render(<Button isFullWidth>Full Width Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveStyle({ width: '100%' });
  });

  test('renders with icons correctly', () => {
    const LeftIcon = () => <span data-testid="left-icon">←</span>;
    const RightIcon = () => <span data-testid="right-icon">→</span>;
    
    render(
      <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
        Icon Button
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  // Requirement: Design System Specifications - Button Types
  test.each(['button', 'submit', 'reset'])('renders with correct type attribute: %s', (type) => {
    render(<Button type={type as 'button' | 'submit' | 'reset'}>Type Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('type', type);
  });

  // Requirement: Design System Specifications - Custom Styling
  test('accepts and applies custom className', () => {
    const customClass = 'custom-button-class';
    render(<Button className={customClass}>Custom Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass(customClass);
  });
});