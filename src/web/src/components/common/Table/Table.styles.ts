/**
 * Styled components and CSS-in-JS styles for the Table component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify table styles meet accessibility guidelines for data tables
 * 2. Test table responsiveness across all breakpoints
 * 3. Validate table styles with design team for consistency
 */

import styled from 'styled-components'; // @types/styled-components@5.1.x
import { primaryColor, secondaryColor, fontPrimary } from '../../styles/variables';
import { applySpacing } from '../../styles/mixins';
import { theme } from '../../styles/theme';

// Requirement: Design System Specifications - Consistent table container styling
export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.base};
  box-shadow: ${theme.shadows.sm};
  margin: ${theme.spacing.md} 0;
  border: 1px solid ${theme.colors.border};
`;

// Requirement: Design System Specifications - Table header styling with brand colors
export const TableHeader = styled.thead`
  background-color: ${theme.colors.surface};
  border-bottom: 2px solid ${theme.colors.border};

  th {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-family: ${theme.fonts.primary};
    font-weight: ${theme.fonts.weights.semibold};
    font-size: ${theme.fonts.sizes.sm};
    color: ${theme.colors.textPrimary};
    text-align: left;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &:first-child {
      padding-left: ${theme.spacing.lg};
    }

    &:last-child {
      padding-right: ${theme.spacing.lg};
    }
  }
`;

// Requirement: Design System Specifications - Table row styling with hover states
export const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${theme.colors.surface};
  }

  // Zebra striping for better readability
  &:nth-child(even) {
    background-color: ${theme.colors.background};
  }

  &:nth-child(odd) {
    background-color: ${theme.colors.surface};
  }
`;

// Requirement: Design System Specifications - Table cell styling with consistent spacing
export const TableCell = styled.td`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-family: ${theme.fonts.primary};
  font-size: ${theme.fonts.sizes.base};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.fonts.lineHeights.normal};
  vertical-align: middle;

  &:first-child {
    padding-left: ${theme.spacing.lg};
  }

  &:last-child {
    padding-right: ${theme.spacing.lg};
  }

  // Style for cells containing actions or buttons
  &.actions {
    text-align: right;
    white-space: nowrap;
  }

  // Style for cells containing status indicators
  &.status {
    font-weight: ${theme.fonts.weights.medium};
  }

  // Responsive text truncation
  &.truncate {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// Export all table-related styled components
export const TableStyles = {
  tableContainer: TableContainer,
  tableHeader: TableHeader,
  tableRow: TableRow,
  tableCell: TableCell,
};