/**
 * Theme Configuration for the Workflow Automation Platform
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Review consolidated theme configuration with design team
 * 2. Verify theme configuration matches latest brand guidelines
 * 3. Ensure theme configuration is properly integrated with styling system
 * 4. Test theme configuration across different viewport sizes
 */

import { 
  primaryColor,
  secondaryColor,
  accentColor,
  fontPrimary,
  fontSecondary,
  baseSpacingUnit
} from '../constants/theme.constants';

import { theme } from '../styles/theme';

/**
 * Consolidated theme configuration object that combines theme constants and complete theme settings
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 */
export const themeConfig = {
  // Export theme constants for direct access to core values
  themeConstants: {
    primaryColor,
    secondaryColor,
    accentColor,
    fontPrimary,
    fontSecondary,
    baseSpacingUnit
  },

  // Export complete theme configuration
  theme: {
    colors: theme.colors,
    fonts: theme.fonts,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    mixins: theme.mixins,
    breakpoints: theme.breakpoints,
    zIndex: theme.zIndex
  }
} as const;

// Type validation to ensure theme configuration structure
type ThemeConfigValidation = {
  readonly themeConstants: {
    readonly primaryColor: string;
    readonly secondaryColor: string;
    readonly accentColor: string;
    readonly fontPrimary: string;
    readonly fontSecondary: string;
    readonly baseSpacingUnit: string;
  };
  readonly theme: typeof theme;
};

// Validate theme configuration type at compile time
const _typeCheck: ThemeConfigValidation = themeConfig;

// Validate theme constants match theme configuration in development
if (process.env.NODE_ENV === 'development') {
  const validateThemeConfig = (): void => {
    const { themeConstants: constants, theme: themeObj } = themeConfig;
    
    // Validate colors
    if (constants.primaryColor !== themeObj.colors.primary ||
        constants.secondaryColor !== themeObj.colors.secondary ||
        constants.accentColor !== themeObj.colors.accent) {
      console.warn('Theme constants do not match theme configuration colors');
    }

    // Validate fonts
    if (constants.fontPrimary !== themeObj.fonts.primary ||
        constants.fontSecondary !== themeObj.fonts.secondary) {
      console.warn('Theme constants do not match theme configuration fonts');
    }

    // Validate spacing
    if (constants.baseSpacingUnit !== themeObj.spacing.baseUnit) {
      console.warn('Theme constants do not match theme configuration spacing');
    }
  };

  validateThemeConfig();
}