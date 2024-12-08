/**
 * @fileoverview Redux store configuration for the web application
 * Requirements addressed:
 * - State Management (Technical Specification/System Design/User Interface Design)
 *   Provides a centralized state management solution by combining multiple slices into a single Redux store.
 */

// Human Tasks:
// 1. Review Redux DevTools configuration for production environment
// 2. Verify middleware configuration aligns with monitoring requirements
// 3. Ensure store configuration supports planned state persistence needs

// @reduxjs/toolkit v1.9.5
import { configureStore } from '@reduxjs/toolkit';

// Import reducers from slices
import { reducer as analyticsReducer } from './slices/analyticsSlice';
import { authReducer } from './slices/authSlice';
import { integrationReducer } from './slices/integrationSlice';
import { uiReducer } from './slices/uiSlice';
import { reducer as workflowReducer } from './slices/workflowSlice';

/**
 * Configure and create the Redux store with combined reducers and middleware
 * Implements centralized state management requirement by combining all feature slices
 */
export const store = configureStore({
  reducer: {
    // Analytics state management
    analytics: analyticsReducer,
    
    // Authentication state management
    auth: authReducer,
    
    // Integration state management
    integration: integrationReducer,
    
    // UI state management
    ui: uiReducer,
    
    // Workflow state management
    workflow: workflowReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Enable runtime checking for common mistakes
      serializableCheck: true,
      // Enable immutability check in development
      immutableCheck: process.env.NODE_ENV !== 'production',
      // Thunk middleware is included by default
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default for use in application
export default store;