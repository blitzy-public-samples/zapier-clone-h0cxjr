/**
 * CSS Mixins for consistent styling and layout management
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * These mixins provide reusable styling patterns that ensure consistency across the application's UI
 */

import { baseSpacingUnit } from './variables';

/**
 * Mixin that applies flexbox centering for both horizontal and vertical alignment
 * Requirement: Design System Specifications - Layout Patterns
 * 
 * @returns CSS rules for flexbox centering
 */
export const applyFlexCenter = (): string => `
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * Mixin that applies consistent spacing based on the design system's base spacing unit
 * Requirement: Design System Specifications - Spacing System
 * 
 * @param multiplier - Number to multiply the base spacing unit by
 * @returns CSS rules with calculated spacing value
 */
export const applySpacing = (multiplier: string): string => {
  // Remove 'px' from the base unit for calculation
  const baseUnit = parseInt(baseSpacingUnit);
  const calculatedValue = baseUnit * parseFloat(multiplier);
  return `${calculatedValue}px`;
};