/**
 * @fileoverview API configuration settings and utility functions for the web application.
 * Requirements addressed:
 * - API Configuration Management (Technical Specification/System Design/API Design)
 *   Centralizes API configuration settings and utility functions to ensure consistency 
 *   and maintainability across the web application.
 */

/**
 * Human Tasks:
 * 1. Verify the REACT_APP_API_BASE_URL environment variable is set in the deployment environment
 * 2. Review API timeout value for production environment requirements
 * 3. Confirm if additional headers are needed for specific environments
 */

// Import validation utility
import { validateAuthData } from '../utils/validation.util';

/**
 * Base URL for all API requests
 * Uses environment variable if available, falls back to localhost
 */
export const BASE_API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Default timeout for API requests in milliseconds
 */
export const API_TIMEOUT = 5000;

/**
 * Default headers to be included in all API requests
 */
export const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Constructs a full API endpoint URL by appending the provided path to the base API URL
 * @param path - The API endpoint path to append to the base URL
 * @returns The complete API endpoint URL
 */
export const getApiEndpoint = (path: string): string => {
    // Remove leading slash from path if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Remove trailing slash from base URL if present
    const cleanBaseUrl = BASE_API_URL.endsWith('/') 
        ? BASE_API_URL.slice(0, -1) 
        : BASE_API_URL;
    
    // Combine base URL and path
    return `${cleanBaseUrl}/${cleanPath}`;
};