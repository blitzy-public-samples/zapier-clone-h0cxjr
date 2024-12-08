// @testing-library/react version ^13.4.0
import { render, screen, fireEvent } from '@testing-library/react';
// jest version ^29.0.0
import { jest } from '@jest/globals';
// react version 18.2.0
import React from 'react';

// Internal imports
import Canvas from './Canvas';
import { canvasStyles } from './Canvas.styles';
import { validateWorkflowData } from '../../../utils/validation.util';
import useWorkflow from '../../../hooks/useWorkflow';

// Mock the useWorkflow hook
jest.mock('../../../hooks/useWorkflow', () => ({
  __esModule: true,
  default: jest.fn()
}));

/**
 * Human Tasks:
 * 1. Verify that test coverage meets team's requirements (aim for >90%)
 * 2. Review mocked data to ensure it represents real-world scenarios
 * 3. Add additional test cases for edge cases and error conditions
 */

describe('Canvas Component', () => {
  // Mock data for testing
  const mockWorkflow = {
    workflowId: 'test-workflow-1',
    name: 'Test Workflow',
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOnWorkflowUpdate = jest.fn();

  // Mock useWorkflow implementation
  const mockUseWorkflow = {
    workflows: [mockWorkflow],
    loading: false,
    error: null,
    getWorkflows: jest.fn(),
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
    resetError: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useWorkflow as jest.Mock).mockReturnValue(mockUseWorkflow);
  });

  /**
   * Test: Component Rendering
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies that the Canvas component renders correctly with proper styling
   */
  describe('Rendering', () => {
    it('should render the canvas element with correct styles', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveStyle({
        border: '1px solid #E2E8F0',
        borderRadius: '8px'
      });
    });

    it('should render view-only mode when isEditable is false', () => {
      render(
        <Canvas 
          workflow={mockWorkflow} 
          onWorkflowUpdate={mockOnWorkflowUpdate} 
          isEditable={false} 
        />
      );
      
      const viewOnlyMessage = screen.getByText('View Only Mode');
      expect(viewOnlyMessage).toBeInTheDocument();
    });
  });

  /**
   * Test: Workflow Validation
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Ensures workflow data is properly validated before rendering
   */
  describe('Workflow Validation', () => {
    it('should validate workflow data on initialization', () => {
      const validateSpy = jest.spyOn(validateWorkflowData, 'prototype');
      
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      expect(validateSpy).toHaveBeenCalledWith(mockWorkflow);
    });

    it('should not render invalid workflow data', () => {
      const invalidWorkflow = {
        ...mockWorkflow,
        workflowId: '' // Invalid ID
      };
      
      render(<Canvas workflow={invalidWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      const context = canvas.getContext('2d');
      expect(context?.getImageData(0, 0, canvas.width, canvas.height).data)
        .toEqual(new Uint8ClampedArray(canvas.width * canvas.height * 4));
    });
  });

  /**
   * Test: Drag and Drop Interactions
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies drag-and-drop functionality for workflow elements
   */
  describe('Drag and Drop', () => {
    it('should handle mouse down on workflow elements', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      fireEvent.mouseDown(canvas, { clientX: 150, clientY: 140 });
      
      expect(canvas).toHaveStyle({ cursor: 'grab' });
    });

    it('should update element position on mouse move', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      
      // Start drag
      fireEvent.mouseDown(canvas, { clientX: 150, clientY: 140 });
      
      // Move
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 180 });
      
      expect(mockOnWorkflowUpdate).not.toHaveBeenCalled(); // Should only call on mouse up
    });

    it('should trigger workflow update on mouse up', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      
      // Complete drag sequence
      fireEvent.mouseDown(canvas, { clientX: 150, clientY: 140 });
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 180 });
      fireEvent.mouseUp(canvas);
      
      expect(mockOnWorkflowUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: mockWorkflow.workflowId,
          metadata: expect.any(Object)
        })
      );
    });

    it('should cancel drag operation on mouse leave', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      
      // Start drag and leave canvas
      fireEvent.mouseDown(canvas, { clientX: 150, clientY: 140 });
      fireEvent.mouseLeave(canvas);
      
      expect(mockOnWorkflowUpdate).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Style Application
   * Requirements Addressed:
   * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
   *   Verifies that the correct styles are applied from canvasStyles
   */
  describe('Style Application', () => {
    it('should apply container styles correctly', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const container = screen.getByTestId('workflow-canvas-container');
      expect(container).toHaveStyle(canvasStyles.container);
    });

    it('should apply node styles to workflow elements', () => {
      render(<Canvas workflow={mockWorkflow} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      const context = canvas.getContext('2d');
      
      // Verify node styling calls
      expect(context?.fillStyle).toBe(mockWorkflow.status === 'Active' ? '#10B981' : '#64748B');
    });

    it('should apply connection styles to workflow connections', () => {
      const workflowWithConnections = {
        ...mockWorkflow,
        connections: [{ id: 'conn1', source: 'node1', target: 'node2' }]
      };
      
      render(<Canvas workflow={workflowWithConnections} onWorkflowUpdate={mockOnWorkflowUpdate} />);
      
      const canvas = screen.getByRole('presentation');
      const context = canvas.getContext('2d');
      
      // Verify connection styling calls
      expect(context?.strokeStyle).toBe('#94A3B8');
      expect(context?.lineWidth).toBe(2);
    });
  });
});