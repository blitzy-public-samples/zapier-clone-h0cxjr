/**
 * @fileoverview Analytics service for interacting with the analytics platform
 * Requirements addressed:
 * - Analytics Platform (Technical Specification/System Overview/High-Level Description)
 *   Provides comprehensive monitoring and optimization tools for workflows and system performance.
 */

// Human Tasks:
// 1. Verify API endpoints are correctly configured in the deployment environment
// 2. Ensure proper error tracking is set up for analytics data collection
// 3. Review analytics data retention policies with the team

// axios v1.4.0
import axios from 'axios';

import { BASE_API_URL, getApiEndpoint } from '../config/api.config';
import { formatDate } from '../utils/date.util';
import { formatWorkflowStatus } from '../utils/format.util';

/**
 * Fetches analytics data from the API.
 * @param endpoint - The specific analytics endpoint to fetch data from
 * @returns Promise resolving to the fetched analytics data
 */
export const fetchAnalyticsData = async (endpoint: string): Promise<object> => {
  try {
    // Construct the full API endpoint URL
    const apiUrl = getApiEndpoint(`analytics/${endpoint}`);

    // Send GET request to the analytics endpoint
    const response = await axios.get(apiUrl, {
      timeout: 5000, // 5 second timeout for analytics requests
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    // Log the error for monitoring
    console.error('Error fetching analytics data:', error);
    
    // Rethrow the error for handling by the caller
    throw new Error(`Failed to fetch analytics data: ${(error as Error).message}`);
  }
};

/**
 * Formats raw analytics data for display in the UI.
 * @param data - Raw analytics data object to format
 * @returns Formatted analytics data object
 */
export const formatAnalyticsData = (data: object): object => {
  try {
    // Deep clone the data to avoid modifying the original
    const formattedData = JSON.parse(JSON.stringify(data));

    // Recursively traverse the data object
    const formatDataObject = (obj: any): any => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];

          // Format dates
          if (value instanceof Date) {
            obj[key] = formatDate(value, 'yyyy-MM-dd HH:mm:ss');
          }
          // Format workflow statuses
          else if (key === 'status' && typeof value === 'string') {
            obj[key] = formatWorkflowStatus(value);
          }
          // Recursively format nested objects
          else if (typeof value === 'object' && value !== null) {
            obj[key] = formatDataObject(value);
          }
        }
      }
      return obj;
    };

    return formatDataObject(formattedData);
  } catch (error) {
    console.error('Error formatting analytics data:', error);
    throw new Error(`Failed to format analytics data: ${(error as Error).message}`);
  }
};

/**
 * Validates the structure and content of analytics data.
 * @param data - Analytics data object to validate
 * @returns True if the data is valid, otherwise false
 */
export const validateAnalyticsData = (data: object): boolean => {
  try {
    // Check if data is null or undefined
    if (!data) {
      return false;
    }

    // Check if data is an object
    if (typeof data !== 'object') {
      return false;
    }

    // Validate required fields
    const requiredFields = ['analyticsId', 'workflow', 'execution'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return false;
      }
    }

    // Validate workflow data structure
    const workflow = (data as any).workflow;
    if (!workflow.workflowId || !workflow.name || !workflow.status) {
      return false;
    }

    // Validate execution data structure
    const execution = (data as any).execution;
    if (!execution.executionId || !execution.status) {
      return false;
    }

    // Validate data types
    if (typeof workflow.workflowId !== 'string' ||
        typeof workflow.name !== 'string' ||
        typeof workflow.status !== 'string' ||
        typeof execution.executionId !== 'string' ||
        typeof execution.status !== 'string') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating analytics data:', error);
    return false;
  }
};