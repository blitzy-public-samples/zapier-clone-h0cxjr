/**
 * @fileoverview Public route component for managing unauthenticated access
 * Requirements addressed:
 * - Routing System (Technical Specification/User Interface Design/Critical User Flows)
 *   Implements the routing system for navigating between different pages of the application,
 *   ensuring proper access control and user experience.
 * 
 * Human Tasks:
 * 1. Review default redirect path for authenticated users
 * 2. Verify route protection behavior with security team
 * 3. Test route transitions with different authentication states
 */

// react v18.2.0
import React from 'react';
// react-router-dom v6.14.1
import { Route, Navigate } from 'react-router-dom';

// Internal imports
import { AUTH_CONFIG } from '../config/auth.config';
import useAuth from '../hooks/useAuth';
import { Button } from '../components/common/Button/Button';

interface PublicRouteProps {
  /**
   * Component to render if user is not authenticated
   */
  component: React.ComponentType<any>;
  /**
   * Path to redirect to if user is authenticated
   */
  redirectPath?: string;
  /**
   * Additional props to pass to the component
   */
  [key: string]: any;
}

/**
 * PublicRoute component that manages access to public routes
 * Redirects authenticated users to a specified path and allows
 * unauthenticated users to access the route
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  redirectPath = '/dashboard',
  ...rest
}) => {
  // Get authentication state from useAuth hook
  const { isAuthenticated, loading, error } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Button
          variant="primary"
          isLoading={true}
          disabled={true}
        >
          Loading...
        </Button>
      </div>
    );
  }

  // Show error message if authentication check fails
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'red' 
      }}>
        {AUTH_CONFIG.ERROR_MESSAGES.UNAUTHORIZED_ACCESS}
      </div>
    );
  }

  // Render route based on authentication state
  return (
    <Route
      {...rest}
      element={
        isAuthenticated ? (
          // Redirect authenticated users to specified path
          <Navigate
            to={redirectPath}
            replace={true}
          />
        ) : (
          // Render component for unauthenticated users
          <Component />
        )
      }
    />
  );
};

export default PublicRoute;