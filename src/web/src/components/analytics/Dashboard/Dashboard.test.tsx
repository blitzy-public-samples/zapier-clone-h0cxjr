/**
 * Unit tests for the Analytics Dashboard component
 * Requirements addressed:
 * - Analytics Dashboard Testing (Technical Specification/User Interface Design/Analytics Dashboard)
 *   Ensures the Analytics Dashboard component functions correctly and integrates seamlessly with its child components.
 * 
 * Human Tasks:
 * 1. Verify test coverage meets project requirements
 * 2. Review mocked data structure with backend team
 * 3. Validate error scenarios with product team
 */

// react v18.2.0
import React from 'react';
// @testing-library/react v14.0.0
import { render, screen } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';

// Internal imports
import Dashboard from './Dashboard';
import { LineChart } from '../Charts/LineChart';
import { BarChart } from '../Charts/BarChart';
import { PieChart } from '../Charts/PieChart';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn()
}));

// Mock analytics service
jest.mock('../../../services/analytics.service', () => ({
  fetchAnalyticsData: jest.fn()
}));

// Mock child components
jest.mock('../Charts/LineChart', () => ({
  LineChart: () => <div data-testid="line-chart">Line Chart</div>
}));

jest.mock('../Charts/BarChart', () => ({
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>
}));

jest.mock('../Charts/PieChart', () => ({
  PieChart: () => <div data-testid="pie-chart">Pie Chart</div>
}));

describe('Analytics Dashboard', () => {
  // Mock data for tests
  const mockAnalyticsData = {
    analyticsId: 'test-analytics-123',
    workflow: {
      workflowId: 'wf-123',
      name: 'Test Workflow',
      status: 'Active',
      createdBy: {
        username: 'testuser',
        token: 'test-token',
        password: 'encrypted'
      }
    }
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Dashboard renders correctly with all child components
   * Requirement: Analytics Dashboard Testing - Ensures proper rendering of dashboard components
   */
  it('renders dashboard correctly with all child components', () => {
    // Mock Redux state
    const mockState = {
      analytics: {
        data: mockAnalyticsData,
        loading: false,
        error: null
      }
    };
    
    require('react-redux').useSelector.mockImplementation(callback => callback(mockState));
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    // Render dashboard
    render(<Dashboard />);

    // Verify header content
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();

    // Verify all charts are rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    // Verify workflow table is rendered
    expect(screen.getByText('Recent Workflows')).toBeInTheDocument();
  });

  /**
   * Test: Dashboard fetches and displays analytics data correctly
   * Requirement: Analytics Dashboard Testing - Validates data fetching and display functionality
   */
  it('fetches and displays analytics data correctly', () => {
    // Mock successful data fetch
    const mockFetchAnalytics = jest.fn().mockResolvedValue(mockAnalyticsData);
    require('../../../services/analytics.service').fetchAnalyticsData.mockImplementation(mockFetchAnalytics);

    // Mock Redux state with data
    const mockState = {
      analytics: {
        data: mockAnalyticsData,
        loading: false,
        error: null
      }
    };
    require('react-redux').useSelector.mockImplementation(callback => callback(mockState));
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);

    // Render dashboard
    render(<Dashboard />);

    // Verify data fetch was called
    expect(mockDispatch).toHaveBeenCalled();

    // Verify workflow data is displayed
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  /**
   * Test: Dashboard handles empty state gracefully
   * Requirement: Analytics Dashboard Testing - Ensures proper handling of empty data states
   */
  it('handles empty state gracefully', () => {
    // Mock Redux state with no data
    const mockState = {
      analytics: {
        data: null,
        loading: false,
        error: null
      }
    };
    require('react-redux').useSelector.mockImplementation(callback => callback(mockState));
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    // Render dashboard
    render(<Dashboard />);

    // Verify empty state is handled
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Test Workflow')).not.toBeInTheDocument();
  });

  /**
   * Test: Dashboard displays loading state correctly
   * Requirement: Analytics Dashboard Testing - Validates loading state presentation
   */
  it('displays loading state correctly', () => {
    // Mock Redux state with loading
    const mockState = {
      analytics: {
        data: null,
        loading: true,
        error: null
      }
    };
    require('react-redux').useSelector.mockImplementation(callback => callback(mockState));
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    // Render dashboard
    render(<Dashboard />);

    // Verify loading state is displayed
    expect(screen.getByText('Loading analytics data...')).toBeInTheDocument();
  });

  /**
   * Test: Dashboard handles error state appropriately
   * Requirement: Analytics Dashboard Testing - Ensures proper error state handling
   */
  it('handles error state appropriately', () => {
    // Mock Redux state with error
    const mockState = {
      analytics: {
        data: null,
        loading: false,
        error: 'Failed to fetch analytics data'
      }
    };
    require('react-redux').useSelector.mockImplementation(callback => callback(mockState));
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    // Render dashboard
    render(<Dashboard />);

    // Verify error state is displayed
    expect(screen.getByText('Error loading analytics data. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});