/**
 * Header Component
 * Implements requirements from:
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 * - Authentication Management (Technical Specification/System Design/Security Architecture)
 * 
 * Human Tasks:
 * 1. Verify header layout matches design mockups
 * 2. Test responsive behavior across different screen sizes
 * 3. Validate header accessibility (ARIA labels, keyboard navigation)
 * 4. Review authentication state handling with security team
 */

// react v18.2.0
import React from 'react';

// Internal imports
import { HeaderStyles } from './Header.styles';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { Button } from '../../common/Button/Button';

/**
 * Header component that provides navigation, branding, and user actions
 * Requirement: Design System Specifications - Ensures consistent layout and branding
 */
const Header: React.FC = () => {
  // Get authentication state and actions
  const { isAuthenticated, user, loading, logout } = useAuth();
  
  // Get theme configuration
  const theme = useTheme();

  /**
   * Handles user logout action
   * Requirement: Authentication Management - Provides user authentication actions
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <HeaderStyles.container>
      {/* Branding section */}
      <HeaderStyles.title>
        Workflow Automation
      </HeaderStyles.title>

      {/* User actions section */}
      <HeaderStyles.actions>
        {loading ? (
          // Show loading state
          <Button
            variant="secondary"
            size="medium"
            isLoading={true}
            disabled={true}
          >
            Loading...
          </Button>
        ) : isAuthenticated ? (
          // Show authenticated user actions
          <>
            <span style={{ 
              color: theme.colors.textSecondary,
              marginRight: theme.spacing.sm 
            }}>
              {user?.username}
            </span>
            <Button
              variant="secondary"
              size="medium"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          // Show login button for unauthenticated users
          <Button
            variant="primary"
            size="medium"
            onClick={() => window.location.href = '/login'}
          >
            Login
          </Button>
        )}
      </HeaderStyles.actions>
    </HeaderStyles.container>
  );
};

export default Header;