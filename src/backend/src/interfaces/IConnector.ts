/**
 * @fileoverview IConnector Interface Definition
 * This file defines the core interface for integration connectors that handle
 * communication with external systems using various protocols.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Provides an interface for defining integration connectors, ensuring consistency and 
 *   compatibility with supported protocols and configurations.
 * 
 * Human Tasks:
 * - When implementing a new connector, ensure it properly implements all methods defined in this interface
 * - Verify that the connector's protocol matches one of the supported protocols in SUPPORTED_PROTOCOLS
 * - Ensure proper error handling is implemented in the configure and validate methods
 */

import { IntegrationType } from '../types/integration.types';
import { SUPPORTED_PROTOCOLS } from '../constants/integration.constants';

/**
 * Interface defining the structure and behavior of integration connectors.
 * All concrete connector implementations must adhere to this interface to ensure
 * consistent behavior across different integration types.
 */
export interface IConnector {
    /**
     * Unique identifier for the connector instance
     */
    id: string;

    /**
     * Human-readable name for the connector
     */
    name: string;

    /**
     * The protocol used by this connector.
     * Must be one of the supported protocols defined in SUPPORTED_PROTOCOLS
     */
    protocol: IntegrationType;

    /**
     * Configures the connector with the provided configuration options.
     * This method should be called before using the connector for any operations.
     * 
     * @param config - Configuration object containing protocol-specific settings
     * @returns Promise<void> - Resolves when configuration is complete
     * @throws Error if configuration is invalid or fails
     */
    configure(config: Record<string, unknown>): Promise<void>;

    /**
     * Validates the connector's configuration and connectivity.
     * This method should be used to verify that the connector is properly configured
     * and can successfully communicate with the external system.
     * 
     * @returns Promise<boolean> - Resolves to true if validation succeeds, false otherwise
     * @throws Error if validation process encounters an error
     */
    validate(): Promise<boolean>;
}