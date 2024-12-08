// @reduxjs/toolkit version: 1.9.5
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Requirement Addressed: State Management
// Location: Technical Specification/System Design/User Interface Design
// Description: Provides a centralized state management solution for UI-related features

interface ModalState {
  [key: string]: boolean;
}

interface UiState {
  modals: ModalState;
  theme: 'light' | 'dark';
  loading: boolean;
}

const initialState: UiState = {
  modals: {},
  theme: 'light',
  loading: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleModal: (state, action: PayloadAction<string>) => {
      const modalName = action.payload;
      state.modals[modalName] = !state.modals[modalName];
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// Export actions for component usage
export const { toggleModal, setTheme, setLoading } = uiSlice.actions;

// Export reducer for store configuration
export const { reducer: uiReducer } = uiSlice;

// Selectors
export const selectModalState = (state: { ui: UiState }, modalName: string): boolean => 
  state.ui.modals[modalName] || false;

export const selectTheme = (state: { ui: UiState }): 'light' | 'dark' => 
  state.ui.theme;

export const selectLoading = (state: { ui: UiState }): boolean => 
  state.ui.loading;

// Default export for store configuration
export default uiSlice.reducer;