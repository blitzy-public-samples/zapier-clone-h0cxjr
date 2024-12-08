/**
 * Core design variables for the Workflow Automation Platform
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Ensure Inter and Roboto Mono fonts are included in the project's font loading setup
 * 2. Verify color contrast ratios meet WCAG 2.1 AA compliance
 * 3. Update color values if brand guidelines change
 * 4. Test color combinations for color-blind accessibility
 */

// Primary brand color - Used for main actions, primary buttons, and key UI elements
// Requirement: Design System Specifications - Color Palette
export const primaryColor = '#2563EB';

// Secondary color - Used for secondary actions, supporting UI elements, and text
// Requirement: Design System Specifications - Color Palette
export const secondaryColor = '#64748B';

// Accent color - Used for success states, positive actions, and highlighting
// Requirement: Design System Specifications - Color Palette
export const accentColor = '#10B981';

// Primary font family - Used for main content, headings, and UI text
// Requirement: Design System Specifications - Typography
export const fontPrimary = "'Inter', sans-serif";

// Secondary font family - Used for code blocks, technical content, and monospace needs
// Requirement: Design System Specifications - Typography
export const fontSecondary = "'Roboto Mono', monospace";

// Base spacing unit - Foundation for consistent spacing and layout measurements
// Requirement: Design System Specifications - Spacing System
export const baseSpacingUnit = '4px';