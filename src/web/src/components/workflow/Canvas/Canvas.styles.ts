/**
 * CSS-in-JS styles for the Canvas component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify that the grid background pattern matches design specifications
 * 2. Confirm that node and connection styles align with UX requirements
 * 3. Test canvas interactions with different viewport sizes
 * 4. Validate accessibility of visual indicators and contrast ratios
 */

import { CSSProperties } from 'react';
import { primaryColor, secondaryColor } from '../../../styles/variables';
import { applyFlexCenter, applySpacing } from '../../../styles/mixins';
import { theme } from '../../../styles/theme';

// Requirement: Design System Specifications - Consistent styling for the Canvas component
export const canvasStyles: {
  container: CSSProperties;
  node: CSSProperties;
  connection: CSSProperties;
} = {
  // Main container for the workflow canvas
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    backgroundImage: `
      linear-gradient(${theme.colors.border} 1px, transparent 1px),
      linear-gradient(90deg, ${theme.colors.border} 1px, transparent 1px)
    `,
    backgroundSize: `${theme.spacing.xl} ${theme.spacing.xl}`,
    backgroundPosition: 'center center',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'grab',
    padding: theme.spacing.xl,
    boxSizing: 'border-box',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.base,
    boxShadow: theme.shadows.base,

    // Apply when canvas is being dragged
    '&:active': {
      cursor: 'grabbing'
    }
  },

  // Workflow node styling
  node: {
    ...JSON.parse(applyFlexCenter()),
    position: 'absolute',
    minWidth: '200px',
    minHeight: '100px',
    backgroundColor: theme.colors.background,
    border: `2px solid ${primaryColor}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    boxShadow: theme.shadows.md,
    transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
    zIndex: theme.zIndex.base,
    
    // Node hover state
    '&:hover': {
      boxShadow: theme.shadows.lg,
      transform: 'scale(1.02)',
    },

    // Node selected state
    '&.selected': {
      borderColor: theme.colors.accent,
      boxShadow: `0 0 0 2px ${theme.colors.accent}33`,
    },

    // Node dragging state
    '&.dragging': {
      opacity: 0.7,
      cursor: 'grabbing',
    }
  },

  // Connection line styling
  connection: {
    position: 'absolute',
    pointerEvents: 'none',
    stroke: secondaryColor,
    strokeWidth: 2,
    fill: 'none',
    opacity: 0.8,
    transition: 'stroke 0.2s ease-in-out',
    
    // Connection hover state
    '&:hover': {
      stroke: primaryColor,
      strokeWidth: 3,
    },

    // Connection selected state
    '&.selected': {
      stroke: theme.colors.accent,
      strokeWidth: 3,
      opacity: 1,
    },

    // Connection animation for flow indication
    '&.animated': {
      strokeDasharray: '5,5',
      animation: 'flowAnimation 1s linear infinite',
    },

    '@keyframes flowAnimation': {
      '0%': {
        strokeDashoffset: 10,
      },
      '100%': {
        strokeDashoffset: 0,
      },
    }
  }
};