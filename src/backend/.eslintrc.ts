/**
 * ESLint configuration for backend project
 * 
 * Addresses requirements:
 * - Code Quality and Standards (Technical Specification/System Design/Development Environment)
 * - Development Automation (Technical Specification/Development & Deployment/Development Environment)
 * 
 * Human Tasks:
 * 1. Ensure all developers have ESLint plugin installed in their IDEs
 * 2. Configure pre-commit hooks to run ESLint checks
 * 3. Set up CI/CD pipeline integration for linting checks
 * 4. Review and adjust rules based on team feedback and project needs
 */

// External dependencies versions:
// eslint: ^8.0.0
// @typescript-eslint/parser: ^5.0.0
// @typescript-eslint/eslint-plugin: ^5.0.0
// eslint-config-prettier: ^8.0.0
// eslint-plugin-prettier: ^5.0.0

import { ValidationError } from './src/constants/error.constants';

const eslintConfig = {
  // Environment configuration
  env: {
    node: true,
    es2020: true
  },

  // Configuration extends
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],

  // Parser configuration
  parser: '@typescript-eslint/parser',

  // Parser options
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },

  // Custom rules configuration
  rules: {
    // Warn on unused variables to help maintain clean code
    '@typescript-eslint/no-unused-vars': 'warn',

    // Enforce explicit type declarations and prevent 'any' usage
    '@typescript-eslint/no-explicit-any': 'error',

    // Enforce Prettier formatting
    'prettier/prettier': 'error',

    // Additional TypeScript-specific rules
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // Error handling rules
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',

    // Code style rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'no-duplicate-imports': 'error',
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
      }
    ],

    // Error code validation
    'no-restricted-syntax': [
      'error',
      {
        selector: `Literal[value='${ValidationError}']`,
        message: 'Use ERROR_CODES.ValidationError instead of string literal.'
      }
    ]
  },

  // Override rules for specific file patterns
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off'
      }
    },
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-interface': 'off'
      }
    }
  ],

  // Plugin configurations
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  }
};

export default eslintConfig;