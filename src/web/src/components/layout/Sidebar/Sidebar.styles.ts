/**
 * Styled components and CSS rules for the Sidebar layout component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify sidebar width and height requirements with design team
 * 2. Confirm hover and active state styles with UX team
 * 3. Review responsive breakpoints for sidebar behavior
 * 4. Validate accessibility of navigation items contrast ratios
 */

// styled-components v5.3.x
import styled from 'styled-components';
import { primaryColor, secondaryColor, fontPrimary } from '../../styles/variables';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';
import { theme } from '../../styles/theme';

/**
 * Main container for the sidebar component
 * Requirement: Design System Specifications - Layout Patterns
 */
export const Container = styled.aside`
  ${applyFlexCenter()}
  flex-direction: column;
  width: 280px;
  height: 100vh;
  background-color: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.md};
  position: fixed;
  left: 0;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  transition: all 0.3s ease;

  @media (max-width: ${theme.breakpoints.md}) {
    width: 240px;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    transform: translateX(-100%);
    
    &.open {
      transform: translateX(0);
    }
  }
`;

/**
 * Navigation item wrapper
 * Requirement: Design System Specifications - Interactive Elements
 */
export const NavItem = styled.div`
  ${applyFlexCenter()}
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.base};
  font-family: ${fontPrimary};
  font-size: ${theme.fonts.sizes.base};
  font-weight: ${theme.fonts.weights.medium};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.primaryLight}20;
    color: ${primaryColor};
  }

  &.active {
    background-color: ${primaryColor}10;
    color: ${primaryColor};
    font-weight: ${theme.fonts.weights.semibold};
  }

  &:focus-visible {
    outline: 2px solid ${primaryColor};
    outline-offset: 2px;
  }

  svg {
    margin-right: ${theme.spacing.sm};
    width: 20px;
    height: 20px;
  }
`;

/**
 * Section divider for sidebar content
 * Requirement: Design System Specifications - Visual Hierarchy
 */
export const Divider = styled.hr`
  width: 100%;
  height: 1px;
  background-color: ${theme.colors.border};
  border: none;
  margin: ${theme.spacing.md} 0;
`;

/**
 * Section header for sidebar content groups
 * Requirement: Design System Specifications - Typography
 */
export const SectionHeader = styled.h3`
  width: 100%;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  color: ${secondaryColor};
  font-family: ${fontPrimary};
  font-size: ${theme.fonts.sizes.sm};
  font-weight: ${theme.fonts.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

/**
 * Container for the sidebar footer content
 * Requirement: Design System Specifications - Layout Patterns
 */
export const Footer = styled.div`
  ${applyFlexCenter()}
  width: 100%;
  margin-top: auto;
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

// Export all styled components as a namespace
export const SidebarStyles = {
  Container,
  NavItem,
  Divider,
  SectionHeader,
  Footer
};