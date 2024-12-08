/**
 * @fileoverview Authentication service implementation for handling login, logout, and token validation
 * Requirements addressed:
 * - Authentication Service (Technical Specification/System Design/Security Architecture)
 *   Implements core authentication functionalities such as login, logout, token validation,
 *   and error handling.
 *
 * Human Tasks:
 * 1. Review and configure token encryption/decryption mechanism
 * 2. Set up secure token storage mechanism in production
 * 3. Configure CORS and CSP headers for token management
 * 4. Implement rate limiting for authentication endpoints
 */

// Third-party imports
import jwt from 'jsonwebtoken'; // v9.0.0

// Internal imports
import { AUTH_CONFIG } from '../config/auth.config';
import { validateAuthData } from '../utils/validation.util';
import { AUTH_ERROR_MESSAGES } from '../constants/auth.constants';
import { AuthTypes } from '../types/auth.types';

/**
 * Handles user login by validating credentials and generating an authentication token
 * @param credentials - Object containing username and password
 * @returns Object containing authentication token and user details
 * @throws Error if credentials are invalid
 */
export const login = async (credentials: Pick<AuthTypes, 'username' | 'password'>): Promise<{
  token: string;
  user: Omit<AuthTypes, 'password'>;
}> => {
  try {
    // Validate the provided credentials
    if (!validateAuthData({ ...credentials, token: 'dummy' })) {
      throw new Error(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT token with expiration time
    const token = jwt.sign(
      { username: credentials.username },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: AUTH_CONFIG.TOKEN_EXPIRATION_TIME }
    );

    // Return token and user details
    return {
      token,
      user: {
        username: credentials.username,
        token
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
  }
};

/**
 * Handles user logout by invalidating the authentication token
 * @throws Error if token removal fails
 */
export const logout = (): void => {
  try {
    // Clear token from storage
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Validates the provided authentication token
 * @param token - JWT token to validate
 * @returns boolean indicating token validity
 * @throws Error if token is expired or invalid
 */
export const validateToken = (token: string): boolean => {
  try {
    // Check if token exists
    if (!token) {
      throw new Error(AUTH_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    // Verify token and check expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret-key'
    );

    // Check if token has expired
    if (typeof decoded === 'object' && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        throw new Error(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED);
      }
    }

    return true;
  } catch (error) {
    if (error.message === AUTH_ERROR_MESSAGES.TOKEN_EXPIRED) {
      throw error;
    }
    console.error('Token validation error:', error);
    throw new Error(AUTH_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }
};