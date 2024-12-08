/**
 * @fileoverview Provides a centralized service for making API requests, handling configurations,
 * and managing responses and errors in the web application.
 * 
 * Requirements addressed:
 * - API Request Management (Technical Specification/System Design/API Design)
 *   Centralizes API request handling, including configuration, error management,
 *   and response processing, to ensure consistency and maintainability.
 */

/**
 * Human Tasks:
 * 1. Review and adjust API timeout values based on production requirements
 * 2. Configure error monitoring/logging service integration
 * 3. Verify CORS settings in deployment environment
 * 4. Set up API request rate limiting if needed
 */

// axios version: ^1.4.0
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getApiEndpoint } from '../config/api.config';
import { validateAuthData } from '../utils/validation.util';
import { API_TIMEOUT, DEFAULT_HEADERS } from '../constants/api.constants';

/**
 * Interface for API error response structure
 */
interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

/**
 * Makes an API request with the specified configuration
 * @param config - Axios request configuration
 * @returns Promise resolving to the API response
 * @throws Error if the request fails
 */
export const makeRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    // Merge provided configuration with default settings
    const mergedConfig: AxiosRequestConfig = {
      timeout: API_TIMEOUT,
      headers: { ...DEFAULT_HEADERS, ...config.headers },
      ...config,
    };

    // If URL is provided as a relative path, construct full endpoint
    if (config.url && !config.url.startsWith('http')) {
      mergedConfig.url = getApiEndpoint(config.url);
    }

    // Make the request using axios
    const response: AxiosResponse<T> = await axios(mergedConfig);
    return response.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Log error details for monitoring
      console.error('API Request Failed:', {
        url: config.url,
        method: config.method,
        status: axiosError.response?.status,
        error: axiosError.response?.data || axiosError.message,
      });

      // Throw error with meaningful message
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'An error occurred while making the API request'
      );
    }

    // Handle non-axios errors
    console.error('Unexpected Error:', error);
    throw error;
  }
};

/**
 * Sends a GET request to the specified API endpoint
 * @param endpoint - API endpoint path
 * @param params - Query parameters
 * @returns Promise resolving to the API response
 */
export const get = async <T>(
  endpoint: string, 
  params?: Record<string, unknown>
): Promise<T> => {
  return makeRequest<T>({
    method: 'GET',
    url: endpoint,
    params,
  });
};

/**
 * Sends a POST request to the specified API endpoint
 * @param endpoint - API endpoint path
 * @param data - Request body data
 * @returns Promise resolving to the API response
 */
export const post = async <T>(
  endpoint: string, 
  data?: unknown
): Promise<T> => {
  // Validate auth data if present
  if (data && 'username' in (data as object) && 'password' in (data as object)) {
    const isValid = validateAuthData(data as any);
    if (!isValid) {
      throw new Error('Invalid authentication data provided');
    }
  }

  return makeRequest<T>({
    method: 'POST',
    url: endpoint,
    data,
  });
};