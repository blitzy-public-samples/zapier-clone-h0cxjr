/**
 * @fileoverview Utility functions for managing localStorage and sessionStorage operations
 * Requirements addressed:
 * - Storage Management (Technical Specification/System Design/User Interface Design)
 *   Provides utility functions to manage localStorage and sessionStorage for storing
 *   application data such as tokens, user preferences, and temporary states.
 * 
 * Human Tasks:
 * 1. Ensure localStorage/sessionStorage is available in target browsers
 * 2. Configure Content Security Policy (CSP) to allow localStorage/sessionStorage usage
 * 3. Review storage quota limits for target browsers
 * 4. Implement data cleanup strategy if storage limits are reached
 */

import { TOKEN_EXPIRATION_TIME } from '../config/auth.config';
import { validateAuthData } from '../utils/validation.util';

/**
 * Checks if storage (localStorage/sessionStorage) is available
 * @param useSessionStorage - Flag to check sessionStorage instead of localStorage
 * @returns The appropriate storage object if available
 * @throws Error if storage is not available
 */
const getStorage = (useSessionStorage: boolean): Storage => {
  if (typeof window === 'undefined') {
    throw new Error('Storage is not available: Window object is undefined');
  }

  const storage = useSessionStorage ? window.sessionStorage : window.localStorage;
  
  if (!storage) {
    throw new Error(`${useSessionStorage ? 'sessionStorage' : 'localStorage'} is not available`);
  }

  return storage;
};

/**
 * Stores a key-value pair in localStorage or sessionStorage
 * @param key - The key to store the value under
 * @param value - The value to store
 * @param useSessionStorage - Optional flag to use sessionStorage instead of localStorage
 * @throws Error if storage is not available or if serialization fails
 */
export const setItem = (key: string, value: string, useSessionStorage = false): void => {
  try {
    const storage = getStorage(useSessionStorage);
    
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    if (value === undefined || value === null) {
      throw new Error('Invalid value provided for storage');
    }

    const serializedValue = JSON.stringify(value);
    storage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

/**
 * Retrieves a value by key from localStorage or sessionStorage
 * @param key - The key to retrieve the value for
 * @param useSessionStorage - Optional flag to use sessionStorage instead of localStorage
 * @returns The retrieved value or null if not found
 * @throws Error if storage is not available or if deserialization fails
 */
export const getItem = (key: string, useSessionStorage = false): string | null => {
  try {
    const storage = getStorage(useSessionStorage);
    
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    const serializedValue = storage.getItem(key);
    if (serializedValue === null) {
      return null;
    }

    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Removes a key-value pair from localStorage or sessionStorage
 * @param key - The key to remove
 * @param useSessionStorage - Optional flag to use sessionStorage instead of localStorage
 * @throws Error if storage is not available
 */
export const removeItem = (key: string, useSessionStorage = false): void => {
  try {
    const storage = getStorage(useSessionStorage);
    
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    storage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

/**
 * Removes expired tokens from localStorage
 * This function checks the token's expiration time and removes it if expired
 * @throws Error if token validation or removal fails
 */
export const clearExpiredTokens = (): void => {
  try {
    const storage = getStorage(false); // Always use localStorage for tokens
    const token = storage.getItem('auth_token');

    if (!token) {
      return;
    }

    // Validate the token structure
    if (!validateAuthData({ token, username: 'temp', password: 'temp' })) {
      removeItem('auth_token');
      return;
    }

    // Check token expiration
    const tokenData = JSON.parse(token);
    const tokenTimestamp = new Date(tokenData.timestamp).getTime();
    const currentTime = new Date().getTime();
    const expirationTime = tokenTimestamp + (TOKEN_EXPIRATION_TIME * 1000); // Convert to milliseconds

    if (currentTime >= expirationTime) {
      removeItem('auth_token');
    }
  } catch (error) {
    console.error('Error clearing expired tokens:', error);
    throw error;
  }
};