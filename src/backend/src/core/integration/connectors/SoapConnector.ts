/**
 * @fileoverview SoapConnector Implementation
 * This file implements the SOAP-specific connector for integrating with SOAP-based services.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements a SOAP-specific connector to enable integration with SOAP-based external services.
 * 
 * Human Tasks:
 * 1. Ensure WSDL endpoints are accessible from the deployment environment
 * 2. Configure appropriate timeouts based on SOAP service SLAs
 * 3. Set up SSL certificates if required for secure SOAP connections
 * 4. Review and adjust SOAP client security settings for production
 */

// soap v0.42.0
import { Client, createClientAsync } from 'soap';
import { BaseConnector } from '../BaseConnector';
import { IConnector } from '../../../interfaces/IConnector';
import { logError } from '../../../utils/logger.util';
import { handleError } from '../../../utils/error.util';
import { IntegrationType } from '../../../types/integration.types';

/**
 * SoapConnector class for handling SOAP-based integrations.
 * Extends BaseConnector to provide SOAP-specific functionality.
 */
export class SoapConnector extends BaseConnector implements IConnector {
    /**
     * The WSDL URL for the SOAP service
     */
    public readonly wsdlUrl: string;

    /**
     * The SOAP client instance
     */
    private client: Client | null = null;

    /**
     * Initializes a new instance of the SoapConnector class.
     * 
     * @param id - Unique identifier for the connector
     * @param name - Human-readable name for the connector
     * @param protocol - Must be 'SOAP' for this connector
     * @param wsdlUrl - URL to the WSDL document
     */
    constructor(
        id: string,
        name: string,
        protocol: IntegrationType,
        wsdlUrl: string
    ) {
        super(id, name, protocol);
        this.wsdlUrl = wsdlUrl;
    }

    /**
     * Configures the SOAP connector with the provided settings.
     * 
     * @param config - Configuration object containing SOAP-specific settings
     * @throws Error if configuration is invalid or client initialization fails
     */
    public async configure(config: Record<string, unknown>): Promise<void> {
        try {
            // Validate configuration before proceeding
            await this.validate();

            // Initialize SOAP client with the WSDL URL and configuration
            this.client = await createClientAsync(this.wsdlUrl, {
                // Apply default SOAP client options
                disableCache: true,
                forceSoap12: false,
                ...config,
                // Ensure proper error handling
                returnFault: true
            });

        } catch (error) {
            logError('SOAP_CLIENT_INIT_ERROR', 'Failed to initialize SOAP client', {
                connectorId: this.id,
                wsdlUrl: this.wsdlUrl,
                error: (error as Error).message
            });
            handleError(error as Error, true);
        }
    }

    /**
     * Validates the SOAP connector configuration.
     * 
     * @returns Promise<boolean> indicating whether the configuration is valid
     */
    public async validate(): Promise<boolean> {
        try {
            // Validate base connector configuration
            const isBaseValid = await super.validate();
            if (!isBaseValid) {
                return false;
            }

            // Validate SOAP-specific configuration
            if (!this.wsdlUrl) {
                logError('INVALID_WSDL_URL', 'WSDL URL is required', {
                    connectorId: this.id,
                    connectorName: this.name
                });
                return false;
            }

            // Validate protocol is SOAP
            if (this.protocol !== 'SOAP') {
                logError('INVALID_PROTOCOL', 'Protocol must be SOAP for SoapConnector', {
                    connectorId: this.id,
                    connectorName: this.name,
                    protocol: this.protocol
                });
                return false;
            }

            return true;
        } catch (error) {
            handleError(error as Error);
            return false;
        }
    }

    /**
     * Sends a SOAP request to the configured endpoint.
     * 
     * @param action - The SOAP action/operation to invoke
     * @param payload - The request payload for the SOAP operation
     * @returns Promise with the SOAP service response
     * @throws Error if client is not initialized or request fails
     */
    public async sendRequest(action: string, payload: Record<string, unknown>): Promise<unknown> {
        try {
            if (!this.client) {
                throw new Error('SOAP client not initialized. Call configure() first.');
            }

            if (!action) {
                throw new Error('SOAP action is required');
            }

            // Ensure the action exists on the client
            if (!(action in this.client)) {
                throw new Error(`Invalid SOAP action: ${action}`);
            }

            // Get the operation function from the client
            const operation = this.client[action] as Function;

            // Execute the SOAP request
            const [result] = await operation(payload);
            return result;

        } catch (error) {
            logError('SOAP_REQUEST_ERROR', 'Failed to execute SOAP request', {
                connectorId: this.id,
                action,
                error: (error as Error).message,
                payload
            });
            handleError(error as Error, true);
        }
    }
}