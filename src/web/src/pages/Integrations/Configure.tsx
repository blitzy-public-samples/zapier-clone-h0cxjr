/**
 * Configure Page Component
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a user interface for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Adheres to the design system specifications for consistent UI and UX.
 * 
 * Human Tasks:
 * 1. Verify integration configuration fields with security team
 * 2. Review error handling strategies for production deployment
 * 3. Test integration configuration workflow with QA team
 * 4. Validate accessibility of configuration form with screen readers
 */

// react v18.2.0
import React, { useState, useEffect } from 'react';

// Internal imports
import useIntegration from '../../hooks/useIntegration';
import ConfigPanel from '../../components/integration/ConfigPanel/ConfigPanel';
import { Button } from '../../components/common/Button/Button';
import { validateIntegrationData } from '../../utils/validation.util';
import { Integration } from '../../types/integration.types';
import { theme } from '../../styles/theme';

/**
 * ConfigurePage component for managing integration settings
 * Provides interface for configuring integrations including authentication and permissions
 */
const ConfigurePage: React.FC = () => {
  // Get integration management functions from custom hook
  const { 
    integrations,
    loading,
    error,
    createNewIntegration,
    refreshIntegrations
  } = useIntegration();

  // Local state for the current integration being configured
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch integrations on component mount
  useEffect(() => {
    refreshIntegrations();
  }, [refreshIntegrations]);

  /**
   * Handles saving or updating an integration
   * Validates data before sending to backend
   */
  const handleSave = async (integrationData: Integration) => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Validate integration data
      if (!validateIntegrationData(integrationData)) {
        throw new Error('Invalid integration configuration');
      }

      // Create new integration
      await createNewIntegration(integrationData);

      // Reset current integration and refresh list
      setCurrentIntegration(null);
      await refreshIntegrations();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save integration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      padding: theme.spacing.lg,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <header style={{
        marginBottom: theme.spacing.xl
      }}>
        <h1 style={{
          fontSize: theme.fonts.sizes['2xl'],
          fontWeight: theme.fonts.weights.bold,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm
        }}>
          Configure Integration
        </h1>
        <p style={{
          fontSize: theme.fonts.sizes.base,
          color: theme.colors.textSecondary
        }}>
          Configure your integration settings including authentication and permissions.
        </p>
      </header>

      {error && (
        <div 
          role="alert"
          style={{
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
            backgroundColor: '#FEE2E2',
            color: theme.colors.error,
            borderRadius: theme.borderRadius.base
          }}
        >
          {error.message}
        </div>
      )}

      {saveError && (
        <div 
          role="alert"
          style={{
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
            backgroundColor: '#FEE2E2',
            color: theme.colors.error,
            borderRadius: theme.borderRadius.base
          }}
        >
          {saveError}
        </div>
      )}

      <div style={{
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.base
      }}>
        <ConfigPanel
          integrationData={currentIntegration || undefined}
          onSave={handleSave}
        />
      </div>

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: theme.spacing.xl
        }}>
          <Button
            variant="secondary"
            isLoading={true}
            disabled={true}
          >
            Loading...
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConfigurePage;