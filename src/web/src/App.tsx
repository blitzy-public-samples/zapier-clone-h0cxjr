/**
 * Entry point for the web application
 * Requirements addressed:
 * - Routing System (Technical Specification/User Interface Design/Critical User Flows)
 *   Implements the routing system for navigating between different pages of the application,
 *   ensuring proper access control and user experience.
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Ensures consistent typography, color palette, spacing, and other design elements.
 * 
 * Human Tasks:
 * 1. Verify routing configuration with security team
 * 2. Test route transitions with different authentication states
 * 3. Review default redirect paths for authenticated/unauthenticated users
 */

// react v18.2.0
import React, { useEffect } from 'react';

// Internal imports
import AppRoutes from './routes/index';
import { applyGlobalStyles } from './styles/global';
import useTheme from './hooks/useTheme';
import AppShell from './components/layout/AppShell/AppShell';

/**
 * Main App component that serves as the entry point for the web application
 * Integrates the main layout (AppShell), routing (AppRoutes), and global styles
 * @returns JSX.Element The rendered application structure
 */
const App: React.FC = () => {
  // Get theme configuration
  const theme = useTheme();

  // Apply global styles on component mount
  useEffect(() => {
    applyGlobalStyles();
  }, []);

  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
};

export default App;