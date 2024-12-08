/**
 * Styled components for the Modal component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify modal animations and transitions meet performance requirements
 * 2. Test modal responsiveness across different screen sizes
 * 3. Validate modal overlay opacity with design team
 * 4. Ensure modal focus management follows accessibility guidelines
 */

// styled-components v5.3.10
import styled from 'styled-components';
import { colors, spacing } from '../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';
import { primaryColor, baseSpacingUnit } from '../../styles/variables';

/**
 * Modal container component that provides the overlay and centers the modal content
 * Requirement: Design System Specifications - Implements consistent layout and spacing
 */
export const ModalContainer = styled.div`
  ${applyFlexCenter()}
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${spacing.md};

  /* Ensure modal is accessible via keyboard navigation */
  &:focus {
    outline: none;
  }
`;

/**
 * Modal header component that contains the title and close button
 * Requirement: Design System Specifications - Implements typography and spacing standards
 */
export const ModalHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md};
  border-bottom: 1px solid ${colors.border};
  background-color: ${colors.surface};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.md};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.md};

  h2 {
    margin: 0;
    color: ${colors.textPrimary};
    font-size: ${({ theme }) => theme.fonts.sizes.xl};
    font-weight: ${({ theme }) => theme.fonts.weights.semibold};
    line-height: ${({ theme }) => theme.fonts.lineHeights.tight};
  }

  button {
    color: ${colors.textSecondary};
    transition: color 0.2s ease;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

/**
 * Modal body component that contains the main content
 * Requirement: Design System Specifications - Implements spacing and layout patterns
 */
export const ModalBody = styled.div`
  padding: ${spacing.lg};
  background-color: ${colors.background};
  color: ${colors.textPrimary};
  font-size: ${({ theme }) => theme.fonts.sizes.base};
  line-height: ${({ theme }) => theme.fonts.lineHeights.normal};
  max-height: calc(100vh - ${applySpacing('32')}); /* Ensures modal doesn't exceed viewport height */
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: ${baseSpacingUnit};
  }

  &::-webkit-scrollbar-track {
    background: ${colors.surface};
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

/**
 * Modal footer component that contains action buttons
 * Requirement: Design System Specifications - Implements consistent button styling and spacing
 */
export const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background-color: ${colors.surface};
  border-top: 1px solid ${colors.border};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.md};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.md};

  button {
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-weight: ${({ theme }) => theme.fonts.weights.medium};
    transition: all 0.2s ease;

    &.primary {
      background-color: ${primaryColor};
      color: ${colors.background};

      &:hover {
        background-color: ${colors.primaryDark};
      }
    }

    &.secondary {
      background-color: ${colors.surface};
      color: ${colors.textSecondary};
      border: 1px solid ${colors.border};

      &:hover {
        background-color: ${colors.border};
        color: ${colors.textPrimary};
      }
    }
  }
`;