/**
 * Table component for displaying tabular data with styling, validation, and formatting
 * 
 * Human Tasks:
 * 1. Verify accessibility requirements for data tables (ARIA labels, roles)
 * 2. Test table component with large datasets for performance
 * 3. Review table styling with design team for consistency
 * 4. Validate table behavior across different viewport sizes
 */

import React from 'react';
import { 
  TableStyles,
  tableContainer as TableContainer,
  tableHeader as TableHeader,
  tableRow as TableRow,
  tableCell as TableCell
} from './Table.styles';
import { validateWorkflowData } from '../../utils/validation.util';
import { formatWorkflowStatus } from '../../utils/format.util';
import { useTheme } from '../../hooks/useTheme';
import { Workflow } from '../../types/workflow.types';

interface Column {
  key: string;
  header: string;
  formatter?: (value: any) => string | React.ReactNode;
}

interface TableProps {
  data: Array<any>;
  columns: Array<Column>;
  className?: string;
}

/**
 * Table component that renders tabular data with consistent styling and formatting
 * 
 * @param props - Component props containing data and column definitions
 * @returns JSX.Element - Styled table component
 */
const Table: React.FC<TableProps> = ({ data, columns, className }) => {
  // Requirement: Design System Specifications - Access theme configuration
  const theme = useTheme();

  // Requirement: Data Validation - Validate workflow data structure
  React.useEffect(() => {
    if (data.length > 0 && 'workflowId' in data[0]) {
      const isValid = data.every(item => validateWorkflowData(item));
      if (!isValid) {
        console.error('Invalid workflow data structure detected in Table component');
      }
    }
  }, [data]);

  // Requirement: Design System Specifications - Render table with consistent styling
  return (
    <TableContainer className={className}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <TableHeader>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </TableHeader>
        <tbody>
          {data.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.key}`}>
                  {/* Requirement: Data Formatting - Format cell content based on column type */}
                  {column.formatter 
                    ? column.formatter(row[column.key])
                    : column.key === 'status' 
                      ? formatWorkflowStatus(row[column.key])
                      : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
};

// Requirement: Design System Specifications - Default styling for empty state
Table.defaultProps = {
  data: [],
  columns: [],
};

export default Table;