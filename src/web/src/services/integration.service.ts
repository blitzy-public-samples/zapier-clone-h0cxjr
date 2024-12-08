/**
 * @fileoverview Integration service for managing app connectors and integrations
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Implements service-level logic for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 */

/**
 * Human Tasks:
 * 1. Verify API endpoint configuration in deployment environment
 * 2. Review retry and timeout settings for production use
 * 3. Configure rate limiting parameters based on infrastructure capacity
 */

// axios v1.4.0
import axios from 'axios';

import { Integration } from '../types/integration.types';
import { getApiEndpoint } from '../config/api.config';
import { validateIntegrationData } from '../utils/validation.util';
import { API_TIMEOUT, DEFAULT_HEADERS } from '../constants/api.constants';

/**
 * Creates a new integration by sending a POST request to the backend API
 * @param integrationData - The integration data to create
 * @returns Promise resolving to the created integration response
 * @throws Error if validation fails or API request fails
 */
export const createIntegration = async (integrationData: Integration): Promise<object> => {
  try {
    // Validate integration data before sending to API
    if (!validateIntegrationData(integrationData)) {
      throw new Error('Invalid integration data provided');
    }

    // Construct API endpoint for integration creation
    const endpoint = getApiEndpoint('/integrations');

    // Send POST request to create integration
    const response = await axios.post(endpoint, integrationData, {
      headers: DEFAULT_HEADERS,
      timeout: API_TIMEOUT
    });

    return response.data;
  } catch (error) {
    // Enhance error with context before rethrowing
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create integration: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Retrieves integration details by ID from the backend API
 * @param integrationId - The ID of the integration to retrieve
 * @returns Promise resolving to the integration details
 * @throws Error if API request fails
 */
export const getIntegration = async (integrationId: string): Promise<Integration> => {
  try {
    if (!integrationId || typeof integrationId !== 'string') {
      throw new Error('Invalid integration ID provided');
    }

    // Construct API endpoint for integration retrieval
    const endpoint = getApiEndpoint(`/integrations/${integrationId}`);

    // Send GET request to retrieve integration
    const response = await axios.get<Integration>(endpoint, {
      headers: DEFAULT_HEADERS,
      timeout: API_TIMEOUT
    });

    return response.data;
  } catch (error) {
    // Enhance error with context before rethrowing
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to retrieve integration: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Updates an existing integration by sending a PUT request to the backend API
 * @param integrationData - The updated integration data
 * @returns Promise resolving to the updated integration response
 * @throws Error if validation fails or API request fails
 */
export const updateIntegration = async (integrationData: Integration): Promise<object> => {
  try {
    // Validate integration data before sending to API
    if (!validateIntegrationData(integrationData)) {
      throw new Error('Invalid integration data provided');
    }

    // Construct API endpoint for integration update
    const endpoint = getApiEndpoint(`/integrations/${integrationData.integrationId}`);

    // Send PUT request to update integration
    const response = await axios.put(endpoint, integrationData, {
      headers: DEFAULT_HEADERS,
      timeout: API_TIMEOUT
    });

    return response.data;
  } catch (error) {
    // Enhance error with context before rethrowing
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to update integration: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Deletes an integration by ID by sending a DELETE request to the backend API
 * @param integrationId - The ID of the integration to delete
 * @returns Promise resolving to the deletion response
 * @throws Error if API request fails
 */
export const deleteIntegration = async (integrationId: string): Promise<object> => {
  try {
    if (!integrationId || typeof integrationId !== 'string') {
      throw new Error('Invalid integration ID provided');
    }

    // Construct API endpoint for integration deletion
    const endpoint = getApiEndpoint(`/integrations/${integrationId}`);

    // Send DELETE request to remove integration
    const response = await axios.delete(endpoint, {
      headers: DEFAULT_HEADERS,
      timeout: API_TIMEOUT
    });

    return response.data;
  } catch (error) {
    // Enhance error with context before rethrowing
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete integration: ${error.message}`);
    }
    throw error;
  }
};