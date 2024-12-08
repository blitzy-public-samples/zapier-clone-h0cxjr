/**
 * Styled components for the Connector component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Review component spacing with design team for responsive layout adjustments
 * 2. Validate accessibility of color combinations used in the component
 * 3. Verify component styling matches latest design mockups
 */

// styled-components v5.3.11
import styled from 'styled-components';
import { colors, spacing } from '../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

/**
 * Requirement: Design System Specifications - Ensures consistent styling through theme-based tokens
 */
export const ConnectorStyles = {
  Container: styled.div`
    ${applyFlexCenter()}
    flex-direction: column;
    width: 100%;
    min-height: ${spacing.xl};
    background-color: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    box-shadow: ${({ theme }) => theme.shadows.base};
    overflow: hidden;
  `,

  Header: styled.div`
    width: 100%;
    padding: ${spacing.md} ${spacing.lg};
    background-color: ${colors.background};
    border-bottom: 1px solid ${colors.border};

    h3 {
      color: ${colors.textPrimary};
      font-size: ${({ theme }) => theme.fonts.sizes.lg};
      font-weight: ${({ theme }) => theme.fonts.weights.semibold};
      margin: 0;
    }
  `,

  Body: styled.div`
    width: 100%;
    padding: ${spacing.lg};
    background-color: ${colors.background};
    flex: 1;

    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
  `,

  Footer: styled.div`
    ${applyFlexCenter()}
    width: 100%;
    padding: ${spacing.md} ${spacing.lg};
    background-color: ${colors.surface};
    border-top: 1px solid ${colors.border};
    
    button {
      margin-left: ${spacing.sm};
    }
  `
} as const;