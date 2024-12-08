/**
 * Theme configuration for the Workflow Automation Platform
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify theme values match latest brand guidelines
 * 2. Ensure theme tokens are used consistently across components
 * 3. Review spacing scale for responsive design needs
 * 4. Validate theme configuration with design team
 */

import {
  primaryColor,
  secondaryColor,
  accentColor,
  fontPrimary,
  fontSecondary,
  baseSpacingUnit
} from './variables';

import {
  applyFlexCenter,
  applySpacing
} from './mixins';

/**
 * Core theme object containing all design tokens and styling configurations
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 */
export const theme = {
  // Color palette configuration
  colors: {
    primary: primaryColor,    // Main brand color for primary actions
    secondary: secondaryColor, // Supporting color for secondary elements
    accent: accentColor,      // Highlight color for success states
    
    // Extended color variations
    primaryLight: '#4B83F2',  // Lighter shade of primary for hover states
    primaryDark: '#1D4ED8',   // Darker shade of primary for active states
    
    // Neutral colors
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textDisabled: '#9CA3AF',
    
    // Semantic colors
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6'
  },

  // Typography configuration
  fonts: {
    primary: fontPrimary,     // Main content font family
    secondary: fontSecondary, // Monospace font family for technical content
    
    // Font sizes
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    },
    
    // Font weights
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    
    // Line heights
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  // Spacing configuration
  spacing: {
    baseUnit: baseSpacingUnit,
    
    // Spacing scale
    xs: applySpacing('1'),    // 4px
    sm: applySpacing('2'),    // 8px
    md: applySpacing('4'),    // 16px
    lg: applySpacing('6'),    // 24px
    xl: applySpacing('8'),    // 32px
    '2xl': applySpacing('12') // 48px
  },

  // Border radius configuration
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  },

  // Shadow configuration
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },

  // Layout helpers
  mixins: {
    flexCenter: applyFlexCenter,
    getSpacing: applySpacing
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
};