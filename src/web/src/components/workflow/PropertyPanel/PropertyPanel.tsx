/**
 * Human Tasks:
 * 1. Review validation rules for workflow step properties with business stakeholders
 * 2. Confirm accessibility requirements for form inputs
 * 3. Verify error message content with UX team
 * 4. Test with different step types to ensure all property configurations are supported
 */

// React v18.2.0
import React, { useState, useCallback, useEffect } from 'react';

// Internal imports with relative paths
import { Canvas } from '../Canvas/Canvas';
import useWorkflow from '../../hooks/useWorkflow';
import { validateWorkflowData } from '../../utils/validation.util';
import { WORKFLOW_STATUS_MAPPING } from '../../constants/workflow.constants';

/**
 * Interface for PropertyPanel component props
 */
interface PropertyPanelProps {
  /**
   * ID of the selected workflow step
   */
  selectedStepId?: string;

  /**
   * Callback when properties are updated
   */
  onPropertiesUpdate?: (stepId: string, properties: any) => void;

  /**
   * Flag to disable editing
   */
  isReadOnly?: boolean;
}

/**
 * PropertyPanel component for configuring workflow step properties
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a panel for configuring properties of workflow steps, ensuring flexibility
 *   and customization in workflow creation.
 */
const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedStepId,
  onPropertiesUpdate,
  isReadOnly = false
}) => {
  // Get workflow management functions from custom hook
  const {
    workflows,
    loading,
    error,
    updateWorkflow,
    resetError
  } = useWorkflow();

  // State for step properties
  const [properties, setProperties] = useState<{
    name: string;
    type: string;
    configuration: Record<string, any>;
    status: string;
  }>({
    name: '',
    type: '',
    configuration: {},
    status: WORKFLOW_STATUS_MAPPING.Draft
  });

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Load step properties when selected step changes
   */
  useEffect(() => {
    if (selectedStepId && workflows.length > 0) {
      const workflow = workflows.find(w => 
        w.workflowId === selectedStepId || 
        w.name === selectedStepId
      );

      if (workflow) {
        setProperties({
          name: workflow.name,
          type: workflow.status,
          configuration: workflow.workflowId ? { id: workflow.workflowId } : {},
          status: workflow.status
        });
      }
    }
  }, [selectedStepId, workflows]);

  /**
   * Handle property changes
   */
  const handlePropertyChange = useCallback((
    propertyName: string,
    value: any
  ) => {
    if (isReadOnly) return;

    setProperties(prev => ({
      ...prev,
      [propertyName]: value
    }));

    // Clear validation error when field is updated
    if (validationErrors[propertyName]) {
      setValidationErrors(prev => ({
        ...prev,
        [propertyName]: ''
      }));
    }
  }, [isReadOnly, validationErrors]);

  /**
   * Validate step properties
   */
  const validateProperties = useCallback(() => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!properties.name.trim()) {
      errors.name = 'Name is required';
    }

    // Validate type
    if (!properties.type) {
      errors.type = 'Type is required';
    }

    // Validate configuration based on type
    if (properties.type === 'integration' && !properties.configuration.connector) {
      errors.configuration = 'Connector is required for integration steps';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [properties]);

  /**
   * Handle save action
   */
  const handleSave = useCallback(async () => {
    if (isReadOnly) return;

    // Validate properties
    if (!validateProperties()) {
      return;
    }

    // Create workflow data object
    const workflowData = {
      workflowId: selectedStepId,
      name: properties.name,
      status: properties.status,
      // Add other required workflow properties
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate workflow data
    if (!validateWorkflowData(workflowData)) {
      setValidationErrors(prev => ({
        ...prev,
        general: 'Invalid workflow configuration'
      }));
      return;
    }

    try {
      // Update workflow
      await updateWorkflow(workflowData);

      // Notify parent component
      if (onPropertiesUpdate) {
        onPropertiesUpdate(selectedStepId!, properties);
      }
    } catch (err) {
      setValidationErrors(prev => ({
        ...prev,
        general: 'Failed to save properties'
      }));
    }
  }, [
    isReadOnly,
    selectedStepId,
    properties,
    validateProperties,
    updateWorkflow,
    onPropertiesUpdate
  ]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    // Reset properties to last saved state
    if (selectedStepId && workflows.length > 0) {
      const workflow = workflows.find(w => w.workflowId === selectedStepId);
      if (workflow) {
        setProperties({
          name: workflow.name,
          type: workflow.status,
          configuration: workflow.workflowId ? { id: workflow.workflowId } : {},
          status: workflow.status
        });
      }
    }

    // Clear validation errors
    setValidationErrors({});
    resetError();
  }, [selectedStepId, workflows, resetError]);

  // Render loading state
  if (loading) {
    return (
      <div className="property-panel property-panel--loading">
        <div className="property-panel__loading-indicator">
          Loading properties...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="property-panel property-panel--error">
        <div className="property-panel__error-message">
          {error}
        </div>
        <button 
          className="property-panel__retry-button"
          onClick={resetError}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="property-panel">
      <div className="property-panel__header">
        <h2 className="property-panel__title">
          {selectedStepId ? 'Edit Step Properties' : 'Select a Step'}
        </h2>
      </div>

      {selectedStepId && (
        <div className="property-panel__content">
          {/* Name input */}
          <div className="property-panel__field">
            <label htmlFor="step-name" className="property-panel__label">
              Name
            </label>
            <input
              id="step-name"
              type="text"
              className="property-panel__input"
              value={properties.name}
              onChange={e => handlePropertyChange('name', e.target.value)}
              disabled={isReadOnly}
            />
            {validationErrors.name && (
              <span className="property-panel__error">
                {validationErrors.name}
              </span>
            )}
          </div>

          {/* Type selection */}
          <div className="property-panel__field">
            <label htmlFor="step-type" className="property-panel__label">
              Type
            </label>
            <select
              id="step-type"
              className="property-panel__select"
              value={properties.type}
              onChange={e => handlePropertyChange('type', e.target.value)}
              disabled={isReadOnly}
            >
              <option value="">Select Type</option>
              <option value="integration">Integration</option>
              <option value="condition">Condition</option>
              <option value="transformation">Transformation</option>
            </select>
            {validationErrors.type && (
              <span className="property-panel__error">
                {validationErrors.type}
              </span>
            )}
          </div>

          {/* Configuration section */}
          <div className="property-panel__field">
            <label className="property-panel__label">
              Configuration
            </label>
            <div className="property-panel__configuration">
              {properties.type === 'integration' && (
                <select
                  className="property-panel__select"
                  value={properties.configuration.connector || ''}
                  onChange={e => handlePropertyChange('configuration', {
                    ...properties.configuration,
                    connector: e.target.value
                  })}
                  disabled={isReadOnly}
                >
                  <option value="">Select Connector</option>
                  <option value="rest">REST API</option>
                  <option value="graphql">GraphQL</option>
                  <option value="soap">SOAP</option>
                </select>
              )}
              {validationErrors.configuration && (
                <span className="property-panel__error">
                  {validationErrors.configuration}
                </span>
              )}
            </div>
          </div>

          {/* Status display */}
          <div className="property-panel__field">
            <label className="property-panel__label">
              Status
            </label>
            <div className={`property-panel__status property-panel__status--${properties.status.toLowerCase()}`}>
              {properties.status}
            </div>
          </div>

          {/* Action buttons */}
          <div className="property-panel__actions">
            <button
              className="property-panel__button property-panel__button--secondary"
              onClick={handleCancel}
              disabled={isReadOnly}
            >
              Cancel
            </button>
            <button
              className="property-panel__button property-panel__button--primary"
              onClick={handleSave}
              disabled={isReadOnly}
            >
              Save
            </button>
          </div>

          {/* General error message */}
          {validationErrors.general && (
            <div className="property-panel__error property-panel__error--general">
              {validationErrors.general}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;