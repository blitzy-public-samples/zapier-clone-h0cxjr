/**
 * Styles for the AppShell layout component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify responsive breakpoints match design requirements
 * 2. Test layout on different screen sizes and devices
 * 3. Validate spacing and layout measurements with design team
 */

import { colors, spacing } from '../../styles/theme';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

/**
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 * Exports styled components and styles for the AppShell layout
 */
export const AppShellStyles = {
  // Main container for the application shell
  container: `
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: ${colors.background};
  `,

  // Header section of the application shell
  header: `
    ${applyFlexCenter()}
    width: 100%;
    height: 64px;
    padding: 0 ${spacing.lg};
    background-color: ${colors.surface};
    border-bottom: 1px solid ${colors.border};
    position: sticky;
    top: 0;
    z-index: 1020;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) {
      padding: 0 ${spacing.md};
      height: 56px;
    }
  `,

  // Main content area of the application shell
  content: `
    flex: 1;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: ${spacing.xl} ${spacing.lg};
    background-color: ${colors.background};

    @media (max-width: 1280px) {
      max-width: 100%;
    }

    @media (max-width: 768px) {
      padding: ${spacing.lg} ${spacing.md};
    }

    @media (max-width: 640px) {
      padding: ${spacing.md} ${spacing.sm};
    }
  `
};