/**
 * Styles for the PropertyPanel component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 */

import { CSSProperties } from 'react';
import { primaryColor, secondaryColor } from '../../../styles/variables';
import { applyFlexCenter, applySpacing } from '../../../styles/mixins';
import { theme } from '../../../styles/theme';

/**
 * Requirement: Design System Specifications - Defines typography, color palette, spacing system
 * Exports styles for the PropertyPanel component's layout and visual appearance
 */
export const PropertyPanelStyles: {
  container: CSSProperties;
  header: CSSProperties;
  content: CSSProperties;
} = {
  container: {
    width: '320px',
    height: '100%',
    backgroundColor: theme.colors.surface,
    borderLeft: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows.md,
    position: 'relative',
    overflow: 'hidden',
    transition: 'width 0.3s ease-in-out',
  },

  header: {
    ...JSON.parse(applyFlexCenter()),
    justifyContent: 'space-between',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    minHeight: '64px',
    
    // Typography settings for the header
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.textPrimary,
    
    // Ensure header stays at top during scroll
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
  },

  content: {
    flex: 1,
    padding: theme.spacing.lg,
    overflowY: 'auto',
    overflowX: 'hidden',
    
    // Scrollbar styling
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.colors.surface,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: secondaryColor,
      borderRadius: theme.borderRadius.full,
    },
    
    // Spacing between content items
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing.md,
    },
    
    // Background pattern for empty state
    backgroundImage: 
      `linear-gradient(45deg, ${theme.colors.surface} 25%, transparent 25%), ` +
      `linear-gradient(-45deg, ${theme.colors.surface} 25%, transparent 25%), ` +
      `linear-gradient(45deg, transparent 75%, ${theme.colors.surface} 75%), ` +
      `linear-gradient(-45deg, transparent 75%, ${theme.colors.surface} 75%)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
};