/**
 * Global CSS styles for the Workflow Automation Platform
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify that CSS reset styles don't conflict with third-party component libraries
 * 2. Test global styles across different browsers for consistency
 * 3. Ensure font loading performance is optimized
 * 4. Validate accessibility of base text styles (color contrast, font sizes)
 */

import { primaryColor, secondaryColor, fontPrimary, fontSecondary } from './variables';
import { applyFlexCenter, applySpacing } from './mixins';
import { theme } from './theme';

/**
 * Applies global CSS styles to the application
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 */
export const applyGlobalStyles = (): void => {
  // Create and append style element
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* CSS Reset and Box Model */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Root Variables */
    :root {
      --primary-color: ${theme.colors.primary};
      --secondary-color: ${theme.colors.secondary};
      --background-color: ${theme.colors.background};
      --text-primary: ${theme.colors.textPrimary};
      --text-secondary: ${theme.colors.textSecondary};
      --font-primary: ${theme.fonts.primary};
      --font-secondary: ${theme.fonts.secondary};
      --base-spacing: ${theme.spacing.baseUnit};
    }

    /* Base HTML and Body Styles */
    html, body {
      height: 100%;
      width: 100%;
      font-family: ${fontPrimary};
      font-size: ${theme.fonts.sizes.base};
      line-height: ${theme.fonts.lineHeights.normal};
      color: ${theme.colors.textPrimary};
      background-color: ${theme.colors.background};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Typography Base Styles */
    h1, h2, h3, h4, h5, h6 {
      font-family: ${fontPrimary};
      font-weight: ${theme.fonts.weights.bold};
      color: ${theme.colors.textPrimary};
      margin-bottom: ${theme.spacing.md};
    }

    h1 { font-size: ${theme.fonts.sizes['3xl']}; }
    h2 { font-size: ${theme.fonts.sizes['2xl']}; }
    h3 { font-size: ${theme.fonts.sizes.xl}; }
    h4 { font-size: ${theme.fonts.sizes.lg}; }
    h5 { font-size: ${theme.fonts.sizes.base}; }
    h6 { font-size: ${theme.fonts.sizes.sm}; }

    /* Paragraph and Text Elements */
    p {
      margin-bottom: ${theme.spacing.md};
      line-height: ${theme.fonts.lineHeights.relaxed};
    }

    /* Links */
    a {
      color: ${primaryColor};
      text-decoration: none;
      transition: color 0.2s ease-in-out;

      &:hover {
        color: ${theme.colors.primaryLight};
      }
    }

    /* Code and Pre Elements */
    code, pre {
      font-family: ${fontSecondary};
      font-size: ${theme.fonts.sizes.sm};
      background-color: ${theme.colors.surface};
      border-radius: ${theme.borderRadius.base};
    }

    pre {
      padding: ${theme.spacing.md};
      overflow-x: auto;
    }

    /* Lists */
    ul, ol {
      margin: ${theme.spacing.md} 0;
      padding-left: ${theme.spacing.xl};
    }

    /* Form Elements */
    input, textarea, select, button {
      font-family: ${fontPrimary};
      font-size: ${theme.fonts.sizes.base};
    }

    /* Button Reset */
    button {
      border: none;
      background: none;
      cursor: pointer;
      padding: 0;

      &:disabled {
        cursor: not-allowed;
      }
    }

    /* Image Handling */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    /* Table Base Styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: ${theme.spacing.md} 0;
    }

    th, td {
      padding: ${theme.spacing.sm};
      border-bottom: 1px solid ${theme.colors.border};
      text-align: left;
    }

    /* Selection Styles */
    ::selection {
      background-color: ${theme.colors.primary};
      color: ${theme.colors.background};
    }

    /* Scrollbar Styles */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${theme.colors.surface};
    }

    ::-webkit-scrollbar-thumb {
      background: ${secondaryColor};
      border-radius: ${theme.borderRadius.full};
    }

    /* Focus Outline */
    :focus {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    /* Utility Classes */
    .flex-center {
      ${applyFlexCenter()}
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  // Append styles to document head
  document.head.appendChild(styleElement);
};