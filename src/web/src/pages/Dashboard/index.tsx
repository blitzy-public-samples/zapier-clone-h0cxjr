/**
 * Dashboard Page Component
 * Requirements addressed:
 * - Analytics Dashboard (Technical Specification/User Interface Design/Analytics Dashboard)
 *   Provides a comprehensive dashboard for visualizing analytics data using various chart types.
 * - Authentication Management (Technical Specification/System Design/Security Architecture)
 *   Ensures that only authenticated users can access the Dashboard page.
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Ensures consistent typography, color palette, spacing, and other design elements.
 * 
 * Human Tasks:
 * 1. Verify analytics data refresh intervals with product team
 * 2. Review dashboard layout responsiveness across different screen sizes
 * 3. Validate chart accessibility with screen readers
 * 4. Test dashboard performance with large datasets
 */

// react v18.2.0
import React, { useEffect } from 'react';

// Internal imports
import Dashboard from '../../components/analytics/Dashboard/Dashboard';
import AppShell from '../../components/layout/AppShell/AppShell';
import useAnalytics from '../../hooks/useAnalytics';
import useAuth from '../../hooks/useAuth';
import { theme } from '../../styles/theme';

/**
 * DashboardPage component that integrates analytics visualization, authentication,
 * and consistent layout styling.
 */
const DashboardPage: React.FC = () => {
  // Get authentication state and utilities
  const { isAuthenticated, loading: authLoading, checkAuthStatus } = useAuth();

  // Get analytics data and utilities
  const { 
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    fetchAnalytics
  } = useAnalytics();

  // Check authentication status on mount
  useEffect(() => {
    const validateAuth = async () => {
      const isValid = await checkAuthStatus();
      if (!isValid) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    };

    validateAuth();
  }, [checkAuthStatus]);

  // Fetch analytics data when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, fetchAnalytics]);

  // Handle loading state
  if (authLoading || analyticsLoading) {
    return (
      <AppShell>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: theme.spacing.xl,
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.primary
        }}>
          Loading dashboard data...
        </div>
      </AppShell>
    );
  }

  // Handle error state
  if (analyticsError) {
    return (
      <AppShell>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: theme.spacing.xl,
          color: theme.colors.error,
          fontFamily: theme.fonts.primary
        }}>
          Error loading dashboard data. Please try again.
        </div>
      </AppShell>
    );
  }

  // Handle unauthorized access
  if (!isAuthenticated) {
    return (
      <AppShell>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: theme.spacing.xl,
          color: theme.colors.error,
          fontFamily: theme.fonts.primary
        }}>
          Please log in to access the dashboard.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        minHeight: '100%',
        width: '100%'
      }}>
        <Dashboard />
      </div>
    </AppShell>
  );
};

export default DashboardPage;