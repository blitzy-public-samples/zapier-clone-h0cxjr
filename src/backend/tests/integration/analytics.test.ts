/**
 * Integration tests for the analytics service and related components
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform)
 *   Ensures the analytics service and API endpoints function correctly for monitoring and optimization tools.
 * 
 * Human Tasks:
 * 1. Configure test database with appropriate analytics data retention settings
 * 2. Set up test environment variables for analytics service configuration
 * 3. Verify test data cleanup procedures are properly implemented
 */

// jest v29.0.0
// supertest v6.3.3
import request from 'supertest';
import {
  collectAnalytics,
  retrieveAnalytics
} from '../../src/services/analytics.service';
import { validateAnalyticsData } from '../../src/api/validators/analytics.validator';
import { getAnalytics } from '../../src/api/controllers/analytics.controller';
import { logInfo, logError } from '../../src/utils/logger.util';

// Mock data for testing
const mockWorkflow = {
  id: 'wf-test-123',
  name: 'Test Workflow',
  status: 'Active',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockIntegration = {
  id: 'int-test-123',
  name: 'Test Integration',
  protocol: 'REST',
  retryCount: 3,
  timeout: 5000
};

const mockConnector = {
  id: 'conn-test-123',
  name: 'Test Connector',
  protocol: 'REST'
};

const mockExecution = {
  id: 'exec-test-123',
  workflowId: 'wf-test-123',
  status: 'Completed',
  context: { variables: {} },
  startedAt: new Date(),
  completedAt: new Date()
};

const mockAnalyticsData = {
  workflow: mockWorkflow,
  integration: mockIntegration,
  connector: mockConnector,
  execution: mockExecution,
  timestamp: new Date(),
  metrics: {
    executionTime: 1500,
    memoryUsage: 256,
    apiCalls: 5,
    dataProcessed: 1024
  }
};

describe('Analytics Integration Tests', () => {
  beforeAll(async () => {
    // Log test suite initialization
    logInfo('Starting analytics integration tests', {
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  afterAll(async () => {
    // Clean up test data and log completion
    logInfo('Completed analytics integration tests', {
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  describe('Analytics Data Collection', () => {
    it('should successfully collect and store analytics data', async () => {
      try {
        // Test analytics data collection
        const result = await collectAnalytics(mockAnalyticsData);

        // Verify the result
        expect(result).toBe(true);

        logInfo('Successfully tested analytics data collection', {
          workflowId: mockWorkflow.id,
          executionId: mockExecution.id
        });
      } catch (error) {
        logError('Failed to test analytics data collection', {
          error: error instanceof Error ? error.message : 'Unknown error',
          workflowId: mockWorkflow.id
        });
        throw error;
      }
    });

    it('should validate analytics data before collection', async () => {
      try {
        // Validate the analytics data
        const isValid = validateAnalyticsData(mockAnalyticsData);

        // Verify validation result
        expect(isValid).toBe(true);

        logInfo('Successfully validated analytics data', {
          workflowId: mockWorkflow.id,
          executionId: mockExecution.id
        });
      } catch (error) {
        logError('Analytics data validation failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          workflowId: mockWorkflow.id
        });
        throw error;
      }
    });
  });

  describe('Analytics Data Retrieval', () => {
    it('should retrieve analytics data based on filters', async () => {
      try {
        // Define test filters
        const filters = {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          endDate: new Date(),
          workflowId: mockWorkflow.id,
          integrationId: mockIntegration.id,
          executionStatus: 'Completed',
          metricThresholds: {
            executionTime: 1000,
            memoryUsage: 200
          },
          limit: 10,
          offset: 0
        };

        // Retrieve analytics data
        const analyticsData = await retrieveAnalytics(filters);

        // Verify the retrieved data
        expect(Array.isArray(analyticsData)).toBe(true);
        if (analyticsData.length > 0) {
          expect(analyticsData[0]).toHaveProperty('workflow');
          expect(analyticsData[0]).toHaveProperty('metrics');
        }

        logInfo('Successfully retrieved analytics data', {
          filterCount: Object.keys(filters).length,
          resultCount: analyticsData.length
        });
      } catch (error) {
        logError('Failed to retrieve analytics data', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  });

  describe('Analytics API Endpoint', () => {
    it('should retrieve analytics data through API endpoint', async () => {
      try {
        // Create test server instance
        const app = require('../../src/app').default;

        // Make API request
        const response = await request(app)
          .get('/api/analytics')
          .query({
            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            workflowId: mockWorkflow.id,
            integrationId: mockIntegration.id,
            status: 'Completed',
            metrics: JSON.stringify({
              executionTime: 1000,
              memoryUsage: 200
            }),
            limit: 10,
            offset: 0
          });

        // Verify response
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        logInfo('Successfully tested analytics API endpoint', {
          statusCode: response.status,
          resultCount: response.body.data.length
        });
      } catch (error) {
        logError('Failed to test analytics API endpoint', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });

    it('should handle invalid analytics API requests', async () => {
      try {
        // Create test server instance
        const app = require('../../src/app').default;

        // Make invalid API request
        const response = await request(app)
          .get('/api/analytics')
          .query({
            startDate: 'invalid-date',
            endDate: new Date().toISOString()
          });

        // Verify error response
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');

        logInfo('Successfully tested invalid analytics API request handling', {
          statusCode: response.status,
          errorMessage: response.body.error.message
        });
      } catch (error) {
        logError('Failed to test invalid analytics API request handling', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  });
});