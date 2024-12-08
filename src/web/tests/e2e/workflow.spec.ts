/**
 * Human Tasks:
 * 1. Configure test environment variables for different deployment environments
 * 2. Review test coverage with QA team to ensure all critical paths are tested
 * 3. Set up test data cleanup procedures for CI/CD pipeline
 * 4. Verify test assertions match acceptance criteria
 */

// Cypress version ^12.0.0
import CreateWorkflowPage from '../../src/pages/Workflows/Create';
import EditWorkflowPage from '../../src/pages/Workflows/Edit';
import ViewWorkflowPage from '../../src/pages/Workflows/View';
import { actions } from '../../src/store/slices/workflowSlice';
import { validateWorkflowData } from '../../src/utils/validation.util';

/**
 * End-to-end tests for workflow functionalities
 * Requirements Addressed:
 * - End-to-End Testing (Technical Specification/System Design/Testing)
 *   Implements E2E tests to validate the workflow functionalities, including creation,
 *   editing, viewing, and deletion.
 */
describe('Workflow E2E Tests', () => {
  // Test workflow data
  const testWorkflow = {
    name: 'Test Workflow',
    status: 'Draft',
    steps: []
  };

  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit(Cypress.env('CYPRESS_BASE_URL'));
    
    // Clear any existing workflows
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('Workflow Creation', () => {
    it('should create a new workflow successfully', () => {
      // Navigate to create workflow page
      cy.visit('/workflows/create');

      // Verify page title
      cy.get('.create-workflow-page__title')
        .should('be.visible')
        .and('contain', 'Create New Workflow');

      // Enter workflow name
      cy.get('#step-name')
        .type(testWorkflow.name)
        .should('have.value', testWorkflow.name);

      // Select workflow type
      cy.get('#step-type')
        .select('integration')
        .should('have.value', 'integration');

      // Add workflow step from library
      cy.get('.step-library__step')
        .first()
        .drag('.workflow-builder__canvas');

      // Configure step properties
      cy.get('.property-panel__input')
        .first()
        .type('API Step')
        .should('have.value', 'API Step');

      // Save workflow
      cy.get('.property-panel__button--primary')
        .click();

      // Verify success notification
      cy.get('.notification')
        .should('be.visible')
        .and('contain', 'Workflow created successfully');
    });

    it('should validate required fields during creation', () => {
      cy.visit('/workflows/create');

      // Try to save without required fields
      cy.get('.property-panel__button--primary')
        .click();

      // Verify validation errors
      cy.get('.property-panel__error')
        .should('be.visible')
        .and('contain', 'Name is required');
    });
  });

  describe('Workflow Editing', () => {
    beforeEach(() => {
      // Create a test workflow before editing tests
      cy.createTestWorkflow(testWorkflow);
    });

    it('should edit an existing workflow successfully', () => {
      // Navigate to edit page
      cy.visit(`/workflows/${testWorkflow.workflowId}/edit`);

      // Verify page loaded with correct workflow
      cy.get('.workflow-edit-page__title')
        .should('contain', testWorkflow.name);

      // Update workflow name
      cy.get('#step-name')
        .clear()
        .type('Updated Workflow')
        .should('have.value', 'Updated Workflow');

      // Add new step
      cy.get('.step-library__step')
        .contains('Transform Data')
        .drag('.workflow-builder__canvas');

      // Save changes
      cy.get('.workflow-edit-page__button--primary')
        .click();

      // Verify success notification
      cy.get('.notification')
        .should('be.visible')
        .and('contain', 'Workflow updated successfully');
    });

    it('should handle validation during editing', () => {
      cy.visit(`/workflows/${testWorkflow.workflowId}/edit`);

      // Clear required field
      cy.get('#step-name')
        .clear();

      // Try to save
      cy.get('.workflow-edit-page__button--primary')
        .click();

      // Verify validation error
      cy.get('.property-panel__error')
        .should('be.visible')
        .and('contain', 'Name is required');
    });
  });

  describe('Workflow Viewing', () => {
    beforeEach(() => {
      cy.createTestWorkflow(testWorkflow);
    });

    it('should display workflow details correctly', () => {
      // Navigate to view page
      cy.visit(`/workflows/${testWorkflow.workflowId}`);

      // Verify workflow name
      cy.get('.workflow-view__title')
        .should('contain', testWorkflow.name);

      // Verify workflow status
      cy.get('.workflow-view__status')
        .should('contain', testWorkflow.status);

      // Verify workflow steps are displayed
      cy.get('.workflow-canvas')
        .should('be.visible');

      // Verify property panel is read-only
      cy.get('.property-panel__input')
        .should('be.disabled');
    });

    it('should navigate to edit page', () => {
      cy.visit(`/workflows/${testWorkflow.workflowId}`);

      // Click edit button
      cy.get('.workflow-view__edit-button')
        .click();

      // Verify navigation to edit page
      cy.url()
        .should('include', `/workflows/${testWorkflow.workflowId}/edit`);
    });
  });

  describe('Workflow Deletion', () => {
    beforeEach(() => {
      cy.createTestWorkflow(testWorkflow);
    });

    it('should delete workflow successfully', () => {
      cy.visit('/workflows');

      // Click delete button
      cy.get('.workflow-list__delete-button')
        .first()
        .click();

      // Confirm deletion
      cy.get('.confirmation-dialog__confirm-button')
        .click();

      // Verify success notification
      cy.get('.notification')
        .should('be.visible')
        .and('contain', 'Workflow deleted successfully');

      // Verify workflow removed from list
      cy.get('.workflow-list__item')
        .should('not.contain', testWorkflow.name);
    });

    it('should handle deletion cancellation', () => {
      cy.visit('/workflows');

      // Click delete button
      cy.get('.workflow-list__delete-button')
        .first()
        .click();

      // Cancel deletion
      cy.get('.confirmation-dialog__cancel-button')
        .click();

      // Verify workflow still exists
      cy.get('.workflow-list__item')
        .should('contain', testWorkflow.name);
    });
  });
});

// Custom Cypress commands
Cypress.Commands.add('createTestWorkflow', (workflow) => {
  cy.window().then((win) => {
    const store = win.store;
    store.dispatch(actions.addWorkflow(workflow));
  });
});

Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, targetSelector) => {
  cy.wrap(subject)
    .trigger('dragstart')
    .get(targetSelector)
    .trigger('dragover')
    .trigger('drop');
});