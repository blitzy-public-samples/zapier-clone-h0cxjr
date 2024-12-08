/**
 * Button component styles using styled-components
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify button styles meet WCAG 2.1 AA contrast requirements
 * 2. Test button states (hover, focus, active) with screen readers
 * 3. Validate button sizes across different viewport sizes
 * 4. Ensure touch targets meet accessibility guidelines (minimum 44x44px)
 */

// styled-components v6.0.7
import styled from 'styled-components';
import { 
  primaryColor, 
  secondaryColor, 
  accentColor 
} from '../../styles/variables';
import { 
  applyFlexCenter, 
  applySpacing 
} from '../../styles/mixins';

// Requirement: Design System Specifications - Common button styles base
const BaseButton = styled.button`
  ${applyFlexCenter()};
  padding: ${applySpacing('3')} ${applySpacing('6')};
  border-radius: ${applySpacing('2')};
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Requirement: Design System Specifications - Button variants
export const ButtonStyles = {
  primary: styled(BaseButton)`
    background-color: ${primaryColor};
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #1e40af;
      transform: translateY(0);
    }
  `,

  secondary: styled(BaseButton)`
    background-color: ${secondaryColor};
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #475569;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #334155;
      transform: translateY(0);
    }
  `,

  accent: styled(BaseButton)`
    background-color: ${accentColor};
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #059669;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      background-color: #047857;
      transform: translateY(0);
    }
  `
};