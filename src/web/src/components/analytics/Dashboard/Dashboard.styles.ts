/**
 * Styled components for the Analytics Dashboard
 * Implements requirements from Technical Specification/User Interface Design/Analytics Dashboard
 * 
 * Human Tasks:
 * 1. Verify responsive behavior of chart wrappers on different screen sizes
 * 2. Ensure chart spacing and layout meets design requirements
 * 3. Validate accessibility of color contrasts in the dashboard
 */

// @emotion/styled v11.11.0
import styled from '@emotion/styled';
import { colors, spacing } from '../../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../../styles/mixins';

/**
 * Main container for the Analytics Dashboard
 * Requirement: Analytics Dashboard - Provides a comprehensive dashboard for visualizing analytics data
 */
export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.baseUnit * 4}px;
  background-color: ${colors.primary};
  padding: ${applySpacing('4')};
`;

/**
 * Wrapper component for individual chart elements
 * Requirement: Analytics Dashboard - Provides consistent layout for various chart types
 */
export const ChartWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${applySpacing('2')};
  border: 1px solid ${colors.secondary};
`;