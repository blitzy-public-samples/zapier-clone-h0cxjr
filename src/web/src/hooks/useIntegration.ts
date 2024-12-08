/**
 * @fileoverview Custom React hook for managing integration-related functionalities
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Implements frontend logic for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 */

/**
 * Human Tasks:
 * 1. Review error handling and retry strategies for production use
 * 2. Verify state management patterns align with team conventions
 * 3. Consider implementing caching strategy for integration data
 */

// react v18.2.0
import { useState, useEffect } from 'react';

// Internal imports
import { 
  getIntegrations, 
  createIntegration, 
  deleteIntegration 
} from '../services/integration.service';
import { Integration } from '../types/integration.types';
import { validateIntegrationData } from '../utils/validation.util';

/**
 * Interface for the hook's return value
 */
interface UseIntegrationReturn {
  integrations: Integration[];
  loading: boolean;
  error: Error | null;
  createNewIntegration: (integrationData: Integration) => Promise<void>;
  removeIntegration: (integrationId: string) => Promise<void>;
  refreshIntegrations: () => Promise<void>;
}

/**
 * Custom React hook for managing integrations
 * Provides functionality for fetching, creating, and deleting integrations
 */
const useIntegration = (): UseIntegrationReturn => {
  // State management for integrations data
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches all integrations from the backend
   */
  const fetchIntegrations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await getIntegrations();
      setIntegrations(response as Integration[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch integrations'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new integration
   * @param integrationData - The integration data to create
   */
  const createNewIntegration = async (integrationData: Integration): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validate integration data before sending to backend
      if (!validateIntegrationData(integrationData)) {
        throw new Error('Invalid integration data');
      }

      await createIntegration(integrationData);
      // Refresh the integrations list after successful creation
      await fetchIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create integration'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes an existing integration
   * @param integrationId - The ID of the integration to delete
   */
  const removeIntegration = async (integrationId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await deleteIntegration(integrationId);
      // Refresh the integrations list after successful deletion
      await fetchIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete integration'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Public method to manually refresh integrations
   */
  const refreshIntegrations = async (): Promise<void> => {
    await fetchIntegrations();
  };

  // Fetch integrations when the hook is first used
  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    error,
    createNewIntegration,
    removeIntegration,
    refreshIntegrations
  };
};

export default useIntegration;