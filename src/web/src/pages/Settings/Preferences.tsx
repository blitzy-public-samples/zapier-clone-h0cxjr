/**
 * Preferences page component for managing user preferences
 * 
 * Human Tasks:
 * 1. Verify theme selection options match design system
 * 2. Test notification settings across different browsers
 * 3. Review form validation behavior with UX team
 * 4. Ensure preference changes persist across sessions
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import { themeConstants } from '../../constants/theme.constants';
import { validateAuthData } from '../../utils/validation.util';
import { useTheme } from '../../hooks/useTheme';
import useNotification from '../../hooks/useNotification';
import { makeRequest } from '../../services/api.service';
import { uiSlice } from '../../store/slices/uiSlice';

// Theme options for the theme selector
const themeOptions = [
  { value: 'light', label: 'Light Theme' },
  { value: 'dark', label: 'Dark Theme' },
  { value: 'system', label: 'System Default' }
];

// Notification frequency options
const notificationFrequencyOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'hourly', label: 'Hourly Digest' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' }
];

interface UserPreferences {
  theme: string;
  notificationFrequency: string;
  emailNotifications: boolean;
  displayName: string;
}

/**
 * PreferencesPage component for managing user preferences
 * Requirement: User Preferences Management - Provides interface for managing preferences
 */
const PreferencesPage: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const notification = useNotification();
  
  // Initialize preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notificationFrequency: 'immediate',
    emailNotifications: true,
    displayName: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Requirement: User Preferences Management - Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const response = await makeRequest<UserPreferences>({
          method: 'GET',
          url: '/api/preferences'
        });
        
        setPreferences(response);
        // Update theme in Redux store
        dispatch(uiSlice.actions.setTheme(response.theme as 'light' | 'dark'));
      } catch (error) {
        notification.error('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [dispatch, notification]);

  // Handle preference changes
  const handlePreferenceChange = (key: keyof UserPreferences, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Requirement: User Preferences Management - Save user preferences
  const handleSavePreferences = async () => {
    try {
      setIsLoading(true);

      // Validate display name
      if (!validateAuthData({ 
        username: preferences.displayName, 
        password: 'temp',
        token: 'temp'
      })) {
        notification.error('Invalid display name format');
        return;
      }

      await makeRequest({
        method: 'POST',
        url: '/api/preferences',
        data: preferences
      });

      // Update theme in Redux store if changed
      dispatch(uiSlice.actions.setTheme(preferences.theme as 'light' | 'dark'));
      
      notification.success('Preferences saved successfully');
      setHasChanges(false);
    } catch (error) {
      notification.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset preferences to last saved state
  const handleResetPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await makeRequest<UserPreferences>({
        method: 'GET',
        url: '/api/preferences'
      });
      
      setPreferences(response);
      dispatch(uiSlice.actions.setTheme(response.theme as 'light' | 'dark'));
      setHasChanges(false);
      notification.info('Preferences reset to last saved state');
    } catch (error) {
      notification.error('Failed to reset preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Requirement: Design System Specifications - Implement consistent styling
  return (
    <div style={{ 
      padding: theme.spacing.lg,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        color: themeConstants.primaryColor,
        marginBottom: theme.spacing.xl 
      }}>
        Preferences
      </h1>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Theme Settings</h2>
        <Select
          options={themeOptions}
          value={preferences.theme}
          onChange={(value) => handlePreferenceChange('theme', value)}
          placeholder="Select theme"
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Notification Settings</h2>
        <Select
          options={notificationFrequencyOptions}
          value={preferences.notificationFrequency}
          onChange={(value) => handlePreferenceChange('notificationFrequency', value)}
          placeholder="Select notification frequency"
          disabled={isLoading}
        />
        
        <div style={{ 
          marginTop: theme.spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm 
        }}>
          <input
            type="checkbox"
            id="emailNotifications"
            checked={preferences.emailNotifications}
            onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="emailNotifications">
            Receive email notifications
          </label>
        </div>
      </div>

      <div style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Display Settings</h2>
        <Input
          type="text"
          placeholder="Enter display name"
          value={preferences.displayName}
          onChange={(e) => handlePreferenceChange('displayName', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div style={{ 
        display: 'flex',
        gap: theme.spacing.md,
        justifyContent: 'flex-end' 
      }}>
        <Button
          variant="secondary"
          onClick={handleResetPreferences}
          disabled={isLoading || !hasChanges}
        >
          Reset Changes
        </Button>
        <Button
          variant="primary"
          onClick={handleSavePreferences}
          disabled={isLoading || !hasChanges}
          isLoading={isLoading}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default PreferencesPage;