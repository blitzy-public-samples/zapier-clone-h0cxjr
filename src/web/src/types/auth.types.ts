/**
 * @fileoverview Authentication types and validation utilities
 * Requirements addressed:
 * - Authentication Data Structures (Technical Specification/System Design/API Design)
 *   Provides type definitions for authentication-related data structures to ensure 
 *   type safety and consistency across the application.
 */

/**
 * Global constants for authentication error messages
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password.',
  TOKEN_EXPIRED: 'Authentication token has expired.',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource.'
} as const;

/**
 * Token expiration time in seconds (1 hour)
 */
export const TOKEN_EXPIRATION_TIME = 3600;

/**
 * Interface defining the structure of authentication-related data
 */
export interface AuthTypes {
  /**
   * User's unique identifier for authentication
   */
  username: string;

  /**
   * User's password for authentication
   */
  password: string;

  /**
   * JWT token for maintaining authenticated session
   */
  token: string;
}

/**
 * Validates authentication-related data structures to ensure they conform to the defined types
 * @param authData - The authentication data object to validate
 * @returns boolean indicating whether the data is valid
 */
export const validateAuthData = (authData: Partial<AuthTypes>): boolean => {
  // Check if the username property exists and is a non-empty string
  if (!authData.username || typeof authData.username !== 'string' || authData.username.trim() === '') {
    return false;
  }

  // Check if the password property exists and is a non-empty string
  if (!authData.password || typeof authData.password !== 'string' || authData.password.trim() === '') {
    return false;
  }

  // Check if the token property exists and is a non-empty string
  if (!authData.token || typeof authData.token !== 'string' || authData.token.trim() === '') {
    return false;
  }

  return true;
};