/**
 * @fileoverview Jest configuration for backend testing
 * Addresses requirement: Testing Framework Configuration from Technical Specification/Development & Deployment/Testing
 * 
 * Human Tasks:
 * 1. Ensure Node.js environment is properly configured for testing
 * 2. Configure CI/CD pipeline to run tests with appropriate settings
 * 3. Set up test coverage reporting integration with code quality tools
 * 4. Review and adjust coverage thresholds based on project requirements
 */

// jest v29.0.0
import type { Config } from 'jest';
import { APP_NAME } from './src/config/app.config';
import { AUTH_TOKEN_EXPIRY } from './src/config/auth.config';
import { CACHE_DEFAULT_TTL } from './src/config/cache.config';
import { initializeDatabase } from './src/config/database.config';
import logger from './src/config/logger.config';
import { initializeQueue } from './src/config/queue.config';
import { initializeSecurity } from './src/config/security.config';

/**
 * Jest configuration object
 * Addresses requirement: Defines the configuration for the Jest testing framework
 */
const config: Config = {
  // Display name in test results
  displayName: APP_NAME,

  // Test environment configuration
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 85
    }
  },

  // Global test timeout
  testTimeout: 30000,

  // Global setup and teardown
  globalSetup: async () => {
    // Initialize required services for testing
    try {
      // Set up test environment
      process.env.NODE_ENV = 'test';
      
      // Initialize database connection
      await initializeDatabase();
      
      // Initialize security settings
      await initializeSecurity();
      
      // Initialize message queue
      await initializeQueue();
      
      // Configure logger for testing
      logger.silent = true;
      
      // Set up global test constants
      global.TEST_ENV = 'test';
      global.AUTH_TOKEN_EXPIRY = AUTH_TOKEN_EXPIRY;
      global.CACHE_DEFAULT_TTL = CACHE_DEFAULT_TTL;
    } catch (error) {
      console.error('Failed to set up test environment:', error);
      throw error;
    }
  },

  // Global teardown
  globalTeardown: async () => {
    // Clean up test environment
    try {
      // Additional cleanup if needed
    } catch (error) {
      console.error('Failed to tear down test environment:', error);
      throw error;
    }
  },

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Verbose output for detailed test results
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Automatically restore mocks between tests
  restoreMocks: true,

  // Detect memory leaks
  detectLeaks: true,

  // Maximum number of concurrent tests
  maxConcurrency: 5,

  // Custom reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'jest-junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
};

export default config;