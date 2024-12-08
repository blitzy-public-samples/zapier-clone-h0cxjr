/**
 * Analytics Overview Page
 * Requirements addressed:
 * - Analytics Platform (Technical Specification/System Overview/High-Level Description)
 *   Provides comprehensive monitoring and optimization tools for workflows and system performance.
 * 
 * Human Tasks:
 * 1. Verify analytics data refresh intervals with product team
 * 2. Review analytics dashboard layout responsiveness
 * 3. Validate analytics data visualization accessibility
 */

// react v18.2.0
import React, { useEffect } from 'react';
// react-redux v8.1.2
import { useDispatch, useSelector } from 'react-redux';

// Internal imports
import Dashboard from '../../components/analytics/Dashboard/Dashboard';
import useAnalytics from '../../hooks/useAnalytics';
import { actions } from '../../store/slices/analyticsSlice';

/**
 * Interface for the analytics state in Redux store
 */
interface AnalyticsState {
  analytics: {
    data: any;
    loading: boolean;
    error: string | null;
  };
}

/**
 * Analytics Overview page component that provides a high-level view of analytics data
 * using the Analytics Dashboard component and integrates with analytics-related services.
 * 
 * @returns JSX.Element The rendered Analytics Overview page
 */
const AnalyticsOverview: React.FC = () => {
  // Initialize Redux hooks
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state: AnalyticsState) => state.analytics
  );

  // Initialize analytics hook
  const { 
    fetchAnalytics, 
    refreshAnalytics, 
    validateAnalytics 
  } = useAnalytics();

  // Fetch analytics data on component mount
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await fetchAnalytics();
      } catch (error) {
        console.error('Error initializing analytics:', error);
        dispatch(actions.setAnalyticsData(null));
      }
    };

    initializeAnalytics();

    // Set up periodic refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      refreshAnalytics();
    }, 5 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, [dispatch, fetchAnalytics, refreshAnalytics]);

  // Validate analytics data whenever it changes
  useEffect(() => {
    if (data && !validateAnalytics()) {
      console.warn('Invalid analytics data structure detected');
      dispatch(actions.setAnalyticsData(null));
    }
  }, [data, validateAnalytics, dispatch]);

  return (
    <div 
      style={{ 
        padding: '24px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <h1 
        style={{ 
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '24px',
          color: '#111827'
        }}
      >
        Analytics Overview
      </h1>

      {/* Render the Analytics Dashboard component */}
      <Dashboard />
    </div>
  );
};

export default AnalyticsOverview;