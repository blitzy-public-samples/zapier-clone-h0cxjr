// @ts-check
import styled from 'styled-components';
import { primaryColor, secondaryColor } from '../../styles/variables';
import { applyFlexCenter, applySpacing } from '../../styles/mixins';

/**
 * Requirement: Design System Specifications - Color Palette
 * Tooltip container with consistent styling and positioning
 */
export const tooltipContainer = styled.div`
  ${applyFlexCenter()};
  position: absolute;
  background-color: ${primaryColor};
  color: #ffffff;
  padding: ${applySpacing('2')} ${applySpacing('3')};
  border-radius: ${applySpacing('1')};
  font-size: 14px;
  line-height: 1.5;
  max-width: 250px;
  min-width: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;

  &.visible {
    opacity: 1;
    visibility: visible;
  }

  &.top {
    bottom: calc(100% + ${applySpacing('2')});
    left: 50%;
    transform: translateX(-50%);
  }

  &.bottom {
    top: calc(100% + ${applySpacing('2')});
    left: 50%;
    transform: translateX(-50%);
  }

  &.left {
    right: calc(100% + ${applySpacing('2')});
    top: 50%;
    transform: translateY(-50%);
  }

  &.right {
    left: calc(100% + ${applySpacing('2')});
    top: 50%;
    transform: translateY(-50%);
  }
`;

/**
 * Requirement: Design System Specifications - Color Palette
 * Tooltip arrow with consistent styling and positioning
 */
export const tooltipArrow = styled.div`
  position: absolute;
  width: ${applySpacing('2')};
  height: ${applySpacing('2')};
  background-color: ${primaryColor};
  
  &.top {
    bottom: -${applySpacing('1')};
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }

  &.bottom {
    top: -${applySpacing('1')};
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }

  &.left {
    right: -${applySpacing('1')};
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  &.right {
    left: -${applySpacing('1')};
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  &.error {
    background-color: ${secondaryColor};
  }
`;