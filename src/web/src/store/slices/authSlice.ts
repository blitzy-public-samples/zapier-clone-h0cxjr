/**
 * @fileoverview Redux slice for managing authentication state
 * Requirements addressed:
 * - Authentication State Management (Technical Specification/System Design/User Interface Design)
 *   Implements state management for authentication, including user login, logout, and token handling.
 *
 * Human Tasks:
 * 1. Ensure proper error handling and logging is configured in production
 * 2. Review token storage mechanism for security compliance
 * 3. Configure token refresh mechanism if needed
 */

// Third-party imports
import { createSlice } from '@reduxjs/toolkit'; // v1.9.5

// Internal imports
import { AuthTypes } from '../../types/auth.types';
import { AUTH_CONFIG } from '../../config/auth.config';
import { 
  login as loginService,
  logout as logoutService,
  validateToken 
} from '../../services/auth.service';

/**
 * Interface defining the authentication state structure
 */
interface AuthState {
  user: Omit<AuthTypes, 'password'> | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Initial state for the authentication slice
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null
};

/**
 * Redux slice for authentication state management
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Updates state on successful login
     */
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },

    /**
     * Updates state on login failure
     */
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },

    /**
     * Clears authentication state on logout
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    /**
     * Updates state when token validation fails
     */
    tokenValidationFailure: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = AUTH_CONFIG.ERROR_MESSAGES.TOKEN_EXPIRED;
    }
  }
});

// Export actions for use in components and thunks
export const { 
  loginSuccess, 
  loginFailure, 
  logout,
  tokenValidationFailure 
} = authSlice.actions;

// Export reducer for store configuration
export const authReducer = authSlice.reducer;

/**
 * Thunk for handling login process
 */
export const loginThunk = (credentials: Pick<AuthTypes, 'username' | 'password'>) => async (dispatch: any) => {
  try {
    const response = await loginService(credentials);
    dispatch(loginSuccess(response));
  } catch (error) {
    dispatch(loginFailure(error.message || AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS));
  }
};

/**
 * Thunk for handling logout process
 */
export const logoutThunk = () => async (dispatch: any) => {
  try {
    await logoutService();
    dispatch(logout());
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the state even if the service call fails
    dispatch(logout());
  }
};

/**
 * Thunk for validating authentication token
 */
export const validateTokenThunk = (token: string) => async (dispatch: any) => {
  try {
    const isValid = await validateToken(token);
    if (!isValid) {
      dispatch(tokenValidationFailure());
    }
  } catch (error) {
    dispatch(tokenValidationFailure());
  }
};