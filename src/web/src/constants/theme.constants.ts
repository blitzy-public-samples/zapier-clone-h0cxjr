/**
 * Theme constants for the Workflow Automation Platform
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify theme constant values match the latest brand guidelines
 * 2. Ensure theme constants are used consistently across components
 * 3. Review color values for WCAG 2.1 AA compliance
 * 4. Validate theme constants with design team
 */

import { colors, fonts, spacing } from '../styles/theme';

/**
 * Core theme constants used across the application
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 */
export const themeConstants = {
  // Primary brand color for main actions and key UI elements
  primaryColor: '#2563EB',

  // Secondary color for supporting UI elements
  secondaryColor: '#64748B',

  // Accent color for success states and highlights
  accentColor: '#10B981',

  // Primary font family for main content
  fontPrimary: "'Inter', sans-serif",

  // Secondary font family for technical content
  fontSecondary: "'Roboto Mono', monospace",

  // Base spacing unit for layout measurements
  baseSpacingUnit: '4px'
} as const;

// Type assertion to ensure theme constants match imported theme configuration
const validateThemeConstants = (): void => {
  // Validate colors
  if (colors.primary !== themeConstants.primaryColor ||
      colors.secondary !== themeConstants.secondaryColor ||
      colors.accent !== themeConstants.accentColor) {
    console.warn('Theme constants color values do not match theme configuration');
  }

  // Validate fonts
  if (fonts.primary !== themeConstants.fontPrimary ||
      fonts.secondary !== themeConstants.fontSecondary) {
    console.warn('Theme constants font values do not match theme configuration');
  }

  // Validate spacing
  if (spacing.baseUnit !== themeConstants.baseSpacingUnit) {
    console.warn('Theme constants spacing value does not match theme configuration');
  }
};

// Run validation in development environment
if (process.env.NODE_ENV === 'development') {
  validateThemeConstants();
}