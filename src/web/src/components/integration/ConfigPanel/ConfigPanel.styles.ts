/**
 * Styled components for the ConfigPanel component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify styling matches latest design mockups
 * 2. Test responsive behavior across different screen sizes
 * 3. Validate accessibility of interactive elements
 * 4. Review spacing and layout with design team
 */

// styled-components v5.3.11
import styled from 'styled-components';
import { colors, spacing } from '../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

/**
 * Requirement: Design System Specifications - Ensures consistent styling using theme tokens
 */
export const ConfigPanelStyles = {
  Container: styled.div`
    background-color: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${spacing.lg};
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    box-shadow: ${({ theme }) => theme.shadows.base};

    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      padding: ${spacing.md};
      margin: ${spacing.sm};
    }
  `,

  Header: styled.div`
    ${applyFlexCenter()};
    justify-content: space-between;
    padding-bottom: ${spacing.md};
    border-bottom: 1px solid ${colors.border};
    margin-bottom: ${spacing.lg};

    h2 {
      color: ${colors.textPrimary};
      font-size: ${({ theme }) => theme.fonts.sizes.xl};
      font-weight: ${({ theme }) => theme.fonts.weights.semibold};
      margin: 0;
    }
  `,

  Form: styled.form`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};

    label {
      color: ${colors.textSecondary};
      font-size: ${({ theme }) => theme.fonts.sizes.sm};
      font-weight: ${({ theme }) => theme.fonts.weights.medium};
      margin-bottom: ${spacing.xs};
    }

    input, select, textarea {
      width: 100%;
      padding: ${spacing.sm};
      border: 1px solid ${colors.border};
      border-radius: ${({ theme }) => theme.borderRadius.base};
      font-size: ${({ theme }) => theme.fonts.sizes.base};
      color: ${colors.textPrimary};
      background-color: ${colors.background};
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 2px ${colors.primaryLight}20;
      }

      &:disabled {
        background-color: ${colors.surface};
        color: ${colors.textDisabled};
        cursor: not-allowed;
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }
  `,

  ButtonGroup: styled.div`
    ${applyFlexCenter()};
    justify-content: flex-end;
    gap: ${applySpacing('3')};
    margin-top: ${spacing.xl};
    padding-top: ${spacing.lg};
    border-top: 1px solid ${colors.border};

    button {
      padding: ${spacing.sm} ${spacing.lg};
      border-radius: ${({ theme }) => theme.borderRadius.base};
      font-weight: ${({ theme }) => theme.fonts.weights.medium};
      font-size: ${({ theme }) => theme.fonts.sizes.base};
      transition: all 0.2s ease;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:first-child {
        background-color: ${colors.surface};
        color: ${colors.textSecondary};
        border: 1px solid ${colors.border};

        &:hover:not(:disabled) {
          background-color: ${colors.border};
        }
      }

      &:last-child {
        background-color: ${colors.primary};
        color: ${colors.background};
        border: 1px solid ${colors.primary};

        &:hover:not(:disabled) {
          background-color: ${colors.primaryDark};
          border-color: ${colors.primaryDark};
        }
      }
    }

    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
      flex-direction: column-reverse;
      width: 100%;

      button {
        width: 100%;
      }
    }
  `
};