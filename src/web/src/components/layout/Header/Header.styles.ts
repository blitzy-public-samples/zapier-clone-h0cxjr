/**
 * Styled components and CSS-in-JS styles for the Header component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify header styles match latest design mockups
 * 2. Review responsive behavior on different screen sizes
 * 3. Validate accessibility of header elements (color contrast, focus states)
 */

import styled from '@emotion/styled'; // @emotion/styled@11.11.0
import { colors, fonts, spacing } from '../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

/**
 * Requirement: Design System Specifications - Ensures consistent layout and spacing
 * Main container for the header component with consistent height and background
 */
export const HeaderStyles = {
  container: styled.header`
    width: 100%;
    height: 64px;
    background-color: ${colors.background};
    border-bottom: 1px solid ${colors.border};
    padding: 0 ${spacing.lg};
    ${applyFlexCenter()};
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: ${({ theme }) => theme.zIndex.sticky};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  `,

  /**
   * Requirement: Design System Specifications - Typography and spacing
   * Title element with proper font styling and spacing
   */
  title: styled.h1`
    color: ${colors.textPrimary};
    font-family: ${fonts.primary};
    font-size: ${fonts.sizes.xl};
    font-weight: ${fonts.weights.semibold};
    line-height: ${fonts.lineHeights.normal};
    margin: 0;
    ${applySpacing('4')};
  `,

  /**
   * Requirement: Design System Specifications - Layout patterns
   * Container for header action items with proper spacing and alignment
   */
  actions: styled.div`
    ${applyFlexCenter()};
    gap: ${spacing.md};

    /* Ensure proper spacing between action items */
    > * {
      margin-left: ${spacing.sm};

      &:first-of-type {
        margin-left: 0;
      }
    }

    /* Responsive adjustments for smaller screens */
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
      gap: ${spacing.sm};
    }
  `
};