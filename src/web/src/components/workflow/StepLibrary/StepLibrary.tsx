/**
 * Human Tasks:
 * 1. Review drag-and-drop interaction patterns with UX team
 * 2. Verify step categories and groupings with business stakeholders
 * 3. Test accessibility of drag-and-drop operations with screen readers
 * 4. Confirm step library layout works well on different screen sizes
 */

// React v18.2.0
import React, { useState, useCallback, useEffect } from 'react';

// Internal imports with relative paths
import { Builder } from '../Builder/Builder';
import { Canvas } from '../Canvas/Canvas';
import PropertyPanel from '../PropertyPanel/PropertyPanel';
import useWorkflow from '../../hooks/useWorkflow';
import { WORKFLOW_STATUS_MAPPING } from '../../constants/workflow.constants';

/**
 * Interface for step category
 */
interface StepCategory {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

/**
 * Interface for workflow step
 */
interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  icon?: string;
  category: string;
}

/**
 * StepLibrary component that provides a categorized list of workflow steps
 * Requirements Addressed:
 * - Workflow Creation (Technical Specification/Scope/Core Features and Functionalities)
 *   Provides a library of workflow steps for drag-and-drop functionality in the workflow builder.
 */
const StepLibrary: React.FC = () => {
  // Get workflow management functions from custom hook
  const {
    workflows,
    loading,
    error,
    getWorkflows
  } = useWorkflow();

  // State for step categories and selected step
  const [categories, setCategories] = useState<StepCategory[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Initialize step categories
   */
  useEffect(() => {
    const defaultCategories: StepCategory[] = [
      {
        id: 'triggers',
        name: 'Triggers',
        steps: [
          {
            id: 'webhook',
            name: 'Webhook',
            type: 'trigger',
            description: 'Start workflow on HTTP request',
            category: 'triggers'
          },
          {
            id: 'schedule',
            name: 'Schedule',
            type: 'trigger',
            description: 'Start workflow on schedule',
            category: 'triggers'
          }
        ]
      },
      {
        id: 'actions',
        name: 'Actions',
        steps: [
          {
            id: 'api_request',
            name: 'API Request',
            type: 'action',
            description: 'Make HTTP API calls',
            category: 'actions'
          },
          {
            id: 'transform',
            name: 'Transform Data',
            type: 'action',
            description: 'Transform data between steps',
            category: 'actions'
          }
        ]
      },
      {
        id: 'logic',
        name: 'Logic',
        steps: [
          {
            id: 'condition',
            name: 'Condition',
            type: 'logic',
            description: 'Add conditional logic',
            category: 'logic'
          },
          {
            id: 'loop',
            name: 'Loop',
            type: 'logic',
            description: 'Iterate over data',
            category: 'logic'
          }
        ]
      }
    ];

    setCategories(defaultCategories);
  }, []);

  /**
   * Handle step selection
   */
  const handleStepSelect = useCallback((stepId: string) => {
    setSelectedStep(stepId);
  }, []);

  /**
   * Handle step drag start
   */
  const handleDragStart = useCallback((event: React.DragEvent, step: WorkflowStep) => {
    event.dataTransfer.setData('application/json', JSON.stringify(step));
    event.dataTransfer.effectAllowed = 'copy';
  }, []);

  /**
   * Filter steps based on search query
   */
  const filteredCategories = categories.map(category => ({
    ...category,
    steps: category.steps.filter(step =>
      step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.steps.length > 0);

  return (
    <div className="step-library">
      <div className="step-library__header">
        <h2 className="step-library__title">Step Library</h2>
        <input
          type="text"
          className="step-library__search"
          placeholder="Search steps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="step-library__content">
        {loading ? (
          <div className="step-library__loading">Loading steps...</div>
        ) : error ? (
          <div className="step-library__error">{error}</div>
        ) : (
          <div className="step-library__categories">
            {filteredCategories.map(category => (
              <div key={category.id} className="step-library__category">
                <h3 className="step-library__category-title">{category.name}</h3>
                <div className="step-library__steps">
                  {category.steps.map(step => (
                    <div
                      key={step.id}
                      className={`step-library__step ${selectedStep === step.id ? 'step-library__step--selected' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, step)}
                      onClick={() => handleStepSelect(step.id)}
                    >
                      {step.icon && (
                        <span className="step-library__step-icon">
                          {step.icon}
                        </span>
                      )}
                      <div className="step-library__step-content">
                        <span className="step-library__step-name">
                          {step.name}
                        </span>
                        <span className="step-library__step-description">
                          {step.description}
                        </span>
                      </div>
                      <span className="step-library__step-type">
                        {step.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStep && (
        <div className="step-library__details">
          <PropertyPanel
            selectedStepId={selectedStep}
            onPropertiesUpdate={(stepId, properties) => {
              console.log('Step properties updated:', stepId, properties);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StepLibrary;