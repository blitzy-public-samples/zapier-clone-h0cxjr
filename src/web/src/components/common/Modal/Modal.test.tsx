// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';

import { Modal } from './Modal';
import { ModalContainer } from './Modal.styles';
import { validateWorkflowData } from '../../utils/validation.util';

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateWorkflowData: jest.fn()
}));

// Mock the useTheme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    zIndex: {
      modal: 1040
    }
  })
}));

describe('Modal Component', () => {
  // Common props for testing
  const defaultProps = {
    title: 'Test Modal',
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Modal renders correctly with provided props
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('renders modal correctly with all props', () => {
    const footerActions = [
      { label: 'Cancel', onClick: jest.fn() },
      { label: 'Submit', onClick: jest.fn(), variant: 'primary' as const }
    ];

    render(
      <Modal
        {...defaultProps}
        footerActions={footerActions}
        className="custom-modal"
      />
    );

    // Verify modal container is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');

    // Verify title is rendered
    expect(screen.getByText('Test Modal')).toBeInTheDocument();

    // Verify content is rendered
    expect(screen.getByText('Modal Content')).toBeInTheDocument();

    // Verify footer actions are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  /**
   * Test: Modal handles close events correctly
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('handles close events correctly', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    // Test close button click
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Test overlay click
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  /**
   * Test: Modal respects disableOverlayClick prop
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('respects disableOverlayClick prop', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} disableOverlayClick />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * Test: Modal handles escape key press correctly
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('handles escape key press correctly', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Modal respects disableEscapeKey prop
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('respects disableEscapeKey prop', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} disableEscapeKey />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * Test: Modal validates workflow data correctly
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('validates workflow data when provided', async () => {
    const mockWorkflowData = {
      workflowId: 'test-workflow',
      status: 'Active'
    };

    (validateWorkflowData as jest.Mock).mockReturnValue(true);

    render(
      <Modal {...defaultProps} workflowData={mockWorkflowData} />
    );

    await waitFor(() => {
      expect(validateWorkflowData).toHaveBeenCalledWith(mockWorkflowData);
    });
  });

  /**
   * Test: Modal handles invalid workflow data correctly
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('handles invalid workflow data correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockWorkflowData = {
      workflowId: 'invalid-workflow'
    };

    (validateWorkflowData as jest.Mock).mockReturnValue(false);

    render(
      <Modal {...defaultProps} workflowData={mockWorkflowData} />
    );

    await waitFor(() => {
      expect(validateWorkflowData).toHaveBeenCalledWith(mockWorkflowData);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid workflow data provided to modal');
    });

    consoleSpy.mockRestore();
  });

  /**
   * Test: Modal is not rendered when isOpen is false
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /**
   * Test: Modal handles footer actions correctly
   * Requirement: Component Testing - Ensures that all UI components function as expected
   */
  it('handles footer actions correctly', () => {
    const primaryAction = jest.fn();
    const secondaryAction = jest.fn();
    const footerActions = [
      { label: 'Cancel', onClick: secondaryAction },
      { label: 'Submit', onClick: primaryAction, variant: 'primary' as const }
    ];

    render(<Modal {...defaultProps} footerActions={footerActions} />);

    const submitButton = screen.getByText('Submit');
    const cancelButton = screen.getByText('Cancel');

    fireEvent.click(submitButton);
    expect(primaryAction).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelButton);
    expect(secondaryAction).toHaveBeenCalledTimes(1);
  });
});