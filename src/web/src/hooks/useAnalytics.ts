/**
 * @fileoverview Custom React hook for interacting with analytics-related state and services.
 * Requirements addressed:
 * - Analytics Platform (Technical Specification/System Overview/High-Level Description)
 *   Provides comprehensive monitoring and optimization tools for workflows and system performance.
 */

// Human Tasks:
// 1. Verify Redux store is properly configured with analytics reducer
// 2. Ensure proper error tracking setup for analytics operations
// 3. Review analytics data refresh strategy with the team

// react-redux v8.1.2
import { useSelector, useDispatch } from 'react-redux';

// Internal imports
import { fetchAnalyticsData, formatAnalyticsData } from '../services/analytics.service';
import { validateAnalyticsData } from '../utils/validation.util';
import analyticsSlice from '../store/slices/analyticsSlice';

/**
 * Type definition for the analytics state in Redux store
 */
interface AnalyticsState {
  analytics: {
    data: any;
    loading: boolean;
    error: string | null;
  };
}

/**
 * Custom hook for interacting with analytics-related state and services.
 * Provides a unified interface for fetching, formatting, and validating analytics data.
 * 
 * @returns Object containing analytics state and utility functions
 */
const useAnalytics = () => {
  // Initialize Redux hooks
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: AnalyticsState) => state.analytics);

  /**
   * Fetches analytics data and updates the Redux store
   * @param endpoint Optional endpoint parameter for specific analytics data
   */
  const fetchAnalytics = async (endpoint?: string) => {
    try {
      dispatch(analyticsSlice.actions.setAnalyticsData(null));
      const rawData = await fetchAnalyticsData(endpoint || 'analytics');
      const formattedData = formatAnalyticsData(rawData);
      dispatch(analyticsSlice.actions.setAnalyticsData(formattedData));
    } catch (error) {
      dispatch(analyticsSlice.actions.setAnalyticsData(null));
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  };

  /**
   * Validates the current analytics data in the store
   * @returns boolean indicating whether the current data is valid
   */
  const validateAnalytics = (): boolean => {
    if (!data) {
      return false;
    }
    return validateAnalyticsData(data);
  };

  /**
   * Refreshes analytics data by fetching the latest data
   * @param endpoint Optional endpoint parameter for specific analytics data
   */
  const refreshAnalytics = async (endpoint?: string) => {
    await fetchAnalytics(endpoint);
  };

  /**
   * Clears the current analytics data from the store
   */
  const clearAnalytics = () => {
    dispatch(analyticsSlice.actions.setAnalyticsData(null));
  };

  return {
    // State
    data,
    loading,
    error,
    
    // Functions
    fetchAnalytics,
    validateAnalytics,
    refreshAnalytics,
    clearAnalytics,
    
    // Utility indicator
    hasData: !!data,
    isValid: validateAnalytics()
  };
};

export default useAnalytics;