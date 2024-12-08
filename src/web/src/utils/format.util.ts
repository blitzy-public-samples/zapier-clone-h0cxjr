/**
 * @fileoverview Utility functions for formatting data structures and strings used across the web application.
 * Requirements addressed:
 * - Data Formatting (Technical Specification/System Design/User Interface Design)
 *   Provides utility functions to format data structures and strings for consistent presentation
 *   in the user interface.
 */

import { API_TIMEOUT } from '../constants/api.constants';
import { themeConstants } from '../constants/theme.constants';
import { WORKFLOW_STATUS_MAPPING } from '../constants/workflow.constants';
import { validateAuthData } from './validation.util';

/**
 * Formats the API timeout value into a human-readable string.
 * Requirement: Data Formatting - Consistent presentation of timeout values
 * 
 * @returns A formatted string representing the API timeout value
 */
export const formatApiTimeout = (): string => {
  // Convert milliseconds to seconds for better readability
  const timeoutInSeconds = API_TIMEOUT / 1000;
  
  // Format with appropriate unit
  if (timeoutInSeconds < 60) {
    return `${timeoutInSeconds} seconds`;
  } else {
    const minutes = Math.floor(timeoutInSeconds / 60);
    const seconds = timeoutInSeconds % 60;
    return seconds > 0 
      ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds > 1 ? 's' : ''}`
      : `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Formats a workflow status into a human-readable string using the WORKFLOW_STATUS_MAPPING.
 * Requirement: Data Formatting - Consistent presentation of workflow statuses
 * 
 * @param status - The workflow status to format
 * @returns A human-readable string representing the workflow status
 */
export const formatWorkflowStatus = (status: string): string => {
  // Check if the status exists in the mapping
  if (status in WORKFLOW_STATUS_MAPPING) {
    return WORKFLOW_STATUS_MAPPING[status as keyof typeof WORKFLOW_STATUS_MAPPING];
  }
  
  // Return a default message for unknown statuses
  return 'Status information unavailable';
};

/**
 * Applies theme-specific colors to a given text.
 * Requirement: Data Formatting - Consistent theme-based text styling
 * 
 * @param text - The text to style
 * @param colorType - The type of color to apply ('primary' | 'secondary')
 * @returns A string wrapped with HTML span tags and styled with the specified theme color
 */
export const applyThemeToText = (text: string, colorType: 'primary' | 'secondary'): string => {
  // Get the appropriate color from theme constants
  const color = colorType === 'primary' 
    ? themeConstants.primaryColor 
    : themeConstants.secondaryColor;
  
  // Return text wrapped in a styled span tag
  return `<span style="color: ${color}">${text}</span>`;
};