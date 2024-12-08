/**
 * Workflow List page component that displays workflows in a tabular format
 * 
 * Requirements addressed:
 * - Workflow Management (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a user interface for managing workflows, including viewing and filtering workflows.
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Ensures consistent styling and adherence to the design system for typography, color palette, and spacing.
 * 
 * Human Tasks:
 * 1. Verify table pagination settings meet performance requirements with large datasets
 * 2. Review workflow filtering options with product team
 * 3. Test table responsiveness across different viewport sizes
 * 4. Validate accessibility features with screen readers
 */

// react v18.2.0
import React, { useMemo } from 'react';

// Internal imports
import { Workflow } from '../../types/workflow.types';
import { getWorkflows } from '../../services/workflow.service';
import Table from '../../components/common/Table/Table';
import { Button } from '../../components/common/Button/Button';
import useWorkflow from '../../hooks/useWorkflow';
import { formatWorkflowStatus } from '../../utils/format.util';
import { useTheme } from '../../hooks/useTheme';

/**
 * WorkflowListPage component that renders the workflow management interface
 * @returns JSX.Element
 */
const WorkflowListPage: React.FC = () => {
  // Access theme configuration for consistent styling
  const theme = useTheme();

  // Initialize workflow management hook
  const {
    workflows,
    loading,
    error,
    getWorkflows,
    deleteWorkflow
  } = useWorkflow();

  // Define table columns with appropriate formatting
  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Workflow Name',
      formatter: (value: string) => (
        <span style={{ 
          fontWeight: theme.fonts.weights.medium,
          color: theme.colors.textPrimary 
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      formatter: (value: string) => (
        <span style={{
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          backgroundColor: value === 'Active' ? theme.colors.success : theme.colors.surface,
          borderRadius: theme.borderRadius.base,
          color: value === 'Active' ? theme.colors.background : theme.colors.textSecondary
        }}>
          {formatWorkflowStatus(value)}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      formatter: (value: Date) => new Date(value).toLocaleDateString()
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      formatter: (value: Date) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      formatter: (_, workflow: Workflow) => (
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleEditWorkflow(workflow)}
          >
            Edit
          </Button>
          <Button
            variant="accent"
            size="small"
            onClick={() => handleDeleteWorkflow(workflow.workflowId)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ], [theme]);

  // Handle workflow actions
  const handleCreateWorkflow = () => {
    // Navigation to workflow creation page will be handled by routing
    console.log('Navigate to workflow creation page');
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    // Navigation to workflow edit page will be handled by routing
    console.log('Navigate to workflow edit page', workflow.workflowId);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(workflowId);
    }
  };

  return (
    <div style={{
      padding: theme.spacing.lg,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg
      }}>
        <h1 style={{
          fontSize: theme.fonts.sizes['2xl'],
          fontWeight: theme.fonts.weights.bold,
          color: theme.colors.textPrimary,
          margin: 0
        }}>
          Workflows
        </h1>
        <Button
          variant="primary"
          onClick={handleCreateWorkflow}
          leftIcon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
        >
          Create Workflow
        </Button>
      </div>

      {/* Error message display */}
      {error && (
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.error,
          color: theme.colors.background,
          borderRadius: theme.borderRadius.base,
          marginBottom: theme.spacing.md
        }}>
          {error}
        </div>
      )}

      {/* Workflow table */}
      <Table
        data={workflows}
        columns={columns}
        className={loading ? 'loading' : ''}
      />

      {/* Empty state */}
      {!loading && workflows.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: theme.spacing.xl,
          color: theme.colors.textSecondary
        }}>
          No workflows found. Create your first workflow to get started.
        </div>
      )}
    </div>
  );
};

export default WorkflowListPage;