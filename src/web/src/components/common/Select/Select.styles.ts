/**
 * Styled components and CSS-in-JS styles for the Select component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify hover and focus states meet accessibility guidelines
 * 2. Test dropdown positioning across different viewport sizes
 * 3. Validate color contrast ratios for all states
 * 4. Review keyboard navigation behavior
 */

import styled from 'styled-components'; // @types/styled-components@5.1.x
import { primaryColor, secondaryColor } from '../../styles/variables';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';
import { theme } from '../../styles/theme';

// Requirement: Design System Specifications - Defines consistent styling for form elements
export const SelectStyles = {
  container: styled.div`
    position: relative;
    width: 100%;
    min-width: 200px;
    font-family: ${theme.fonts.primary};
    
    /* Base select input styling */
    select {
      width: 100%;
      padding: ${theme.spacing.sm} ${theme.spacing.md};
      background-color: ${theme.colors.background};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.borderRadius.base};
      color: ${theme.colors.textPrimary};
      font-size: ${theme.fonts.sizes.base};
      line-height: ${theme.fonts.lineHeights.normal};
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      
      /* Custom dropdown arrow */
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right ${theme.spacing.sm} center;
      padding-right: ${theme.spacing.xl};

      &:hover {
        border-color: ${primaryColor};
      }

      &:focus {
        outline: none;
        border-color: ${primaryColor};
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      &:disabled {
        background-color: ${theme.colors.surface};
        color: ${theme.colors.textDisabled};
        cursor: not-allowed;
      }
    }
  `,

  dropdown: styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: ${theme.spacing.xs};
    background-color: ${theme.colors.background};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.base};
    box-shadow: ${theme.shadows.md};
    z-index: ${theme.zIndex.dropdown};
    max-height: 250px;
    overflow-y: auto;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: ${theme.colors.surface};
    }

    &::-webkit-scrollbar-thumb {
      background: ${secondaryColor};
      border-radius: ${theme.borderRadius.full};
    }
  `,

  option: styled.div`
    ${applyFlexCenter()};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    color: ${theme.colors.textPrimary};
    font-size: ${theme.fonts.sizes.base};
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    justify-content: flex-start;

    &:hover {
      background-color: ${theme.colors.surface};
    }

    &.selected {
      background-color: rgba(37, 99, 235, 0.1);
      color: ${primaryColor};
      font-weight: ${theme.fonts.weights.medium};
    }

    &.disabled {
      color: ${theme.colors.textDisabled};
      cursor: not-allowed;
      background-color: transparent;
    }

    /* Add spacing between options */
    & + & {
      border-top: 1px solid ${theme.colors.border};
    }
  `
};