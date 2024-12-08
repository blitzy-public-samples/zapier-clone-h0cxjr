// ESLint configuration for React TypeScript web application
// Required package versions:
// eslint: ^8.0.0
// @typescript-eslint/parser: ^5.0.0
// @typescript-eslint/eslint-plugin: ^5.0.0
// eslint-plugin-react: ^7.0.0
// eslint-config-prettier: ^8.0.0

/*
Human Tasks:
1. Ensure all required ESLint plugins are installed via npm/yarn
2. Verify that Prettier is installed and configured in the project
3. Confirm that the TypeScript configuration (tsconfig.json) is properly set up
4. Review and adjust rule severity levels based on team preferences
*/

import type { Linter } from 'eslint';
import { compilerOptions } from './tsconfig.json';

// Requirement: Code Quality and Consistency
// Location: Technical Specification/Development & Deployment/Development Environment
// Description: Ensures consistent coding standards and best practices across the React-based frontend application
const eslintConfig: Linter.Config = {
  // Define environment settings
  env: {
    browser: true,
    es2021: true,
  },

  // Extend recommended configurations
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Must be last to override other configs
  ],

  // Specify parser for TypeScript
  parser: '@typescript-eslint/parser',

  // Configure parser options
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json', // Link to TypeScript configuration
  },

  // Enable required plugins
  plugins: [
    'react',
    '@typescript-eslint',
  ],

  // Define specific rules
  rules: {
    // Enforce consistent code style
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],

    // Disable prop-types as we use TypeScript for type checking
    'react/prop-types': 'off',

    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Prettier integration rules
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'always',
      },
    ],

    // React-specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/display-name': 'off',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-curly-spacing': ['error', { when: 'never' }],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-tag-spacing': ['error', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    }],
  },

  // Settings for plugins
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },

  // Override rules for specific files or patterns
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx'],
      env: {
        jest: true,
        node: true,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['error'],
      },
    },
  ],
};

export default eslintConfig;