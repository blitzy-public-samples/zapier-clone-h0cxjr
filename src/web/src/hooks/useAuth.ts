/**
 * @fileoverview Custom React hook for managing authentication-related operations
 * Requirements addressed:
 * - Authentication Management (Technical Specification/System Design/Security Architecture)
 *   Provides a reusable hook for managing authentication operations like login, logout,
 *   and token validation in the frontend application.
 * 
 * Human Tasks:
 * 1. Configure JWT_SECRET in environment variables for token validation
 * 2. Set up proper CORS and CSP headers for token storage
 * 3. Review token expiration time based on security requirements
 * 4. Implement rate limiting for authentication endpoints
 */

// Third-party imports
import { useState, useEffect } from 'react'; // v18.2.0

// Internal imports
import { AuthTypes } from '../types/auth.types';
import { AUTH_CONFIG } from '../config/auth.config';
import { setItem, getItem, removeItem } from '../utils/storage.util';
import { login, logout, validateToken } from '../services/auth.service';

/**
 * Custom hook for managing authentication state and operations
 * @returns Object containing authentication state and functions
 */
const useAuth = () => {
  // State for tracking authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Omit<AuthTypes, 'password'> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles user login process
   * @param credentials - Object containing username and password
   * @returns Promise resolving to login success status
   */
  const handleLogin = async (credentials: Pick<AuthTypes, 'username' | 'password'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Call login service
      const { token, user: userData } = await login(credentials);

      // Store token in localStorage
      await setItem('auth_token', token);

      // Update authentication state
      setIsAuthenticated(true);
      setUser(userData);

      return true;
    } catch (error) {
      setError(AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user logout process
   */
  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Call logout service
      await logout();

      // Remove token from localStorage
      await removeItem('auth_token');

      // Reset authentication state
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      setError(AUTH_CONFIG.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validates the current authentication token
   * @returns Promise resolving to validation status
   */
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = await getItem('auth_token');

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      // Validate token
      const isValid = await validateToken(token);

      if (!isValid) {
        await handleLogout();
        return false;
      }

      // Update authentication state if token is valid
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      if (error.message === AUTH_CONFIG.ERROR_MESSAGES.TOKEN_EXPIRED) {
        await handleLogout();
      }
      setError(AUTH_CONFIG.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const validateAuth = async () => {
      await checkAuthStatus();
    };

    validateAuth();

    // Set up token expiration check interval
    const tokenCheckInterval = setInterval(validateAuth, AUTH_CONFIG.TOKEN_EXPIRATION_TIME * 1000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    checkAuthStatus
  };
};

export default useAuth;