/**
 * @fileoverview Integration Interface Definition
 * This file defines the core interface for integration configurations used throughout the application.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Defines the structure and properties required for managing integration configurations, including
 *   authentication, rate limiting, and retry logic.
 * 
 * Human Tasks:
 * - Ensure that any new integration protocols added to the system are also added to SUPPORTED_PROTOCOLS
 * - Verify that the timeout values align with the infrastructure capabilities and SLAs
 */

import { SUPPORTED_PROTOCOLS } from '../constants/integration.constants';

/**
 * Defines the supported integration types based on the SUPPORTED_PROTOCOLS constant.
 * This ensures type safety and consistency between the runtime constants and type system.
 */
type IntegrationType = typeof SUPPORTED_PROTOCOLS[number];

/**
 * Interface defining the structure of integration configurations.
 * This interface ensures type safety and consistency for integration-related
 * data structures across the backend services.
 */
export interface IIntegration {
    /**
     * Unique identifier for the integration configuration
     */
    id: string;

    /**
     * Human-readable name for the integration
     */
    name: string;

    /**
     * The protocol used for the integration.
     * Must be one of the supported protocols defined in SUPPORTED_PROTOCOLS
     */
    protocol: IntegrationType;

    /**
     * Number of retry attempts for failed integration operations
     * Must be a non-negative integer
     */
    retryCount: number;

    /**
     * Timeout in milliseconds for integration operations
     * Must be a positive integer
     */
    timeout: number;
}