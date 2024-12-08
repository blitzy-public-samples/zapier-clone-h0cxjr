/**
 * Styled components and CSS-in-JS styles for the Workflow Builder component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify layout responsiveness on different screen sizes
 * 2. Test component spacing in different viewport dimensions
 * 3. Validate color contrast ratios for accessibility compliance
 */

import { css } from '@emotion/react'; // @emotion/react@11.x
import { colors, spacing } from '../../styles/theme';
import { primaryColor } from '../../styles/variables';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

/**
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 * Exports styled components for the Workflow Builder interface
 */
export const BuilderStyles = {
  // Main container for the workflow builder
  container: css`
    width: 100%;
    height: 100%;
    background-color: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${spacing.sm};
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,

  // Header section containing title and controls
  header: css`
    ${applyFlexCenter()}
    justify-content: space-between;
    padding: ${spacing.md} ${spacing.lg};
    background-color: ${colors.background};
    border-bottom: 1px solid ${colors.border};
    min-height: 64px;

    h1 {
      color: ${colors.textPrimary};
      font-size: ${spacing.lg};
      font-weight: 600;
      margin: 0;
    }

    .controls {
      display: flex;
      gap: ${spacing.sm};
      align-items: center;

      button {
        background-color: ${primaryColor};
        color: ${colors.background};
        border: none;
        padding: ${spacing.sm} ${spacing.md};
        border-radius: ${spacing.xs};
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: ${colors.primaryLight};
        }

        &:active {
          background-color: ${colors.primaryDark};
        }
      }
    }
  `,

  // Main content area for workflow canvas
  content: css`
    flex: 1;
    padding: ${spacing.lg};
    background-color: ${colors.background};
    overflow: auto;
    position: relative;

    // Grid background for visual guidance
    background-image: linear-gradient(
      ${colors.border} 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      ${colors.border} 1px,
      transparent 1px
    );
    background-size: ${applySpacing('20')} ${applySpacing('20')};
    background-position: -1px -1px;

    // Scrollbar styling
    &::-webkit-scrollbar {
      width: ${spacing.sm};
      height: ${spacing.sm};
    }

    &::-webkit-scrollbar-track {
      background: ${colors.surface};
    }

    &::-webkit-scrollbar-thumb {
      background: ${colors.border};
      border-radius: ${spacing.xs};

      &:hover {
        background: ${colors.textDisabled};
      }
    }

    // Canvas zoom and pan container
    .canvas-container {
      min-width: 100%;
      min-height: 100%;
      transform-origin: top left;
    }

    // Node connection lines
    .connection-line {
      stroke: ${primaryColor};
      stroke-width: 2;
      fill: none;
    }

    // Node selection highlight
    .node-selected {
      box-shadow: 0 0 0 2px ${primaryColor};
    }
  `
};