/**
 * Custom React hook for accessing and managing the application's theme configuration
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify theme hook usage in components follows design system guidelines
 * 2. Ensure theme values are properly propagated to styled components
 * 3. Test theme hook performance with React DevTools
 * 4. Review theme hook integration with design system documentation
 */

// Import theme configuration and constants
// Requirement: Design System Specifications - Defines typography, color palette, spacing system
import { colors, fonts, spacing } from '../styles/theme';
import { themeConfig } from '../config/theme.config';

/**
 * Interface defining the structure of the theme object returned by the hook
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 */
interface ThemeConfiguration {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    weights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    baseUnit: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

/**
 * Custom hook that provides access to the application's theme configuration
 * Requirement: Design System Specifications - Ensures consistent styling across components
 * 
 * @returns {ThemeConfiguration} Theme configuration object containing colors, fonts, and spacing
 */
export const useTheme = (): ThemeConfiguration => {
  // Combine theme constants and configuration
  const themeObject: ThemeConfiguration = {
    colors: {
      ...colors,
      primary: themeConfig.themeConstants.primaryColor,
      secondary: themeConfig.themeConstants.secondaryColor,
      accent: themeConfig.themeConstants.accentColor
    },
    fonts: {
      ...fonts,
      primary: themeConfig.themeConstants.fontPrimary,
      secondary: themeConfig.themeConstants.fontSecondary
    },
    spacing: {
      ...spacing,
      baseUnit: themeConfig.themeConstants.baseSpacingUnit
    }
  };

  return themeObject;
};