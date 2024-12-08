/**
 * Button Component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify button click handlers are properly cleaned up in parent components
 * 2. Test keyboard navigation and focus management
 * 3. Validate button text contrast with background colors
 * 4. Review button loading states with design team
 */

// react v18.2.0
import React from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

import { ButtonStyles } from './Button.styles';
import { theme } from '../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

// Requirement: Design System Specifications - Button variants
type ButtonVariant = 'primary' | 'secondary' | 'accent';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// Requirement: Design System Specifications - Component implementation
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  // Select the appropriate styled component based on variant
  const StyledButton = ButtonStyles[variant];

  // Determine padding based on size
  const getSizePadding = () => {
    switch (size) {
      case 'small':
        return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'large':
        return `${theme.spacing.md} ${theme.spacing.lg}`;
      default:
        return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  };

  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.fonts.sizes.sm;
      case 'large':
        return theme.fonts.sizes.lg;
      default:
        return theme.fonts.sizes.base;
    }
  };

  const buttonStyles = {
    width: isFullWidth ? '100%' : 'auto',
    padding: getSizePadding(),
    fontSize: getFontSize(),
    opacity: isLoading ? 0.7 : 1,
    cursor: isLoading ? 'wait' : disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <StyledButton
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={className}
      style={buttonStyles}
      {...props}
    >
      {leftIcon && <span className="button-left-icon">{leftIcon}</span>}
      {isLoading ? (
        <span className="button-loader" style={{ marginRight: theme.spacing.xs }}>
          {/* Simple loading indicator */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
            />
          </svg>
        </span>
      ) : null}
      {children}
      {rightIcon && <span className="button-right-icon">{rightIcon}</span>}
    </StyledButton>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  isLoading: PropTypes.bool,
  isFullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

// Add keyframe animation for loading spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);