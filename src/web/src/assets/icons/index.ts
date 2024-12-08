/**
 * Central index for managing and exporting icon assets
 * Requirement: Design System Specifications - Ensures consistent use of icons and visual elements
 * across the application by providing a centralized export for all icon assets.
 * 
 * Human Tasks:
 * 1. Verify font files are properly loaded in the application's font loading setup
 * 2. Ensure SVG assets are optimized for production use
 * 3. Validate icon accessibility with screen readers
 * 4. Review icon usage guidelines with design team
 */

// Font imports
// Inter font - Primary typography
import InterFont from '../fonts/inter.woff2';

// Roboto Mono font - Secondary typography for technical content
import RobotoMonoFont from '../fonts/roboto-mono.woff2';

// Logo SVG import
import logo from '../images/logo.svg';

/**
 * Centralized export of all icon-related assets
 * Requirement: Design System Specifications - Provides consistent access to visual assets
 */
export const icons = {
  // Font assets
  InterFont,
  RobotoMonoFont,
  
  // Brand assets
  logo
};

// Named exports for individual access
export {
  InterFont,
  RobotoMonoFont,
  logo
};