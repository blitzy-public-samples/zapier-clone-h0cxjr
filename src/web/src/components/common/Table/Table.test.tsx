/**
 * Unit tests for the Table component
 * Requirements addressed:
 * - Component Testing (Technical Specification/System Design/Testing)
 *   Ensures the Table component behaves as expected under various scenarios
 * 
 * Human Tasks:
 * 1. Verify test coverage meets team standards
 * 2. Review test cases with UX team for accessibility requirements
 * 3. Add performance testing scenarios for large datasets
 */

// @testing-library/react@14.0.0
import { render, screen } from '@testing-library/react';
// jest@29.0.0
import { jest } from '@jest/globals';

// Internal imports
import Table from './Table';
import { TableStyles } from './Table.styles';
import { validateWorkflowData } from '../../utils/validation.util';
import useAnalytics from '../../hooks/useAnalytics';

// Mock the validation utility
jest.mock('../../utils/validation.util', () => ({
  validateWorkflowData: jest.fn()
}));

// Mock the analytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Table Component', () => {
  // Test data
  const mockColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' }
  ];

  const mockData = [
    { id: '1', name: 'Workflow 1', status: 'Active', workflowId: 'wf1' },
    { id: '2', name: 'Workflow 2', status: 'Completed', workflowId: 'wf2' }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useAnalytics implementation
    (useAnalytics as jest.Mock).mockImplementation(() => ({
      data: null,
      loading: false,
      error: null,
      fetchAnalytics: jest.fn(),
      validateAnalytics: jest.fn(),
      refreshAnalytics: jest.fn(),
      clearAnalytics: jest.fn()
    }));
  });

  it('renders correctly with valid props', () => {
    render(<Table data={mockData} columns={mockColumns} />);

    // Verify column headers are rendered
    mockColumns.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });

    // Verify data rows are rendered
    mockData.forEach(row => {
      expect(screen.getByText(row.name)).toBeInTheDocument();
      expect(screen.getByText(row.status)).toBeInTheDocument();
    });
  });

  it('applies correct styles from TableStyles', () => {
    const { container } = render(<Table data={mockData} columns={mockColumns} />);

    // Verify table container styles
    const tableContainer = container.firstChild;
    expect(tableContainer).toHaveStyle(TableStyles.tableContainer);

    // Verify header styles
    const headerCells = screen.getAllByRole('columnheader');
    headerCells.forEach(cell => {
      expect(cell.parentElement).toHaveStyle(TableStyles.tableHeader);
    });

    // Verify row styles
    const rows = screen.getAllByRole('row');
    rows.slice(1).forEach(row => { // Skip header row
      expect(row).toHaveStyle(TableStyles.tableRow);
    });

    // Verify cell styles
    const cells = screen.getAllByRole('cell');
    cells.forEach(cell => {
      expect(cell).toHaveStyle(TableStyles.tableCell);
    });
  });

  it('calls validateWorkflowData with correct arguments', () => {
    render(<Table data={mockData} columns={mockColumns} />);

    // Verify validation is called for each workflow data item
    expect(validateWorkflowData).toHaveBeenCalledTimes(mockData.length);
    mockData.forEach(item => {
      expect(validateWorkflowData).toHaveBeenCalledWith(item);
    });
  });

  it('integrates with useAnalytics hook correctly', () => {
    const mockAnalytics = {
      data: null,
      loading: false,
      error: null,
      fetchAnalytics: jest.fn(),
      validateAnalytics: jest.fn(),
      refreshAnalytics: jest.fn(),
      clearAnalytics: jest.fn()
    };
    (useAnalytics as jest.Mock).mockReturnValue(mockAnalytics);

    render(<Table data={mockData} columns={mockColumns} />);

    // Verify analytics hook is called
    expect(useAnalytics).toHaveBeenCalled();
  });

  it('handles empty data gracefully', () => {
    render(<Table data={[]} columns={mockColumns} />);

    // Verify column headers are still rendered
    mockColumns.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });

    // Verify no data rows are rendered
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1); // Only header row
  });

  it('handles invalid data gracefully', () => {
    // Mock console.error to prevent test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock validation to fail
    (validateWorkflowData as jest.Mock).mockReturnValue(false);

    render(<Table data={mockData} columns={mockColumns} />);

    // Verify error is logged
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid workflow data structure detected in Table component'
    );

    // Verify table still renders
    mockColumns.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-table';
    const { container } = render(
      <Table data={mockData} columns={mockColumns} className={customClass} />
    );

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('formats cell content using formatter function when provided', () => {
    const mockFormatter = jest.fn(value => `Formatted: ${value}`);
    const columnsWithFormatter = [
      ...mockColumns,
      { key: 'formatted', header: 'Formatted', formatter: mockFormatter }
    ];
    const dataWithFormattedField = mockData.map(item => ({
      ...item,
      formatted: 'test'
    }));

    render(<Table data={dataWithFormattedField} columns={columnsWithFormatter} />);

    // Verify formatter is called and content is rendered
    expect(mockFormatter).toHaveBeenCalledWith('test');
    expect(screen.getAllByText(/^Formatted: test$/)).toHaveLength(dataWithFormattedField.length);
  });
});