/**
 * @fileoverview Redux slice for managing analytics-related state in the web application
 * Requirements addressed:
 * - State Management (Technical Specification/System Design/User Interface Design)
 *   Provides a centralized state management solution for analytics data, ensuring consistency and scalability.
 */

// Human Tasks:
// 1. Verify error handling and logging configuration for analytics state updates
// 2. Review analytics data caching strategy with the team
// 3. Ensure proper error tracking is set up for analytics thunk actions

// @reduxjs/toolkit v1.9.5
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Internal imports
import { analyticsId, workflow, execution } from '../../types/analytics.types';
import { fetchAnalyticsData } from '../../services/analytics.service';

/**
 * Interface for the analytics state structure
 */
interface AnalyticsState {
  data: {
    analyticsId: typeof analyticsId;
    workflow: typeof workflow;
    execution: typeof execution;
  } | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state for the analytics slice
 */
const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null
};

/**
 * Async thunk for fetching analytics data
 * Implements the fetchAnalytics action with proper error handling and loading states
 */
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAnalyticsData('analytics');
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Analytics slice containing reducers and actions for managing analytics state
 */
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsData: (state, action) => {
      state.data = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setAnalyticsData } = analyticsSlice.actions;
export const { reducer } = analyticsSlice;

// Export the slice as default
export default analyticsSlice;