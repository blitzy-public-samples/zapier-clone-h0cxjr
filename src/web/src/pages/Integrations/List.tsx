/**
 * @fileoverview Integrations List page component
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a user interface for managing 500+ app connectors, including viewing,
 *   creating, updating, and deleting integrations.
 */

/**
 * Human Tasks:
 * 1. Review table pagination settings for large datasets (500+ integrations)
 * 2. Verify error handling and retry strategies for production use
 * 3. Test integration management with large datasets
 * 4. Validate accessibility compliance for data tables and forms
 */

// react v18.2.0
import React, { useState, useEffect, useCallback } from 'react';

// Internal imports
import { Integration } from '../../types/integration.types';
import { getIntegration, deleteIntegration } from '../../services/integration.service';
import Connector from '../../components/integration/Connector/Connector';
import Table from '../../components/common/Table/Table';
import { Button } from '../../components/common/Button/Button';
import { useTheme } from '../../hooks/useTheme';

/**
 * IntegrationsList component displays a list of integrations in a tabular format
 * and provides functionality to manage them.
 */
const IntegrationsList: React.FC = () => {
  // State management
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [showConnector, setShowConnector] = useState<boolean>(false);

  // Get theme configuration
  const theme = useTheme();

  /**
   * Fetches the list of integrations from the backend
   */
  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll fetch a single integration as an example
      // In production, this would be replaced with a service call to get all integrations
      const sampleIntegration = await getIntegration('sample-id');
      setIntegrations([sampleIntegration]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch integrations'));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handles the deletion of an integration
   */
  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      setLoading(true);
      await deleteIntegration(integrationId);
      await fetchIntegrations(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete integration'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles changes to integration data (create/update)
   */
  const handleIntegrationChange = async (integration: Integration) => {
    await fetchIntegrations();
    setShowConnector(false);
  };

  // Column definitions for the integrations table
  const columns = [
    {
      key: 'name',
      header: 'Integration Name',
    },
    {
      key: 'status',
      header: 'Status',
      formatter: (value: string) => (
        <span style={{ 
          color: value === 'active' ? theme.colors.success : theme.colors.textSecondary 
        }}>
          {value}
        </span>
      ),
    },
    {
      key: 'workflows',
      header: 'Workflows',
      formatter: (workflows: Array<{ workflowId: string }>) => workflows.length.toString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      formatter: (_, row: Integration) => (
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleDeleteIntegration(row.integrationId)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Fetch integrations on component mount
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return (
    <div style={{ padding: theme.spacing.lg }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: theme.spacing.lg 
      }}>
        <h1 style={{ 
          fontFamily: theme.fonts.primary,
          fontSize: theme.fonts.sizes['2xl'],
          color: theme.colors.textPrimary,
          margin: 0
        }}>
          Integrations
        </h1>
        <Button
          variant="primary"
          onClick={() => setShowConnector(true)}
        >
          Create Integration
        </Button>
      </div>

      {error && (
        <div style={{ 
          padding: theme.spacing.md,
          marginBottom: theme.spacing.lg,
          backgroundColor: theme.colors.error,
          color: 'white',
          borderRadius: theme.borderRadius.base
        }}>
          {error.message}
        </div>
      )}

      {showConnector && (
        <div style={{ marginBottom: theme.spacing.xl }}>
          <Connector
            onIntegrationChange={handleIntegrationChange}
          />
        </div>
      )}

      <Table
        data={integrations}
        columns={columns}
        className={loading ? 'loading' : ''}
      />

      {loading && (
        <div style={{ 
          textAlign: 'center',
          padding: theme.spacing.lg,
          color: theme.colors.textSecondary
        }}>
          Loading integrations...
        </div>
      )}
    </div>
  );
};

export default IntegrationsList;