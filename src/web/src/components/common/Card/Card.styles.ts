/**
 * Styled components for the Card component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify card shadow values match design system specifications
 * 2. Review card spacing with design team for responsive layouts
 * 3. Validate hover state animations with UX team
 */

// styled-components v5.3.11
import styled from 'styled-components';
import { 
  primaryColor, 
  secondaryColor, 
  baseSpacingUnit 
} from '../../styles/variables';
import { 
  applyFlexCenter, 
  applySpacing 
} from '../../styles/mixins';
import { theme } from '../../styles/theme';

// Requirement: Design System Specifications - Defines consistent card container styling
export const CardContainer = styled.div`
  background-color: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.base};
  display: flex;
  flex-direction: column;
  margin: ${theme.spacing.md} 0;
  overflow: hidden;
  transition: box-shadow 0.2s ease-in-out;
  width: 100%;

  &:hover {
    box-shadow: ${theme.shadows.md};
  }

  @media (min-width: ${theme.breakpoints.sm}) {
    max-width: 600px;
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    max-width: 800px;
  }
`;

// Requirement: Design System Specifications - Defines consistent card header styling
export const CardHeader = styled.div`
  ${applyFlexCenter()};
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  min-height: ${applySpacing('12')};
  padding: ${theme.spacing.md};
  width: 100%;

  h1, h2, h3, h4, h5, h6 {
    color: ${theme.colors.textPrimary};
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fonts.sizes.lg};
    font-weight: ${theme.fonts.weights.semibold};
    margin: 0;
  }
`;

// Requirement: Design System Specifications - Defines consistent card body styling
export const CardBody = styled.div`
  background-color: ${theme.colors.background};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fonts.sizes.base};
  line-height: ${theme.fonts.lineHeights.normal};
  padding: ${theme.spacing.lg};
  width: 100%;

  p {
    margin: 0 0 ${theme.spacing.md} 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

// Requirement: Design System Specifications - Defines consistent card footer styling
export const CardFooter = styled.div`
  ${applyFlexCenter()};
  background-color: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
  min-height: ${applySpacing('10')};
  padding: ${theme.spacing.md};
  width: 100%;

  button {
    &:not(:last-child) {
      margin-right: ${theme.spacing.sm};
    }
  }
`;