/// <reference types="vite/client" />

/**
 * @fileoverview TypeScript type declarations for Vite environment
 * Requirements addressed:
 * - Development Environment Configuration (Technical Specification/Development & Deployment/Development Environment)
 *   Ensures type safety and compatibility with the Vite build tool for the web application.
 */

import { analyticsId, workflow } from './types/analytics.types';
import { token } from './types/auth.types';
import { executionId, status } from './types/execution.types';
import { integrationId, auth } from './types/integration.types';
import { workflowId, status as workflowStatus } from './types/workflow.types';

/**
 * Interface defining the structure of environment variables used in the Vite build tool.
 * This interface extends the ImportMetaEnv interface provided by Vite.
 */
interface ImportMetaEnv {
  /**
   * Application title used throughout the web interface
   */
  readonly VITE_APP_TITLE: string;

  // Add other environment variables as needed
}

/**
 * Interface that extends the ImportMeta interface provided by Vite
 * to include our environment variable definitions
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Export the ViteEnv interface for use in other parts of the application
 */
export interface ViteEnv {
  /**
   * Application title from environment variables
   */
  VITE_APP_TITLE: string;
}

// Type assertions to ensure imported types are used and properly typed
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Ensure imported types are used to maintain type safety
type _TypeCheck = {
  analyticsId: typeof analyticsId;
  workflow: typeof workflow;
  token: typeof token;
  executionId: typeof executionId;
  executionStatus: typeof status;
  integrationId: typeof integrationId;
  auth: typeof auth;
  workflowId: typeof workflowId;
  workflowStatus: typeof workflowStatus;
};