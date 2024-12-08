// react v18.2.0
import React from 'react';
// @testing-library/react v13.4.0
import { render, screen } from '@testing-library/react';
// jest v29.0.0
import { expect, describe, it, beforeEach } from '@jest/globals';
// redux mock store
import { Provider } from 'react-redux';
import { store } from '../../store/index';

// Internal imports
import AppShell from './AppShell';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { validateWorkflowData } from '../../utils/validation.util';

/**
 * Unit tests for the AppShell component
 * Requirement: Testing and Validation - Ensures the AppShell component functions correctly
 * and integrates with its dependencies like Header and Sidebar.
 */
describe('AppShell Component', () => {
  // Mock child content
  const mockChildContent = <div data-testid="mock-child">Test Content</div>;

  beforeEach(() => {
    // Reset any mocks and render the component before each test
    jest.clearAllMocks();
  });

  /**
   * Test: Renders AppShell correctly
   * Verifies that the AppShell component renders without crashing and includes all required components
   */
  it('renders AppShell with all required components', () => {
    render(
      <Provider store={store}>
        <AppShell>
          {mockChildContent}
        </AppShell>
      </Provider>
    );

    // Verify Header component is rendered
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Verify Sidebar component is rendered
    expect(screen.getByRole('complementary')).toBeInTheDocument();

    // Verify main content area is rendered
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Verify child content is rendered
    expect(screen.getByTestId('mock-child')).toBeInTheDocument();
  });

  /**
   * Test: Integrates with Redux store
   * Verifies that the AppShell component correctly integrates with the Redux store
   */
  it('integrates correctly with Redux store', () => {
    render(
      <Provider store={store}>
        <AppShell>
          {mockChildContent}
        </AppShell>
      </Provider>
    );

    // Verify initial state
    const state = store.getState();
    expect(state).toBeDefined();
    expect(state.ui).toBeDefined();
  });

  /**
   * Test: Validates workflow data
   * Verifies that workflow data validation works correctly within the AppShell context
   */
  it('validates workflow data correctly', () => {
    // Mock valid workflow data
    const validWorkflowData = {
      workflowId: 'test-workflow',
      name: 'Test Workflow',
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock invalid workflow data
    const invalidWorkflowData = {
      workflowId: '', // Invalid empty ID
      name: 'Test Workflow',
      status: 'Invalid' // Invalid status
    };

    // Test validation with valid data
    expect(validateWorkflowData(validWorkflowData)).toBe(true);

    // Test validation with invalid data
    expect(validateWorkflowData(invalidWorkflowData)).toBe(false);
  });

  /**
   * Test: Applies correct styling
   * Verifies that the AppShell component applies the correct styling to its elements
   */
  it('applies correct styling to layout elements', () => {
    render(
      <Provider store={store}>
        <AppShell>
          {mockChildContent}
        </AppShell>
      </Provider>
    );

    // Verify main content area styling
    const mainContent = screen.getByRole('main');
    const mainStyles = window.getComputedStyle(mainContent);
    
    expect(mainStyles.display).toBe('flex');
    expect(mainStyles.flex).toBe('1');
    expect(mainStyles.marginLeft).toBe('280px'); // Sidebar width
    expect(mainStyles.marginTop).toBe('64px'); // Header height

    // Verify content wrapper styling
    const contentWrapper = mainContent.firstChild;
    const wrapperStyles = window.getComputedStyle(contentWrapper as Element);
    
    expect(wrapperStyles.width).toBe('100%');
    expect(wrapperStyles.margin).toBe('0 auto');
  });

  /**
   * Test: Handles responsive layout
   * Verifies that the AppShell component handles responsive layout changes correctly
   */
  it('handles responsive layout changes', () => {
    // Mock window resize
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 600; // Mobile breakpoint
    window.dispatchEvent(new Event('resize'));

    render(
      <Provider store={store}>
        <AppShell>
          {mockChildContent}
        </AppShell>
      </Provider>
    );

    const mainContent = screen.getByRole('main');
    const mainStyles = window.getComputedStyle(mainContent);
    
    // Verify responsive styling
    expect(mainStyles.marginLeft).toBe('0');
    expect(mainStyles.padding).toBe('16px'); // md spacing

    // Cleanup
    window.innerWidth = originalInnerWidth;
    window.dispatchEvent(new Event('resize'));
  });
});