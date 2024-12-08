/**
 * Main routing structure for the web application
 * Requirements addressed:
 * - Routing System (Technical Specification/User Interface Design/Critical User Flows)
 *   Implements the routing system for navigating between different pages of the application,
 *   ensuring proper access control and user experience.
 * 
 * Human Tasks:
 * 1. Verify route protection behavior with security team
 * 2. Test route transitions with different authentication states
 * 3. Review default redirect paths for authenticated/unauthenticated users
 */

// react v18.2.0
import React from 'react';
// react-router-dom v6.14.1
import { Routes, Route } from 'react-router-dom';

// Route components
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Page components
import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import DashboardPage from '../pages/Dashboard/index';
import WorkflowListPage from '../pages/Workflows/List';
import CreateWorkflowPage from '../pages/Workflows/Create';
import EditWorkflowPage from '../pages/Workflows/Edit';
import ViewWorkflowPage from '../pages/Workflows/View';
import IntegrationsList from '../pages/Integrations/List';
import ConfigurePage from '../pages/Integrations/Configure';
import AnalyticsOverview from '../pages/Analytics/Overview';
import ExecutionsPage from '../pages/Analytics/Executions';
import PerformancePage from '../pages/Analytics/Performance';
import ProfilePage from '../pages/Settings/Profile';
import SecuritySettingsPage from '../pages/Settings/Security';
import PreferencesPage from '../pages/Settings/Preferences';

/**
 * AppRoutes component that defines the main routing structure for the application
 * @returns JSX.Element containing the application's routing configuration
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Workflows */}
      <Route
        path="/workflows"
        element={
          <PrivateRoute>
            <WorkflowListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflows/create"
        element={
          <PrivateRoute>
            <CreateWorkflowPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflows/:workflowId/edit"
        element={
          <PrivateRoute>
            <EditWorkflowPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflows/:workflowId"
        element={
          <PrivateRoute>
            <ViewWorkflowPage />
          </PrivateRoute>
        }
      />

      {/* Integrations */}
      <Route
        path="/integrations"
        element={
          <PrivateRoute>
            <IntegrationsList />
          </PrivateRoute>
        }
      />
      <Route
        path="/integrations/configure"
        element={
          <PrivateRoute>
            <ConfigurePage />
          </PrivateRoute>
        }
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AnalyticsOverview />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics/executions"
        element={
          <PrivateRoute>
            <ExecutionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics/performance"
        element={
          <PrivateRoute>
            <PerformancePage />
          </PrivateRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings/security"
        element={
          <PrivateRoute>
            <SecuritySettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings/preferences"
        element={
          <PrivateRoute>
            <PreferencesPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;