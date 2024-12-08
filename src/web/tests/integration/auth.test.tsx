/**
 * @fileoverview Integration test suite for authentication-related functionalities
 * Requirements addressed:
 * - Authentication Testing (Technical Specification/System Design/Security Architecture)
 *   Ensures the reliability and correctness of authentication functionalities such as
 *   login, logout, and token validation.
 *
 * Human Tasks:
 * 1. Configure test environment variables for JWT_SECRET
 * 2. Set up test database with sample user credentials
 * 3. Review and adjust test timeouts if needed
 * 4. Configure test coverage thresholds
 */

// Third-party imports
import { render, screen, fireEvent } from '@testing-library/react'; // v13.4.0
import { describe, it, expect } from 'jest'; // v29.0.0

// Internal imports
import { login, logout, validateToken } from '../../src/services/auth.service';
import { AUTH_ERROR_MESSAGES } from '../../src/constants/auth.constants';
import useAuth from '../../src/hooks/useAuth';

describe('Authentication Integration Tests', () => {
  // Test credentials
  const validCredentials = {
    username: 'testuser',
    password: 'testpass123'
  };

  const invalidCredentials = {
    username: 'wronguser',
    password: 'wrongpass'
  };

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      
      // Act
      const loginResult = await result.current.login(validCredentials);
      
      // Assert
      expect(loginResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.username).toBe(validCredentials.username);
      expect(localStorage.getItem('auth_token')).toBeTruthy();
    });

    it('should fail login with invalid credentials', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      
      // Act
      const loginResult = await result.current.login(invalidCredentials);
      
      // Assert
      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
      expect(localStorage.getItem('auth_token')).toBeFalsy();
    });

    it('should handle network errors during login', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      
      // Act
      const loginResult = await result.current.login(validCredentials);
      
      // Assert
      expect(loginResult).toBe(false);
      expect(result.current.error).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
      expect(localStorage.getItem('auth_token')).toBeFalsy();
    });
  });

  describe('Logout Functionality', () => {
    it('should successfully logout authenticated user', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      await result.current.login(validCredentials);
      
      // Act
      await result.current.logout();
      
      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeFalsy();
    });

    it('should handle errors during logout', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      await result.current.login(validCredentials);
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      
      // Act
      await result.current.logout();
      
      // Assert
      expect(result.current.error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Token Validation', () => {
    it('should validate valid token', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      await result.current.login(validCredentials);
      const token = localStorage.getItem('auth_token');
      
      // Act
      const isValid = await validateToken(token!);
      
      // Assert
      expect(isValid).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should reject expired token', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      await result.current.login(validCredentials);
      
      // Simulate token expiration
      jest.advanceTimersByTime(3600 * 1000 + 1000); // Move past token expiration time
      
      // Act & Assert
      await expect(result.current.checkAuthStatus()).rejects.toThrow(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED);
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeFalsy();
    });

    it('should handle missing token', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      localStorage.removeItem('auth_token');
      
      // Act
      const checkResult = await result.current.checkAuthStatus();
      
      // Assert
      expect(checkResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Authentication State Management', () => {
    it('should maintain authentication state across page reloads', async () => {
      // Arrange
      const { result, rerender } = renderHook(() => useAuth());
      await result.current.login(validCredentials);
      
      // Act - Simulate page reload
      rerender();
      
      // Assert
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
    });

    it('should clear authentication state on token expiration', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      await result.current.login(validCredentials);
      
      // Simulate token expiration
      jest.advanceTimersByTime(3600 * 1000 + 1000);
      
      // Act
      await result.current.checkAuthStatus();
      
      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeFalsy();
    });
  });

  // Helper function to setup mock timers
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    localStorage.clear();
  });
});