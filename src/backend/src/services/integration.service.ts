/**
 * @fileoverview Integration Service Implementation
 * This file implements the IntegrationService class, which provides high-level methods
 * for managing integration connectors, including registration, retrieval, and execution.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements high-level service methods for managing integration connectors, enabling
 *   seamless integration with external systems.
 * 
 * Human Tasks:
 * 1. Review and adjust connector validation rules for production environment
 * 2. Configure monitoring alerts for connector failures
 * 3. Set up proper error tracking for integration failures
 * 4. Verify security settings for connector configurations
 */

import { BaseConnector } from '../core/integration/BaseConnector';
import { ConnectorRegistry } from '../core/integration/ConnectorRegistry';
import { ConnectorFactory } from '../core/integration/ConnectorFactory';
import { IIntegration } from '../interfaces/IIntegration';
import { logError } from '../utils/logger.util';
import { handleError } from '../utils/error.util';

/**
 * Service class for managing integration connectors, including registration,
 * retrieval, and execution of connectors.
 */
export class IntegrationService {
    private readonly connectorRegistry: ConnectorRegistry;
    private readonly connectorFactory: ConnectorFactory;

    /**
     * Initializes a new instance of IntegrationService.
     * Sets up the connector registry and factory instances.
     */
    constructor() {
        this.connectorRegistry = ConnectorRegistry.getInstance();
        this.connectorFactory = new ConnectorFactory();
    }

    /**
     * Registers a new integration connector using the provided configuration.
     * 
     * @param integrationConfig - Configuration for the integration connector
     * @throws Error if registration fails or configuration is invalid
     */
    public async registerIntegration(integrationConfig: IIntegration): Promise<void> {
        try {
            // Create connector instance using factory
            const connector = await this.connectorFactory.createConnector(
                integrationConfig.protocol,
                {
                    id: integrationConfig.id,
                    name: integrationConfig.name,
                    baseUrl: (integrationConfig as any).baseUrl,
                    wsdlUrl: (integrationConfig as any).wsdlUrl,
                    webhookUrl: (integrationConfig as any).webhookUrl,
                    headers: (integrationConfig as any).headers
                }
            );

            // Register the connector in the registry
            this.connectorRegistry.registerConnector(connector);

        } catch (error) {
            logError('INTEGRATION_REGISTRATION_ERROR', (error as Error).message, {
                integrationId: integrationConfig.id,
                integrationName: integrationConfig.name,
                protocol: integrationConfig.protocol
            });
            handleError(error as Error, true);
        }
    }

    /**
     * Retrieves an integration connector by its protocol.
     * 
     * @param protocol - Protocol of the connector to retrieve
     * @returns The connector instance
     * @throws Error if connector is not found
     */
    public getIntegration(protocol: string): BaseConnector {
        try {
            return this.connectorRegistry.getConnector(protocol);
        } catch (error) {
            logError('INTEGRATION_RETRIEVAL_ERROR', (error as Error).message, {
                protocol
            });
            handleError(error as Error, true);
            throw error; // Re-throw after logging
        }
    }

    /**
     * Executes an integration connector with the provided configuration and payload.
     * 
     * @param protocol - Protocol of the connector to execute
     * @param payload - Data payload for the integration
     * @returns Result of the connector execution
     * @throws Error if execution fails
     */
    public async executeIntegration(
        protocol: string,
        payload: Record<string, unknown>
    ): Promise<unknown> {
        try {
            // Get the connector instance
            const connector = this.getIntegration(protocol);

            // Validate the connector
            const isValid = await connector.validate();
            if (!isValid) {
                throw new Error(`Connector validation failed for protocol: ${protocol}`);
            }

            // Execute the integration based on protocol type
            switch (protocol) {
                case 'REST':
                case 'HTTP':
                    return await (connector as any).sendRequest(
                        payload.endpoint as string,
                        payload.method as string,
                        payload.data
                    );

                case 'SOAP':
                    return await (connector as any).sendRequest(
                        payload.action as string,
                        payload.data
                    );

                case 'WebSocket':
                    return await (connector as any).processEvent(payload);

                default:
                    throw new Error(`Unsupported protocol: ${protocol}`);
            }

        } catch (error) {
            logError('INTEGRATION_EXECUTION_ERROR', (error as Error).message, {
                protocol,
                payload: JSON.stringify(payload)
            });
            handleError(error as Error);
            throw error;
        }
    }
}