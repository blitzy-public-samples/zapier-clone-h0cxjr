/**
 * Human Tasks:
 * 1. Configure test environment variables for different deployment environments
 * 2. Set up test data cleanup procedures for CI/CD pipeline
 * 3. Review test coverage with QA team to ensure all critical paths are tested
 * 4. Verify test assertions match acceptance criteria
 */

// cypress version ^12.0.0
import { defineConfig } from 'cypress';
import { workflowE2ETests } from './tests/e2e/workflow.spec';
import { authE2ETests } from './tests/e2e/auth.spec';
import { validateWorkflowData } from './src/utils/validation.util';
import { setItem } from './src/utils/storage.util';

/**
 * Cypress configuration for end-to-end testing
 * Requirements Addressed:
 * - End-to-End Testing Configuration (Technical Specification/System Design/Testing)
 *   Defines the configuration for Cypress to enable E2E testing of workflows,
 *   authentication, and other frontend functionalities.
 */
export default defineConfig({
  // Base URL for all tests
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',

  // E2E Testing configuration
  e2e: {
    setupNodeEvents(on, config) {
      // Register custom tasks and plugins
      on('task', {
        // Task to validate workflow data during tests
        validateWorkflow: (data: any) => {
          return validateWorkflowData(data);
        },
        // Task to manage local storage during tests
        setLocalStorage: ({ key, value }) => {
          setItem(key, value);
          return null;
        }
      });

      // Return modified config
      return config;
    },

    // Test file pattern
    specPattern: 'tests/e2e/**/*.spec.{js,jsx,ts,tsx}',

    // Browser launch options
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 30000,

    // Viewport configuration
    viewportWidth: 1280,
    viewportHeight: 720,

    // Test retries configuration
    retries: {
      runMode: 2,
      openMode: 0
    },

    // Screenshot and video configuration
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 32,
    videosFolder: 'tests/e2e/videos',
    screenshotsFolder: 'tests/e2e/screenshots',

    // Environment variables
    env: {
      CYPRESS_BASE_URL: 'http://localhost:3000',
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL
    }
  },

  // Component testing configuration
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.spec.{js,jsx,ts,tsx}'
  },

  // Global configuration
  watchForFileChanges: false,
  numTestsKeptInMemory: 50,
  experimentalMemoryManagement: true,

  // Reporter configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json'
  },

  // Browser configuration
  browsers: [
    {
      name: 'chrome',
      family: 'chromium',
      channel: 'stable',
      displayName: 'Chrome',
      version: 'latest'
    },
    {
      name: 'electron',
      family: 'chromium',
      displayName: 'Electron',
      version: 'latest'
    }
  ]
});