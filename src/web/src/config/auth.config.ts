/**
 * @fileoverview Authentication configuration and token management for the web application
 * Requirements addressed:
 * - Authentication Configuration (Technical Specification/System Design/Security Architecture)
 *   Provides centralized configuration for authentication-related settings, such as 
 *   token expiration and error messages.
 * 
 * Human Tasks:
 * 1. Ensure localStorage is available and enabled in the target browsers
 * 2. Configure Content Security Policy (CSP) to allow localStorage usage
 * 3. Review token expiration time and adjust if needed based on security requirements
 */

import { 
  TOKEN_EXPIRATION_TIME,
  AUTH_ERROR_MESSAGES
} from '../constants/auth.constants';

// Local storage key for the authentication token
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Authentication configuration object containing token expiration time
 * and standardized error messages
 */
export const AUTH_CONFIG = {
  TOKEN_EXPIRATION_TIME,
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
    TOKEN_EXPIRED: AUTH_ERROR_MESSAGES.TOKEN_EXPIRED,
    UNAUTHORIZED_ACCESS: AUTH_ERROR_MESSAGES.UNAUTHORIZED_ACCESS
  }
} as const;

/**
 * Stores the authentication token in localStorage
 * @param token - The JWT token to store
 * @throws Error if localStorage is not available
 */
export const setToken = (token: string): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }
    
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing authentication token:', error);
    throw error;
  }
};

/**
 * Retrieves the authentication token from localStorage
 * @returns The stored token or null if not found
 * @throws Error if localStorage is not available
 */
export const getToken = (): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving authentication token:', error);
    return null;
  }
};

/**
 * Removes the authentication token from localStorage
 * @throws Error if localStorage is not available
 */
export const removeToken = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing authentication token:', error);
    throw error;
  }
};