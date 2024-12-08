/**
 * ConfigPanel Component
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a user interface for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Adheres to the design system specifications for consistent UI and UX.
 * 
 * Human Tasks:
 * 1. Verify authentication field validation rules with security team
 * 2. Review integration configuration fields with product team
 * 3. Test form submission error handling scenarios
 * 4. Validate accessibility of form fields with screen readers
 */

// react v18.2.0
import React, { useState, useCallback } from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

// Internal imports
import { Integration } from '../../types/integration.types';
import { createIntegration, updateIntegration } from '../../services/integration.service';
import { validateIntegrationData } from '../../utils/validation.util';
import Input from '../common/Input/Input';
import { Button } from '../common/Button/Button';

interface ConfigPanelProps {
  /**
   * Initial integration data for editing existing integrations
   */
  integrationData?: Integration;
  
  /**
   * Callback function called after successful save
   */
  onSave: (integration: Integration) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ integrationData, onSave }) => {
  // State for form fields
  const [formData, setFormData] = useState<Partial<Integration>>({
    integrationId: integrationData?.integrationId || '',
    name: integrationData?.name || '',
    description: integrationData?.description || '',
    auth: integrationData?.auth || {
      username: '',
      password: '',
      token: ''
    },
    status: integrationData?.status || 'configuring'
  });

  // State for form validation and submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handles input field changes
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  /**
   * Handles authentication field changes
   */
  const handleAuthChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        [name]: value
      }
    }));
    
    // Clear error when auth field is modified
    if (errors[`auth.${name}`]) {
      setErrors(prev => ({
        ...prev,
        [`auth.${name}`]: ''
      }));
    }
  }, [errors]);

  /**
   * Validates form data before submission
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name?.trim()) {
      newErrors.name = 'Integration name is required';
    }

    // Validate auth fields
    if (!formData.auth?.username?.trim()) {
      newErrors['auth.username'] = 'Username is required';
    }
    if (!formData.auth?.password?.trim()) {
      newErrors['auth.password'] = 'Password is required';
    }

    // Validate using utility function
    if (!validateIntegrationData(formData)) {
      newErrors.general = 'Invalid integration configuration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handles form submission
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let savedIntegration;
      
      if (integrationData?.integrationId) {
        // Update existing integration
        savedIntegration = await updateIntegration(formData as Integration);
      } else {
        // Create new integration
        savedIntegration = await createIntegration(formData as Integration);
      }

      onSave(savedIntegration as Integration);
    } catch (error) {
      setErrors({
        general: 'Failed to save integration. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.general && (
        <div role="alert" style={{ color: 'red', marginBottom: '1rem' }}>
          {errors.general}
        </div>
      )}

      <div>
        <Input
          type="text"
          name="name"
          placeholder="Integration Name"
          value={formData.name || ''}
          onChange={handleInputChange}
          isValid={!errors.name}
          required
        />
        {errors.name && (
          <div style={{ color: 'red', fontSize: '0.875rem' }}>{errors.name}</div>
        )}
      </div>

      <div>
        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description || ''}
          onChange={handleInputChange}
          isValid={!errors.description}
        />
      </div>

      <div>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.auth?.username || ''}
          onChange={handleAuthChange}
          isValid={!errors['auth.username']}
          required
        />
        {errors['auth.username'] && (
          <div style={{ color: 'red', fontSize: '0.875rem' }}>
            {errors['auth.username']}
          </div>
        )}
      </div>

      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.auth?.password || ''}
          onChange={handleAuthChange}
          isValid={!errors['auth.password']}
          required
        />
        {errors['auth.password'] && (
          <div style={{ color: 'red', fontSize: '0.875rem' }}>
            {errors['auth.password']}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          isFullWidth
        >
          {integrationData?.integrationId ? 'Update Integration' : 'Create Integration'}
        </Button>
      </div>
    </form>
  );
};

ConfigPanel.propTypes = {
  integrationData: PropTypes.shape({
    integrationId: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    auth: PropTypes.shape({
      username: PropTypes.string,
      password: PropTypes.string,
      token: PropTypes.string
    }),
    status: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired
};

export default ConfigPanel;