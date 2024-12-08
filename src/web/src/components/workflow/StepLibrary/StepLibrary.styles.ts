/**
 * Styled components for the StepLibrary component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify hover and focus states meet accessibility requirements
 * 2. Test responsive layout breakpoints across different screen sizes
 * 3. Validate color contrast ratios for text elements
 */

// styled-components v5.3.10
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

/**
 * Main container for the StepLibrary component
 * Requirement: Design System Specifications - Layout Patterns
 */
export const StepLibraryContainer = styled.div`
  ${applyFlexCenter()}
  flex-direction: column;
  width: 100%;
  padding: ${applySpacing('4')};
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

/**
 * Container for step categories
 * Requirement: Design System Specifications - Component Structure
 */
export const StepCategory = styled.div`
  width: 100%;
  margin-bottom: ${applySpacing('4')};
  padding: ${applySpacing('3')};
  border: 1px solid ${secondaryColor}20;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${primaryColor}40;
    background-color: ${primaryColor}05;
  }

  h3 {
    color: ${secondaryColor};
    margin-bottom: ${applySpacing('2')};
    font-weight: 600;
  }
`;

/**
 * Individual step item component
 * Requirement: Design System Specifications - Interactive Elements
 */
export const StepItem = styled.div`
  ${applyFlexCenter()}
  justify-content: flex-start;
  padding: ${applySpacing('3')};
  margin: ${applySpacing('2')} 0;
  border-radius: 4px;
  background-color: #ffffff;
  border: 1px solid ${secondaryColor}10;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${primaryColor}10;
    border-color: ${primaryColor};
    transform: translateX(${applySpacing('0.5')});
  }

  &:active {
    background-color: ${primaryColor}20;
  }

  &.selected {
    background-color: ${accentColor}10;
    border-color: ${accentColor};

    &:hover {
      background-color: ${accentColor}20;
    }
  }

  .step-icon {
    ${applyFlexCenter()}
    width: ${applySpacing('8')};
    height: ${applySpacing('8')};
    margin-right: ${applySpacing('3')};
    border-radius: 4px;
    background-color: ${primaryColor}10;
    color: ${primaryColor};
  }

  .step-content {
    flex: 1;

    h4 {
      color: ${secondaryColor};
      margin-bottom: ${applySpacing('1')};
      font-weight: 500;
    }

    p {
      color: ${secondaryColor}90;
      font-size: 0.875rem;
    }
  }
`;