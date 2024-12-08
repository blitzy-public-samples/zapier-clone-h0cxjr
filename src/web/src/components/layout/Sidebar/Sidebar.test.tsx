// @testing-library/react version: 14.0.0
// jest version: 29.0.0
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from './Sidebar';
import { SidebarStyles } from './Sidebar.styles';
import { validateWorkflowData } from '../../utils/validation.util';
import { useTheme } from '../../hooks/useTheme';
import { uiReducer } from '../../store/slices/uiSlice';

/**
 * Human Tasks:
 * 1. Verify test coverage meets minimum threshold requirements
 * 2. Ensure all interactive elements have accessibility tests
 * 3. Add additional test cases for responsive behavior
 * 4. Review test performance and optimize if needed
 */

// Mock the useTheme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      surface: '#F9FAFB',
      border: '#E5E7EB',
      primary: '#2563EB',
      background: '#FFFFFF',
      textPrimary: '#111827',
      textSecondary: '#4B5563'
    },
    spacing: {
      md: '16px',
      xl: '32px'
    },
    fonts: {
      primary: "'Inter', sans-serif",
      sizes: {
        xl: '1.25rem',
        base: '1rem'
      },
      weights: {
        bold: 700,
        medium: 500
      }
    },
    zIndex: {
      sidebar: 1020
    },
    breakpoints: {
      md: '768px'
    }
  }))
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiReducer
    },
    preloadedState: {
      ui: {
        modals: {},
        theme: 'light',
        loading: false,
        ...initialState
      }
    }
  });
};

// Test wrapper component with required providers
const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Sidebar Component', () => {
  // Requirement: Design System Specifications - Ensures the Sidebar component renders correctly
  test('renders correctly with all navigation items', () => {
    renderWithProviders(<Sidebar />);

    // Verify logo is present
    expect(screen.getByText('Workflow Platform')).toBeInTheDocument();

    // Verify all navigation items are present
    const navItems = ['Dashboard', 'Workflows', 'Integrations', 'Analytics', 'Settings'];
    navItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });

    // Verify footer is present
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
  });

  // Requirement: Design System Specifications - Ensures theme styles are properly applied
  test('applies theme styles correctly', () => {
    renderWithProviders(<Sidebar />);
    const sidebar = screen.getByRole('complementary');

    // Verify theme styles are applied
    expect(sidebar).toHaveStyle({
      backgroundColor: '#F9FAFB',
      borderRight: '1px solid #E5E7EB'
    });

    // Verify navigation items have correct styling
    const navItem = screen.getByText('Dashboard').closest('a');
    expect(navItem).toHaveStyle({
      color: '#111827',
      fontFamily: "'Inter', sans-serif"
    });
  });

  // Requirement: Design System Specifications - Tests responsive behavior
  test('handles responsive behavior correctly', () => {
    renderWithProviders(<Sidebar />);
    const sidebar = screen.getByRole('complementary');

    // Verify sidebar has correct width
    expect(sidebar).toHaveStyle({
      width: '280px'
    });

    // Simulate mobile viewport
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn()
    }));

    // Re-render for mobile view
    renderWithProviders(<Sidebar />);
    expect(sidebar).toHaveStyle({
      position: 'fixed',
      left: '0',
      top: '0'
    });
  });

  // Test navigation item interaction
  test('handles navigation item clicks correctly', () => {
    renderWithProviders(<Sidebar />);
    
    const workflowsLink = screen.getByText('Workflows');
    fireEvent.click(workflowsLink);

    // Verify the link behavior
    expect(workflowsLink).toHaveAttribute('href', '/workflows');
  });

  // Test sidebar toggle functionality
  test('toggles sidebar visibility correctly', () => {
    renderWithProviders(<Sidebar />, {
      sidebar: {
        isOpen: false
      }
    });

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveStyle({
      transform: 'translateX(-100%)'
    });
  });

  // Test workflow data validation
  test('validates workflow data correctly', () => {
    const mockWorkflowData = {
      workflowId: 'test-workflow',
      status: 'Active'
    };

    expect(validateWorkflowData(mockWorkflowData)).toBe(true);
  });

  // Test accessibility requirements
  test('meets accessibility requirements', () => {
    renderWithProviders(<Sidebar />);
    
    // Verify navigation role
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Verify links are keyboard accessible
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });
});