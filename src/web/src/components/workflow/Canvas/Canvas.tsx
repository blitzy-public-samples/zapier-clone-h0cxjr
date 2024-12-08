/**
 * Human Tasks:
 * 1. Review and adjust drag-and-drop sensitivity settings for optimal user experience
 * 2. Verify browser compatibility for HTML5 Canvas features
 * 3. Test performance with large workflow diagrams (100+ nodes)
 * 4. Configure auto-save intervals based on user activity patterns
 */

// React v18.2.0
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Internal imports with relative paths
import { Workflow } from '../../types/workflow.types';
import { WORKFLOW_STATUS_MAPPING } from '../../constants/workflow.constants';
import { validateWorkflowData } from '../../utils/validation.util';

/**
 * Interface for Canvas component props
 * Defines the expected input properties for the workflow canvas
 */
interface CanvasProps {
  /**
   * Initial workflow data to be displayed
   */
  workflow?: Workflow;
  
  /**
   * Callback function triggered when workflow is updated
   */
  onWorkflowUpdate?: (workflow: Workflow) => void;
  
  /**
   * Flag to enable/disable canvas editing
   */
  isEditable?: boolean;
}

/**
 * Canvas component for workflow visualization and editing
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a visual interface for designing workflows with drag-and-drop functionality
 */
const Canvas: React.FC<CanvasProps> = ({
  workflow,
  onWorkflowUpdate,
  isEditable = true
}) => {
  // Canvas reference for direct DOM manipulation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for tracking workflow elements and their positions
  const [elements, setElements] = useState<Array<{
    id: string;
    type: 'step' | 'connection';
    position: { x: number; y: number };
    data: any;
  }>>([]);
  
  // State for tracking drag operations
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string | null;
    startPos: { x: number; y: number } | null;
  }>({
    isDragging: false,
    elementId: null,
    startPos: null
  });

  /**
   * Initialize canvas with workflow data
   * Sets up the initial canvas state based on provided workflow
   */
  useEffect(() => {
    if (workflow && validateWorkflowData(workflow)) {
      // Initialize canvas elements based on workflow data
      const initialElements = convertWorkflowToElements(workflow);
      setElements(initialElements);
      
      // Set up canvas dimensions and scale
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.canvas.width = window.innerWidth * 0.8;
          context.canvas.height = window.innerHeight * 0.8;
          renderCanvas(context, initialElements);
        }
      }
    }
  }, [workflow]);

  /**
   * Convert workflow data to canvas elements
   * Transforms workflow structure into renderable elements
   */
  const convertWorkflowToElements = useCallback((workflow: Workflow) => {
    const elements = [];
    // Add workflow steps as elements
    if (workflow.workflowId && workflow.name) {
      elements.push({
        id: workflow.workflowId,
        type: 'step',
        position: { x: 100, y: 100 },
        data: {
          name: workflow.name,
          status: workflow.status
        }
      });
    }
    return elements;
  }, []);

  /**
   * Render canvas elements
   * Handles the actual drawing of workflow elements on the canvas
   */
  const renderCanvas = useCallback((
    context: CanvasRenderingContext2D,
    elements: Array<any>
  ) => {
    // Clear canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    
    // Render each element
    elements.forEach(element => {
      if (element.type === 'step') {
        // Draw workflow step
        context.beginPath();
        context.roundRect(
          element.position.x,
          element.position.y,
          150,
          80,
          10
        );
        context.fillStyle = element.data.status === WORKFLOW_STATUS_MAPPING.Active
          ? '#10B981'
          : '#64748B';
        context.fill();
        
        // Draw step text
        context.fillStyle = '#FFFFFF';
        context.font = '14px Inter';
        context.fillText(
          element.data.name,
          element.position.x + 10,
          element.position.y + 30
        );
      } else if (element.type === 'connection') {
        // Draw connections between steps
        context.beginPath();
        context.moveTo(element.position.x, element.position.y);
        context.lineTo(
          element.data.endPos.x,
          element.data.endPos.y
        );
        context.strokeStyle = '#94A3B8';
        context.lineWidth = 2;
        context.stroke();
      }
    });
  }, []);

  /**
   * Handle mouse down events for drag operations
   */
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditable) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if click is on an element
    const clickedElement = elements.find(element =>
      x >= element.position.x &&
      x <= element.position.x + 150 &&
      y >= element.position.y &&
      y <= element.position.y + 80
    );
    
    if (clickedElement) {
      setDragState({
        isDragging: true,
        elementId: clickedElement.id,
        startPos: { x, y }
      });
    }
  }, [elements, isEditable]);

  /**
   * Handle mouse move events during drag operations
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditable || !dragState.isDragging || !dragState.startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Update element position
    const updatedElements = elements.map(element => {
      if (element.id === dragState.elementId) {
        return {
          ...element,
          position: {
            x: element.position.x + (x - dragState.startPos.x),
            y: element.position.y + (y - dragState.startPos.y)
          }
        };
      }
      return element;
    });
    
    setElements(updatedElements);
    setDragState(prev => ({
      ...prev,
      startPos: { x, y }
    }));
    
    // Render updated canvas
    const context = canvas.getContext('2d');
    if (context) {
      renderCanvas(context, updatedElements);
    }
  }, [dragState, elements, isEditable, renderCanvas]);

  /**
   * Handle mouse up events to end drag operations
   */
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && onWorkflowUpdate && workflow) {
      // Update workflow with new element positions
      const updatedWorkflow = {
        ...workflow,
        // Add position data to workflow structure
        metadata: {
          ...workflow,
          elementPositions: elements.reduce((acc, element) => ({
            ...acc,
            [element.id]: element.position
          }), {})
        }
      };
      onWorkflowUpdate(updatedWorkflow);
    }
    
    setDragState({
      isDragging: false,
      elementId: null,
      startPos: null
    });
  }, [dragState.isDragging, elements, onWorkflowUpdate, workflow]);

  return (
    <div className="workflow-canvas-container">
      <canvas
        ref={canvasRef}
        className="workflow-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          cursor: isEditable ? 'grab' : 'default'
        }}
      />
      {!isEditable && (
        <div className="workflow-canvas-overlay">
          <span className="workflow-canvas-readonly-message">
            View Only Mode
          </span>
        </div>
      )}
    </div>
  );
};

export default Canvas;