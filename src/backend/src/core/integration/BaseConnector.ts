/**
 * @fileoverview BaseConnector Class Implementation
 * This file defines the abstract base class for integration connectors, providing
 * common functionality and enforcing a consistent structure for all connectors.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Provides a base class for defining integration connectors, ensuring consistency and
 *   compatibility with supported protocols and configurations.
 * 
 * Human Tasks:
 * 1. Ensure proper error monitoring is configured for connector validation failures
 * 2. Review and adjust logging levels for connector operations in production
 * 3. Verify that all concrete connector implementations properly extend this base class
 */

import { IConnector } from '../../interfaces/IConnector';
import { SUPPORTED_PROTOCOLS } from '../../constants/integration.constants';
import { logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { IntegrationType } from '../../types/integration.types';

/**
 * Abstract base class for integration connectors, providing common functionality
 * and enforcing a consistent structure for all connectors.
 * Implements the IConnector interface to ensure compatibility.
 */
export abstract class BaseConnector implements IConnector {
    /**
     * Unique identifier for the connector instance
     */
    public readonly id: string;

    /**
     * Human-readable name for the connector
     */
    public readonly name: string;

    /**
     * The protocol used by this connector
     */
    public readonly protocol: IntegrationType;

    /**
     * Initializes a new instance of the BaseConnector class.
     * 
     * @param id - Unique identifier for the connector
     * @param name - Human-readable name for the connector
     * @param protocol - The protocol used by this connector
     * @throws Error if the protocol is not supported
     */
    constructor(id: string, name: string, protocol: IntegrationType) {
        this.id = id;
        this.name = name;
        this.protocol = protocol;

        // Validate protocol during initialization
        if (!SUPPORTED_PROTOCOLS.includes(protocol)) {
            const error = new Error(`Unsupported protocol: ${protocol}`);
            logError('INVALID_PROTOCOL', error.message, {
                connectorId: id,
                connectorName: name,
                protocol,
                supportedProtocols: SUPPORTED_PROTOCOLS
            });
            handleError(error, true);
        }
    }

    /**
     * Abstract method to configure the connector.
     * Must be implemented by concrete connector classes.
     * 
     * @param config - Configuration object containing protocol-specific settings
     * @throws Error indicating that the method must be implemented
     */
    public abstract configure(config: Record<string, unknown>): Promise<void>;

    /**
     * Validates the connector configuration and protocol.
     * 
     * @returns Promise<boolean> indicating whether the connector is valid
     * @throws Error if validation fails
     */
    public async validate(): Promise<boolean> {
        try {
            // Verify that the protocol is supported
            if (!SUPPORTED_PROTOCOLS.includes(this.protocol)) {
                logError('INVALID_PROTOCOL', `Unsupported protocol: ${this.protocol}`, {
                    connectorId: this.id,
                    connectorName: this.name,
                    protocol: this.protocol,
                    supportedProtocols: SUPPORTED_PROTOCOLS
                });
                return false;
            }

            return true;
        } catch (error) {
            handleError(error as Error);
            return false;
        }
    }
}