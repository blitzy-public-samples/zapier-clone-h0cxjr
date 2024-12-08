/**
 * Integration tests for workflow-related functionalities
 * Addresses requirements:
 * - Workflow Management from Technical Specification/Core Features and Functionalities/Workflow Creation
 * - Error Handling Configuration from Technical Specification/Core Features and Functionalities/Workflow Creation
 * - Logging Configuration from Technical Specification/System Design/Monitoring and Observability
 * 
 * Human Tasks:
 * 1. Ensure test database is properly configured and accessible
 * 2. Verify test environment variables are set correctly
 * 3. Configure test data cleanup procedures
 * 4. Set up proper test logging configuration
 */

// supertest v6.3.3
import request from 'supertest';
// jest v29.0.0
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { 
  createWorkflowHandler,
  executeWorkflowHandler,
  getWorkflowVersionHandler 
} from '../../src/api/controllers/workflow.controller';
import { Workflow } from '../../src/database/models/Workflow';
import { WorkflowVersion } from '../../src/database/models/WorkflowVersion';
import { validateWorkflowData } from '../../src/api/validators/workflow.validator';
import { initializeDatabase } from '../../src/config/database.config';

// Mock Express app for testing
const app = require('express')();
app.use(require('express').json());

// Configure routes for testing
app.post('/api/workflows', createWorkflowHandler);
app.post('/api/workflows/:workflowId/execute', executeWorkflowHandler);
app.get('/api/workflows/versions/:versionId', getWorkflowVersionHandler);

describe('Workflow Integration Tests', () => {
  let testWorkflowId: string;
  let testVersionId: string;

  beforeAll(async () => {
    // Initialize test database connection
    await initializeDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    await Workflow.destroy({ where: { id: testWorkflowId } });
  });

  /**
   * Tests the workflow creation API endpoint
   * Addresses requirement: Workflow Management - Tests workflow creation functionality
   */
  test('testWorkflowCreation', async () => {
    // Prepare test workflow data
    const workflowData = {
      name: 'Test Integration Workflow',
      status: 'Draft',
      nodes: [
        { id: 'start', type: 'START' },
        { id: 'end', type: 'END' }
      ],
      transitions: [
        { from: 'start', to: 'end' }
      ]
    };

    // Validate workflow data
    expect(() => validateWorkflowData(workflowData)).not.toThrow();

    // Send request to create workflow
    const response = await request(app)
      .post('/api/workflows')
      .send(workflowData)
      .expect('Content-Type', /json/)
      .expect(201);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message', 'Workflow created successfully');

    // Verify workflow data
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name', workflowData.name);
    expect(response.body.data).toHaveProperty('status', workflowData.status);

    // Store workflow ID for subsequent tests
    testWorkflowId = response.body.data.id;

    // Verify workflow was saved in database
    const savedWorkflow = await Workflow.getWorkflowDetails(testWorkflowId);
    expect(savedWorkflow).toBeTruthy();
    expect(savedWorkflow.name).toBe(workflowData.name);
  });

  /**
   * Tests the workflow execution API endpoint
   * Addresses requirement: Workflow Management - Tests workflow execution functionality
   */
  test('testWorkflowExecution', async () => {
    // Ensure we have a workflow to execute
    expect(testWorkflowId).toBeTruthy();

    // Send request to execute workflow
    const response = await request(app)
      .post(`/api/workflows/${testWorkflowId}/execute`)
      .expect('Content-Type', /json/)
      .expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message', 'Workflow executed successfully');

    // Verify execution data
    expect(response.body.data).toHaveProperty('executionId');
    expect(response.body.data).toHaveProperty('status');
    expect(response.body.data.status).toBe('Completed');

    // Verify execution was logged in database
    const workflow = await Workflow.getWorkflowDetails(testWorkflowId);
    expect(workflow.executions).toBeTruthy();
    expect(workflow.executions.some(exec => exec.id === response.body.data.executionId)).toBe(true);
  });

  /**
   * Tests the workflow version retrieval API endpoint
   * Addresses requirement: Workflow Management - Tests workflow version retrieval functionality
   */
  test('testWorkflowVersionRetrieval', async () => {
    // First, get the version ID from the workflow
    const workflow = await Workflow.getWorkflowDetails(testWorkflowId);
    const version = await WorkflowVersion.findOne({ where: { workflowId: testWorkflowId } });
    testVersionId = version.id;

    // Send request to retrieve workflow version
    const response = await request(app)
      .get(`/api/workflows/versions/${testVersionId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('message', 'Workflow version retrieved successfully');

    // Verify version data
    expect(response.body.data).toHaveProperty('id', testVersionId);
    expect(response.body.data).toHaveProperty('workflowId', testWorkflowId);
    expect(response.body.data).toHaveProperty('version');
    expect(response.body.data).toHaveProperty('definition');

    // Verify version matches database record
    const versionDetails = await WorkflowVersion.getVersionDetails(testVersionId);
    expect(versionDetails).toBeTruthy();
    expect(versionDetails.id).toBe(testVersionId);
    expect(versionDetails.workflowId).toBe(testWorkflowId);
  });

  /**
   * Tests error handling for non-existent workflow
   * Addresses requirement: Error Handling Configuration - Tests error handling mechanisms
   */
  test('testNonExistentWorkflowExecution', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    // Attempt to execute non-existent workflow
    const response = await request(app)
      .post(`/api/workflows/${nonExistentId}/execute`)
      .expect('Content-Type', /json/)
      .expect(400);

    // Verify error response
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'WORKFLOW_EXECUTION_ERROR');
  });
});