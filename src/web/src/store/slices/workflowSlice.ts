/**
 * @fileoverview Redux slice for managing workflow-related state in the web application.
 * Requirements addressed:
 * - State Management (Technical Specification/System Design/User Interface Design)
 *   Provides a centralized state management solution for workflows, ensuring consistency
 *   and scalability.
 */

/**
 * Human Tasks:
 * 1. Review error handling strategies for production use
 * 2. Verify error messages meet business requirements
 * 3. Confirm loading state behavior aligns with UI requirements
 */

// @reduxjs/toolkit version 1.9.5
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Workflow } from '../../types/workflow.types';
import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '../../services/workflow.service';

/**
 * Interface defining the structure of the workflow state
 */
interface WorkflowState {
  workflows: Workflow[];
  loading: boolean;
  error: string | null;
}

/**
 * Initial state for the workflow slice
 */
const initialState: WorkflowState = {
  workflows: [],
  loading: false,
  error: null,
};

/**
 * Async thunk for fetching workflows from the backend API
 */
export const fetchWorkflows = createAsyncThunk(
  'workflow/fetchWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const workflows = await getWorkflows();
      return workflows;
    } catch (error) {
      return rejectWithValue('Failed to fetch workflows');
    }
  }
);

/**
 * Async thunk for creating a new workflow
 */
export const addWorkflow = createAsyncThunk(
  'workflow/addWorkflow',
  async (workflowData: Workflow, { rejectWithValue }) => {
    try {
      const newWorkflow = await createWorkflow(workflowData);
      return newWorkflow;
    } catch (error) {
      return rejectWithValue('Failed to create workflow');
    }
  }
);

/**
 * Async thunk for updating an existing workflow
 */
export const editWorkflow = createAsyncThunk(
  'workflow/editWorkflow',
  async (workflowData: Workflow, { rejectWithValue }) => {
    try {
      const updatedWorkflow = await updateWorkflow(workflowData);
      return updatedWorkflow;
    } catch (error) {
      return rejectWithValue('Failed to update workflow');
    }
  }
);

/**
 * Async thunk for deleting a workflow
 */
export const removeWorkflow = createAsyncThunk(
  'workflow/removeWorkflow',
  async (workflowId: string, { rejectWithValue }) => {
    try {
      await deleteWorkflow(workflowId);
      return workflowId;
    } catch (error) {
      return rejectWithValue('Failed to delete workflow');
    }
  }
);

/**
 * Workflow slice containing reducers and actions
 */
export const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWorkflows: (state, action: PayloadAction<Workflow[]>) => {
      state.workflows = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch workflows
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add workflow
    builder
      .addCase(addWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows.push(action.payload);
      })
      .addCase(addWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Edit workflow
    builder
      .addCase(editWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.workflows.findIndex(
          (w) => w.workflowId === action.payload.workflowId
        );
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
      })
      .addCase(editWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove workflow
    builder
      .addCase(removeWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = state.workflows.filter(
          (w) => w.workflowId !== action.payload
        );
      })
      .addCase(removeWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLoading, setError, setWorkflows } = workflowSlice.actions;
export default workflowSlice.reducer;