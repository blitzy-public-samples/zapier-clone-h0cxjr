/**
 * Styled components for the Input component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify input field styles meet accessibility guidelines for focus states
 * 2. Test input field contrast ratios in different theme modes
 * 3. Validate input padding and spacing with UX team
 */

// styled-components v5.3.10
import styled from 'styled-components';
import { 
  primaryColor, 
  secondaryColor, 
  baseSpacingUnit 
} from '../../styles/variables';
import { applySpacing } from '../../styles/mixins';
import { theme } from '../../styles/theme';

/**
 * Wrapper component for the Input field providing consistent layout and spacing
 * Requirement: Design System Specifications - Defines consistent component spacing and layout
 */
export const InputWrapper = styled.div`
  padding: ${applySpacing(2)};
  margin: ${applySpacing(1)};
  border: 1px solid ${theme.colors.secondary};
  border-radius: ${theme.borderRadius.base};
  background-color: ${theme.colors.surface};
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border-color: ${theme.colors.primaryLight};
  }

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.sm};
  }
`;

/**
 * Styled input field component with consistent typography and theming
 * Requirement: Design System Specifications - Implements typography and color palette standards
 */
export const InputField = styled.input`
  width: 100%;
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fonts.sizes.base};
  color: ${theme.colors.textPrimary};
  padding: ${applySpacing(1)};
  border: none;
  outline: none;
  background-color: transparent;
  line-height: ${theme.fonts.lineHeights.normal};

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }

  &:disabled {
    color: ${theme.colors.textDisabled};
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${theme.colors.textPrimary};
    transition: background-color 5000s ease-in-out 0s;
  }
`;