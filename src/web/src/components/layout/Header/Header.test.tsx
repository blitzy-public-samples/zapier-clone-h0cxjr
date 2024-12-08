/**
 * Unit tests for the Header component
 * Requirements addressed:
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 * - Authentication Management (Technical Specification/System Design/Security Architecture)
 * 
 * Human Tasks:
 * 1. Verify test coverage meets team standards
 * 2. Review mocked authentication states with security team
 * 3. Validate accessibility testing requirements
 * 4. Ensure all edge cases are covered
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';

// Internal imports
import Header from './Header';
import { HeaderStyles } from './Header.styles';
import useAuth from '../../hooks/useAuth';
import { validateAuthData } from '../../utils/validation.util';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the useTheme hook
jest.mock('../../hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({
    colors: {
      textSecondary: '#4B5563'
    },
    spacing: {
      sm: '8px'
    }
  })
}));

describe('Header Component', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    test('renders Header with all elements when not authenticated', () => {
      // Mock unauthenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn()
      });

      render(<Header />);

      // Verify container element
      const container = screen.getByRole('banner');
      expect(container).toBeInTheDocument();
      expect(container).toHaveStyle(`
        position: sticky;
        top: 0;
      `);

      // Verify title element
      const title = screen.getByText('Workflow Automation');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');

      // Verify login button for unauthenticated state
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('variant', 'primary');
    });

    test('renders Header with authenticated user elements', () => {
      // Mock authenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser', token: 'test-token' },
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn()
      });

      render(<Header />);

      // Verify username display
      const username = screen.getByText('testuser');
      expect(username).toBeInTheDocument();

      // Verify logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveAttribute('variant', 'secondary');
    });

    test('renders Header with loading state', () => {
      // Mock loading state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: true,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn()
      });

      render(<Header />);

      // Verify loading button state
      const loadingButton = screen.getByRole('button', { name: /loading/i });
      expect(loadingButton).toBeInTheDocument();
      expect(loadingButton).toBeDisabled();
      expect(loadingButton).toHaveAttribute('variant', 'secondary');
    });
  });

  describe('Authentication Integration Tests', () => {
    test('handles logout action correctly', () => {
      // Mock authenticated state with logout function
      const mockLogout = jest.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser', token: 'test-token' },
        loading: false,
        error: null,
        login: jest.fn(),
        logout: mockLogout,
        checkAuthStatus: jest.fn()
      });

      render(<Header />);

      // Click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Verify logout was called
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test('handles login navigation correctly', () => {
      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, href: '' };

      // Mock unauthenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthStatus: jest.fn()
      });

      render(<Header />);

      // Click login button
      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      // Verify navigation
      expect(window.location.href).toBe('/login');

      // Restore window.location
      window.location = originalLocation;
    });

    test('handles logout error gracefully', async () => {
      // Mock console.error to test error handling
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock authenticated state with failing logout
      const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser', token: 'test-token' },
        loading: false,
        error: null,
        login: jest.fn(),
        logout: mockLogout,
        checkAuthStatus: jest.fn()
      });

      render(<Header />);

      // Click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Wait for async logout to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));

      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});