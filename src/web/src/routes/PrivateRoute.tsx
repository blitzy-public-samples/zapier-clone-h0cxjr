/**
 * @fileoverview Private route component for managing authenticated access
 * Requirements addressed:
 * - Private Route Management (Technical Specification/User Interface Design/Responsive Breakpoints)
 *   Ensures that authenticated users can access restricted pages while redirecting
 *   unauthenticated users to the login page.
 * 
 * Human Tasks:
 * 1. Review default redirect path for unauthenticated users
 * 2. Verify route protection behavior with security team
 * 3. Test route transitions with different authentication states
 */

// react v18.2.0
import React from 'react';
// react-router-dom v6.14.1
import { Route, Navigate } from 'react-router-dom';

// Internal imports
import useAuth from '../hooks/useAuth';

interface PrivateRouteProps {
  /**
   * Child components to render when authenticated
   */
  children: React.ReactNode;
  
  /**
   * Route path to protect
   */
  path: string;
}

/**
 * PrivateRoute component that manages access to protected routes
 * Redirects unauthenticated users to the login page and allows
 * authenticated users to access the protected route
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  path
}) => {
  // Get authentication state from useAuth hook
  const { isAuthenticated, loading, error } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
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
        {error}
      </div>
    );
  }

  // Render route based on authentication state
  return (
    <Route
      path={path}
      element={
        isAuthenticated ? (
          // Render children for authenticated users
          children
        ) : (
          // Redirect unauthenticated users to login page
          <Navigate
            to="/login"
            replace={true}
            state={{ from: path }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;