/**
 * @fileoverview Authentication constants for the web application
 * Requirements addressed:
 * - Authentication Constants (Technical Specification/System Design/Security Architecture)
 *   Provides reusable constants for authentication-related operations, such as 
 *   error messages and token expiration time.
 */

import { AuthTypes } from '../types/auth.types';

/**
 * Token expiration time in seconds (1 hour)
 * This constant defines how long an authentication token remains valid
 * before requiring the user to re-authenticate
 */
export const TOKEN_EXPIRATION_TIME: number = 3600;

/**
 * Authentication error messages used consistently across the application
 * These messages provide user-friendly feedback for various authentication
 * failure scenarios
 */
export const AUTH_ERROR_MESSAGES = {
  /**
   * Displayed when provided credentials do not match stored user credentials
   */
  INVALID_CREDENTIALS: 'Invalid username or password.',

  /**
   * Displayed when the authentication token has exceeded its validity period
   */
  TOKEN_EXPIRED: 'Authentication token has expired.',

  /**
   * Displayed when attempting to access resources without proper authorization
   */
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource.'
} as const;

// Type assertion to ensure type safety for the error messages object
type AuthErrorMessages = typeof AUTH_ERROR_MESSAGES;

/**
 * Type guard to check if a given key exists in AUTH_ERROR_MESSAGES
 * @param key - The key to check
 * @returns boolean indicating whether the key exists in AUTH_ERROR_MESSAGES
 */
export const isAuthErrorMessage = (key: string): key is keyof AuthErrorMessages => {
  return key in AUTH_ERROR_MESSAGES;
};