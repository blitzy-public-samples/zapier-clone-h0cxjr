// Jest configuration for web application unit, integration, and end-to-end tests
// @ts-jest version: ^29.0.0
// @testing-library/react version: 14.0.0
// jest version: ^29.0.0

import type { Config } from 'jest';
import { compilerOptions } from './tsconfig.json';

/*
 * Human Tasks:
 * 1. Ensure Node.js version 18+ is installed for Jest compatibility
 * 2. Create jest.setup.ts file in the web root directory for custom test setup
 * 3. Configure IDE Jest test runner integration if needed
 */

// Addresses requirement: "Testing and Validation"
// Location: Technical Specification/System Design/Testing
// Ensures proper configuration for React frontend testing
const jestConfig: Config = {
  // Use jsdom environment for DOM manipulation testing
  testEnvironment: 'jsdom',

  // Configure TypeScript transformation using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Resolve path aliases defined in tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
  },

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Additional configuration for comprehensive testing
  verbose: true,
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  // Performance optimizations
  maxWorkers: '50%',
  timers: 'modern',

  // Error handling
  bail: 1,
  errorOnDeprecated: true,

  // Snapshot testing configuration
  snapshotSerializers: [],
  snapshotFormat: {
    printBasicPrototype: false,
  },

  // Global test timeout
  testTimeout: 10000,
};

export default jestConfig;