/**
 * @fileoverview Integration Type Definitions
 * This file defines type aliases and utility types for integration-related data structures,
 * ensuring type safety and consistency across backend services.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Defines types for managing integration configurations, including supported protocols,
 *   retry logic, and timeout settings.
 * 
 * Human Tasks:
 * - Ensure that any changes to the IntegrationConfig type are reflected in the corresponding
 *   validation schemas and database models
 * - Review the RetryPolicy settings to ensure they align with the system's operational requirements
 */

import { IIntegration } from '../interfaces/IIntegration';
import { SUPPORTED_PROTOCOLS } from '../constants/integration.constants';

/**
 * Represents a lightweight version of the integration configuration,
 * containing only the essential identification and protocol information.
 * This type is useful for scenarios where the complete integration
 * configuration is not needed, such as listing or summary views.
 */
export type IntegrationConfig = Pick<IIntegration, 'id' | 'name' | 'protocol'>;

/**
 * Defines the structure for retry and timeout settings in integration configurations.
 * This type is used to manage error handling and recovery mechanisms for
 * integration operations.
 */
export type RetryPolicy = {
    /**
     * Number of retry attempts for failed integration operations.
     * Must be a non-negative integer.
     */
    retryCount: number;

    /**
     * Timeout duration in milliseconds for integration operations.
     * Must be a positive integer.
     */
    timeout: number;
};

/**
 * Re-export of the IntegrationType from IIntegration for convenience
 * This ensures that consumers of this module have access to the type
 * without needing to import from multiple locations.
 */
export type IntegrationType = typeof SUPPORTED_PROTOCOLS[number];