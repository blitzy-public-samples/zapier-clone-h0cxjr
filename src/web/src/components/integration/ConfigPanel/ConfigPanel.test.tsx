/**
 * Unit tests for the ConfigPanel component
 * Requirements addressed:
 * - Integration Capabilities (Technical Specification/Scope/Core Features and Functionalities)
 *   Ensures the ConfigPanel component correctly manages integration settings and authentication.
 * - Data Validation (Technical Specification/System Design/API Design)
 *   Validates that the ConfigPanel component enforces proper data validation.
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v13.4.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// jest v29.0.0
import { jest } from '@jest/globals';

// Internal imports
import ConfigPanel from './ConfigPanel';
import useIntegration from '../../../hooks/useIntegration';
import { validateIntegrationData } from '../../../utils/validation.util';
import { Integration } from '../../../types/integration.types';

// Mock the useIntegration hook
jest.mock('../../../hooks/useIntegration');

// Mock the validation utility
jest.mock('../../../utils/validation.util');

describe('ConfigPanel Component', () => {
  // Mock data for testing
  const mockIntegrationData: Integration = {
    integrationId: 'test-123',
    name: 'Test Integration',
    description: 'Test Description',
    auth: {
      username: 'testuser',
      password: 'testpass',
      token: 'test-token'
    },
    status: 'configuring'
  } as Integration;

  const mockOnSave = jest.fn();

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (validateIntegrationData as jest.Mock).mockReturnValue(true);
    (useIntegration as jest.Mock).mockReturnValue({
      createNewIntegration: jest.fn().mockResolvedValue({}),
      loading: false,
      error: null
    });
  });

  it('renders ConfigPanel component', () => {
    render(<ConfigPanel onSave={mockOnSave} />);

    // Verify essential form elements are present
    expect(screen.getByPlaceholder('Integration Name')).toBeInTheDocument();
    expect(screen.getByPlaceholder('Description')).toBeInTheDocument();
    expect(screen.getByPlaceholder('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholder('Password')).toBeInTheDocument();
  });

  it('validates user input', async () => {
    render(<ConfigPanel onSave={mockOnSave} />);

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholder('Integration Name'), {
      target: { name: 'name', value: 'Test Integration' }
    });
    fireEvent.change(screen.getByPlaceholder('Username'), {
      target: { name: 'username', value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholder('Password'), {
      target: { name: 'password', value: 'testpass' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Verify validation was called
    await waitFor(() => {
      expect(validateIntegrationData).toHaveBeenCalled();
    });
  });

  it('handles integration creation', async () => {
    const { createNewIntegration } = useIntegration();
    render(<ConfigPanel onSave={mockOnSave} />);

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholder('Integration Name'), {
      target: { name: 'name', value: 'New Integration' }
    });
    fireEvent.change(screen.getByPlaceholder('Username'), {
      target: { name: 'username', value: 'newuser' }
    });
    fireEvent.change(screen.getByPlaceholder('Password'), {
      target: { name: 'password', value: 'newpass' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Verify integration creation
    await waitFor(() => {
      expect(createNewIntegration).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('handles integration update', async () => {
    render(
      <ConfigPanel
        integrationData={mockIntegrationData}
        onSave={mockOnSave}
      />
    );

    // Verify form is pre-filled with existing data
    expect(screen.getByPlaceholder('Integration Name')).toHaveValue('Test Integration');
    expect(screen.getByPlaceholder('Username')).toHaveValue('testuser');
    expect(screen.getByPlaceholder('Password')).toHaveValue('testpass');

    // Update a field
    fireEvent.change(screen.getByPlaceholder('Integration Name'), {
      target: { name: 'name', value: 'Updated Integration' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Verify update was called
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('displays validation errors', async () => {
    (validateIntegrationData as jest.Mock).mockReturnValue(false);
    render(<ConfigPanel onSave={mockOnSave} />);

    // Submit form without required fields
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Verify error messages are displayed
    await waitFor(() => {
      expect(screen.getByText('Integration name is required')).toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('handles loading state during submission', async () => {
    (useIntegration as jest.Mock).mockReturnValue({
      createNewIntegration: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))),
      loading: true,
      error: null
    });

    render(<ConfigPanel onSave={mockOnSave} />);

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholder('Integration Name'), {
      target: { name: 'name', value: 'Test Integration' }
    });
    fireEvent.change(screen.getByPlaceholder('Username'), {
      target: { name: 'username', value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholder('Password'), {
      target: { name: 'password', value: 'testpass' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});