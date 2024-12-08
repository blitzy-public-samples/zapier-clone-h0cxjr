/**
 * @fileoverview Custom React hook for managing notifications in the web application
 * Requirements addressed:
 * - Notification Management (Technical Specification/User Interface Design/Critical User Flows)
 *   Provides a mechanism to manage notifications for user interactions, errors, and system alerts.
 * 
 * Human Tasks:
 * 1. Review notification display duration with UX team
 * 2. Verify notification styles match design system
 * 3. Test notification accessibility with screen readers
 * 4. Confirm notification z-index works with all UI layers
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setItem, getItem } from '../utils/storage.util';
import { uiSlice } from '../store/slices/uiSlice';
import { themeConfig } from '../config/theme.config';

// Notification types supported by the system
type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Structure of a notification object
interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// Default duration for non-persistent notifications (in milliseconds)
const DEFAULT_DURATION = 5000;

// Storage key for persisted notifications
const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';

/**
 * Custom hook for managing notifications in the application
 * @returns Object containing methods to manage notifications
 */
const useNotification = () => {
  const dispatch = useDispatch();
  const { colors } = themeConfig.theme;

  /**
   * Generates a unique ID for notifications
   */
  const generateNotificationId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Shows a notification with the specified parameters
   */
  const showNotification = useCallback(
    (params: Omit<Notification, 'id'>) => {
      const notification: Notification = {
        id: generateNotificationId(),
        type: params.type,
        message: params.message,
        duration: params.duration || DEFAULT_DURATION,
        persistent: params.persistent || false
      };

      // Dispatch notification to Redux store
      dispatch(uiSlice.actions.toggleModal(`notification_${notification.id}`));

      // If notification is persistent, store it
      if (notification.persistent) {
        const existingNotifications = getItem(NOTIFICATIONS_STORAGE_KEY) || '[]';
        const notifications = JSON.parse(existingNotifications);
        notifications.push(notification);
        setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      }

      // Auto-dismiss non-persistent notifications
      if (!notification.persistent) {
        setTimeout(() => {
          dispatch(uiSlice.actions.toggleModal(`notification_${notification.id}`));
        }, notification.duration);
      }

      return notification.id;
    },
    [dispatch]
  );

  /**
   * Updates an existing notification
   */
  const updateNotification = useCallback(
    (id: string, updates: Partial<Omit<Notification, 'id'>>) => {
      const existingNotifications = getItem(NOTIFICATIONS_STORAGE_KEY);
      
      if (existingNotifications) {
        const notifications = JSON.parse(existingNotifications);
        const notificationIndex = notifications.findIndex(
          (n: Notification) => n.id === id
        );

        if (notificationIndex !== -1) {
          notifications[notificationIndex] = {
            ...notifications[notificationIndex],
            ...updates
          };
          setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
        }
      }
    },
    []
  );

  /**
   * Removes a notification by ID
   */
  const removeNotification = useCallback(
    (id: string) => {
      // Remove from Redux store
      dispatch(uiSlice.actions.toggleModal(`notification_${id}`));

      // Remove from persistent storage if exists
      const existingNotifications = getItem(NOTIFICATIONS_STORAGE_KEY);
      if (existingNotifications) {
        const notifications = JSON.parse(existingNotifications);
        const filteredNotifications = notifications.filter(
          (n: Notification) => n.id !== id
        );
        setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filteredNotifications));
      }
    },
    [dispatch]
  );

  /**
   * Helper methods for common notification types
   */
  const success = useCallback(
    (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
      return showNotification({
        type: 'success',
        message,
        ...options
      });
    },
    [showNotification]
  );

  const error = useCallback(
    (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
      return showNotification({
        type: 'error',
        message,
        ...options
      });
    },
    [showNotification]
  );

  const warning = useCallback(
    (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
      return showNotification({
        type: 'warning',
        message,
        ...options
      });
    },
    [showNotification]
  );

  const info = useCallback(
    (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
      return showNotification({
        type: 'info',
        message,
        ...options
      });
    },
    [showNotification]
  );

  return {
    showNotification,
    updateNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
};

export default useNotification;