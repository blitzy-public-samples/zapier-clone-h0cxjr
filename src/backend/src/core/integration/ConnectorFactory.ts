/**
 * @fileoverview ConnectorFactory Class Implementation
 * This file implements the ConnectorFactory class, which is responsible for dynamically creating
 * instances of various connector types based on the specified protocol.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Provides a factory for dynamically creating connector instances based on protocol,
 *   enabling seamless integration with external services.
 * 
 * Human Tasks:
 * 1. Review and update supported protocols when adding new connector types
 * 2. Ensure proper error handling is configured for connector creation failures
 * 3. Verify that all connector configurations align with security requirements
 * 4. Monitor connector instance lifecycle and resource usage
 */

import { BaseConnector } from './BaseConnector';
import { ConnectorRegistry } from './ConnectorRegistry';
import { HttpConnector } from './connectors/HttpConnector';
import { RestConnector } from './connectors/RestConnector';
import { SoapConnector } from './connectors/SoapConnector';
import { WebhookConnector } from './connectors/WebhookConnector';
import { logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { IntegrationType } from '../../types/integration.types';

/**
 * Factory class for creating connector instances dynamically based on protocol.
 * Ensures proper instantiation and configuration of different connector types.
 */
export class ConnectorFactory {
    /**
     * Registry instance for managing connector instances
     */
    private readonly registry: ConnectorRegistry;

    /**
     * Initializes a new instance of ConnectorFactory.
     * Sets up the connector registry for managing connector instances.
     */
    constructor() {
        this.registry = ConnectorRegistry.getInstance();
    }

    /**
     * Creates an instance of a connector based on the specified protocol.
     * 
     * @param protocol - The protocol type for the connector
     * @param config - Configuration object containing connector-specific settings
     * @returns An instance of the appropriate connector class
     * @throws Error if protocol is not supported or configuration is invalid
     */
    public async createConnector(
        protocol: IntegrationType,
        config: {
            id: string;
            name: string;
            baseUrl?: string;
            wsdlUrl?: string;
            webhookUrl?: string;
            headers?: Record<string, string>;
        }
    ): Promise<BaseConnector> {
        try {
            // Validate required configuration
            if (!config.id || !config.name) {
                throw new Error('Connector ID and name are required');
            }

            let connector: BaseConnector;

            // Create appropriate connector instance based on protocol
            switch (protocol) {
                case 'REST':
                    if (!config.baseUrl) {
                        throw new Error('Base URL is required for REST connector');
                    }
                    connector = new RestConnector(
                        config.id,
                        config.name,
                        protocol,
                        config.baseUrl,
                        config.headers
                    );
                    break;

                case 'SOAP':
                    if (!config.wsdlUrl) {
                        throw new Error('WSDL URL is required for SOAP connector');
                    }
                    connector = new SoapConnector(
                        config.id,
                        config.name,
                        protocol,
                        config.wsdlUrl
                    );
                    break;

                case 'HTTP':
                    if (!config.baseUrl) {
                        throw new Error('Base URL is required for HTTP connector');
                    }
                    connector = new HttpConnector(
                        config.id,
                        config.name,
                        protocol,
                        config.baseUrl,
                        config.headers
                    );
                    break;

                case 'WebSocket':
                    if (!config.webhookUrl) {
                        throw new Error('Webhook URL is required for WebSocket connector');
                    }
                    connector = new WebhookConnector(
                        config.id,
                        config.name,
                        protocol,
                        config.webhookUrl,
                        config.headers
                    );
                    break;

                default:
                    throw new Error(`Unsupported protocol: ${protocol}`);
            }

            // Configure the connector
            await connector.configure(config);

            // Validate the connector
            const isValid = await connector.validate();
            if (!isValid) {
                throw new Error(`Connector validation failed for protocol: ${protocol}`);
            }

            // Register the connector instance
            this.registry.registerConnector(connector);

            return connector;
        } catch (error) {
            // Log the error with context
            logError('CONNECTOR_CREATION_ERROR', (error as Error).message, {
                protocol,
                config: {
                    ...config,
                    // Exclude sensitive data from logs
                    headers: config.headers ? Object.keys(config.headers) : undefined
                }
            });

            // Handle and re-throw the error
            handleError(error as Error);
            throw error;
        }
    }
}