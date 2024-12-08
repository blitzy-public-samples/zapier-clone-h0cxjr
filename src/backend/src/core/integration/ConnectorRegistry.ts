/**
 * @fileoverview ConnectorRegistry Class Implementation
 * This file implements the ConnectorRegistry class, which acts as a centralized registry 
 * for managing integration connectors.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements a registry for managing integration connectors, enabling dynamic registration
 *   and retrieval of connectors for seamless integration.
 * 
 * Human Tasks:
 * 1. Review connector validation rules when adding new connector types
 * 2. Ensure proper error handling is configured for connector registration failures
 * 3. Monitor registry performance with large numbers of connectors
 */

import { BaseConnector } from './BaseConnector';
import { IConnector } from '../../interfaces/IConnector';
import { DataMapper } from './DataMapper';
import { logError } from '../../utils/logger.util';

/**
 * ConnectorRegistry class that provides centralized management of integration connectors.
 * Implements singleton pattern to ensure a single registry instance across the application.
 */
export class ConnectorRegistry {
    /**
     * Internal storage for registered connectors
     * Key: Protocol (IntegrationType)
     * Value: BaseConnector instance
     */
    private registry: Map<string, BaseConnector>;

    /**
     * Singleton instance of the ConnectorRegistry
     */
    private static instance: ConnectorRegistry;

    /**
     * Private constructor to enforce singleton pattern
     * Initializes an empty registry
     */
    private constructor() {
        this.registry = new Map<string, BaseConnector>();
    }

    /**
     * Gets the singleton instance of the ConnectorRegistry
     * Creates a new instance if one doesn't exist
     * 
     * @returns The singleton ConnectorRegistry instance
     */
    public static getInstance(): ConnectorRegistry {
        if (!ConnectorRegistry.instance) {
            ConnectorRegistry.instance = new ConnectorRegistry();
        }
        return ConnectorRegistry.instance;
    }

    /**
     * Registers a new connector in the registry
     * Validates the connector before registration
     * 
     * @param connector - The connector instance to register
     * @throws Error if connector validation fails or if protocol is already registered
     */
    public registerConnector(connector: BaseConnector): void {
        try {
            // Validate connector implements required interface
            this.validateConnector(connector);

            // Check if protocol is already registered
            if (this.registry.has(connector.protocol)) {
                throw new Error(`Connector for protocol ${connector.protocol} is already registered`);
            }

            // Register the connector
            this.registry.set(connector.protocol, connector);

            // Log successful registration
            logInfo('Connector registered successfully', {
                connectorId: connector.id,
                connectorName: connector.name,
                protocol: connector.protocol
            });
        } catch (error) {
            logError('CONNECTOR_REGISTRATION_ERROR', error.message, {
                connectorId: connector?.id,
                connectorName: connector?.name,
                protocol: connector?.protocol
            });
            throw error;
        }
    }

    /**
     * Retrieves a connector instance by its protocol
     * 
     * @param protocol - The protocol of the connector to retrieve
     * @returns The connector instance
     * @throws Error if the connector is not found
     */
    public getConnector(protocol: string): BaseConnector {
        try {
            const connector = this.registry.get(protocol);
            
            if (!connector) {
                throw new Error(`No connector registered for protocol: ${protocol}`);
            }

            return connector;
        } catch (error) {
            logError('CONNECTOR_RETRIEVAL_ERROR', error.message, {
                protocol
            });
            throw error;
        }
    }

    /**
     * Validates that a connector implements the required interface
     * 
     * @private
     * @param connector - The connector instance to validate
     * @throws Error if validation fails
     */
    private validateConnector(connector: BaseConnector): void {
        // Check if connector is an instance of BaseConnector
        if (!(connector instanceof BaseConnector)) {
            throw new Error('Invalid connector: Must be an instance of BaseConnector');
        }

        // Validate required properties
        if (!connector.id || typeof connector.id !== 'string') {
            throw new Error('Invalid connector: Missing or invalid id property');
        }

        if (!connector.name || typeof connector.name !== 'string') {
            throw new Error('Invalid connector: Missing or invalid name property');
        }

        if (!connector.protocol || typeof connector.protocol !== 'string') {
            throw new Error('Invalid connector: Missing or invalid protocol property');
        }
    }

    /**
     * Gets all registered connectors
     * 
     * @returns Array of registered connector instances
     */
    public getAllConnectors(): BaseConnector[] {
        return Array.from(this.registry.values());
    }

    /**
     * Removes a connector from the registry
     * 
     * @param protocol - The protocol of the connector to remove
     * @throws Error if the connector is not found
     */
    public removeConnector(protocol: string): void {
        try {
            if (!this.registry.has(protocol)) {
                throw new Error(`No connector registered for protocol: ${protocol}`);
            }

            this.registry.delete(protocol);

            logInfo('Connector removed successfully', {
                protocol
            });
        } catch (error) {
            logError('CONNECTOR_REMOVAL_ERROR', error.message, {
                protocol
            });
            throw error;
        }
    }

    /**
     * Clears all registered connectors from the registry
     */
    public clearRegistry(): void {
        this.registry.clear();
        logInfo('Connector registry cleared');
    }
}