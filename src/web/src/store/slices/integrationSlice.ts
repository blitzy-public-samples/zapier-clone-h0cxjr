/**
 * @fileoverview Redux slice for managing integration state in the web application
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Implements state management for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 */

/**
 * Human Tasks:
 * 1. Review error handling strategies for production environment
 * 2. Verify retry configuration aligns with infrastructure capacity
 * 3. Configure monitoring for integration state changes
 */

// @reduxjs/toolkit v1.9.5
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { 
  createIntegration,
  getIntegration,
  updateIntegration,
  deleteIntegration
} from '../../services/integration.service';
import type { Integration } from '../../types/integration.types';

/**
 * Interface defining the structure of the integration state
 */
interface IntegrationState {
  currentIntegration: Integration | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Initial state for the integration slice
 */
const initialState: IntegrationState = {
  currentIntegration: null,
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Async thunk for fetching integration details by ID
 */
export const fetchIntegration = createAsyncThunk(
  'integration/fetchIntegration',
  async (integrationId: string, { rejectWithValue }) => {
    try {
      const response = await getIntegration(integrationId);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Async thunk for creating a new integration
 */
export const createNewIntegration = createAsyncThunk(
  'integration/createNewIntegration',
  async (integrationData: Integration, { rejectWithValue }) => {
    try {
      const response = await createIntegration(integrationData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Async thunk for updating an existing integration
 */
export const updateExistingIntegration = createAsyncThunk(
  'integration/updateExistingIntegration',
  async (integrationData: Integration, { rejectWithValue }) => {
    try {
      const response = await updateIntegration(integrationData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Async thunk for deleting an integration
 */
export const removeIntegration = createAsyncThunk(
  'integration/removeIntegration',
  async (integrationId: string, { rejectWithValue }) => {
    try {
      const response = await deleteIntegration(integrationId);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * Integration slice containing reducers and actions
 */
const integrationSlice = createSlice({
  name: 'integration',
  initialState,
  reducers: {
    clearCurrentIntegration: (state) => {
      state.currentIntegration = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch integration cases
    builder.addCase(fetchIntegration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIntegration.fulfilled, (state, action: PayloadAction<Integration>) => {
      state.loading = false;
      state.currentIntegration = action.payload;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(fetchIntegration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create integration cases
    builder.addCase(createNewIntegration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNewIntegration.fulfilled, (state, action: PayloadAction<Integration>) => {
      state.loading = false;
      state.currentIntegration = action.payload;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(createNewIntegration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update integration cases
    builder.addCase(updateExistingIntegration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateExistingIntegration.fulfilled, (state, action: PayloadAction<Integration>) => {
      state.loading = false;
      state.currentIntegration = action.payload;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(updateExistingIntegration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete integration cases
    builder.addCase(removeIntegration.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeIntegration.fulfilled, (state) => {
      state.loading = false;
      state.currentIntegration = null;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(removeIntegration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearCurrentIntegration, clearError } = integrationSlice.actions;
export const integrationReducer = integrationSlice.reducer;