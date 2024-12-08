/**
 * @fileoverview API configuration constants for the web application.
 * Requirements addressed:
 * - API Configuration Constants (Technical Specification/System Design/API Design)
 *   Centralizes API-related constants to ensure consistency and maintainability 
 *   across the web application.
 */

/**
 * Human Tasks:
 * 1. Review API timeout value for production environment requirements
 * 2. Confirm if additional headers are needed for specific environments
 * 3. Verify if CORS headers should be included in DEFAULT_HEADERS
 */

// Import utility functions for API configuration
import { getApiEndpoint } from '../config/api.config';
import { validateAuthData } from '../utils/validation.util';

/**
 * Default timeout duration for API requests in milliseconds
 * This value is used as the default request timeout across the application
 * to ensure consistent timeout behavior
 */
export const API_TIMEOUT = 5000;

/**
 * Default headers to be included in all API requests
 * These headers ensure proper content type handling and other standard
 * HTTP request configurations
 */
export const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };