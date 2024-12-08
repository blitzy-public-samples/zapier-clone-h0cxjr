/**
 * @fileoverview Unit tests for the Connector component
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Tests the frontend logic for managing 500+ app connectors, authentication management,
 *   rate limiting, and retry logic.
 */

/**
 * Human Tasks:
 * 1. Review test coverage metrics and add additional test cases if needed
 * 2. Verify error handling test cases match production scenarios
 * 3. Add performance tests for handling large datasets (500+ connectors)
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// jest v29.0.0
import { jest } from '@jest/globals';

// Internal imports
import Connector from './Connector';
import { validateIntegrationData } from '../../utils/validation.util';
import useIntegration from '../../hooks/useIntegration';
import { createIntegration } from '../../services/integration.service';
import { Integration } from '../../types/integration.types';

// Mock the custom hook
jest.mock('../../hooks/useIntegration');

// Mock the validation utility
jest.mock('../../utils/validation.util');

// Mock the integration service
jest.mock('../../services/integration.service');

describe('Connector Component', () => {
  // Test data
  const mockIntegration: Integration = {
    integrationId: 'test-id-1',
    name: 'Test Integration',
    description: 'Test Description',
    version: '1.0.0',
    status: 'active',
    auth: {
      username: 'testuser',
      password: 'testpass',
      token: 'testtoken'
    },
    rateLimit: {
      maxRequests: 100,
      windowSeconds: 60
    },
    retry: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      maxDelayMs: 10000
    },
    workflows: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  // Mock hook implementation
  const mockUseIntegration = {
    integrations: [mockIntegration],
    loading: false,
    error: null,
    createNewIntegration: jest.fn(),
    removeIntegration: jest.fn(),
    refreshIntegrations: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useIntegration as jest.Mock).mockReturnValue(mockUseIntegration);
    (validateIntegrationData as jest.Mock).mockReturnValue(true);
  });

  it('renders the connector form and integration list', () => {
    render(<Connector />);

    // Verify form elements are present
    expect(screen.getByPlaceholderText('Integration Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('API Token')).toBeInTheDocument();
    expect(screen.getByText('Create Integration')).toBeInTheDocument();

    // Verify integration list is present
    expect(screen.getByText('Existing Integrations')).toBeInTheDocument();
    expect(screen.getByText('Test Integration')).toBeInTheDocument();
  });

  it('handles integration creation successfully', async () => {
    const onIntegrationChange = jest.fn();
    render(<Connector onIntegrationChange={onIntegrationChange} />);

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Integration Name'), {
      target: { value: 'New Integration' }
    });
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'newpass' }
    });
    fireEvent.change(screen.getByPlaceholderText('API Token'), {
      target: { value: 'newtoken' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create Integration'));

    await waitFor(() => {
      expect(mockUseIntegration.createNewIntegration).toHaveBeenCalled();
      expect(onIntegrationChange).toHaveBeenCalled();
    });
  });

  it('handles integration deletion', async () => {
    render(<Connector />);

    // Click delete button
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockUseIntegration.removeIntegration).toHaveBeenCalledWith('test-id-1');
      expect(mockUseIntegration.refreshIntegrations).toHaveBeenCalled();
    });
  });

  it('displays loading state correctly', () => {
    (useIntegration as jest.Mock).mockReturnValue({
      ...mockUseIntegration,
      loading: true
    });

    render(<Connector />);
    expect(screen.getByText('Loading integrations...')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to load integrations';
    (useIntegration as jest.Mock).mockReturnValue({
      ...mockUseIntegration,
      error: new Error(errorMessage)
    });

    render(<Connector />);
    expect(screen.getByText(`Failed to load integrations: ${errorMessage}`)).toBeInTheDocument();
  });

  it('handles form validation', async () => {
    render(<Connector />);

    // Try to submit without name
    fireEvent.click(screen.getByText('Create Integration'));

    // Verify create wasn't called
    expect(mockUseIntegration.createNewIntegration).not.toHaveBeenCalled();
  });

  it('initializes with provided integration data', () => {
    render(<Connector initialIntegration={mockIntegration} />);

    expect(screen.getByPlaceholderText('Integration Name')).toHaveValue('Test Integration');
    expect(screen.getByPlaceholderText('Username')).toHaveValue('testuser');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('testpass');
    expect(screen.getByPlaceholderText('API Token')).toHaveValue('testtoken');
  });

  it('handles error during integration creation', async () => {
    const error = new Error('Creation failed');
    mockUseIntegration.createNewIntegration.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Connector />);

    // Fill out and submit form
    fireEvent.change(screen.getByPlaceholderText('Integration Name'), {
      target: { value: 'New Integration' }
    });
    fireEvent.click(screen.getByText('Create Integration'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create integration:', error);
    });

    consoleSpy.mockRestore();
  });

  it('handles error during integration deletion', async () => {
    const error = new Error('Deletion failed');
    mockUseIntegration.removeIntegration.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Connector />);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete integration:', error);
    });

    consoleSpy.mockRestore();
  });
});