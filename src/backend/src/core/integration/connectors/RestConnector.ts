/**
 * @fileoverview RestConnector Class Implementation
 * This file defines the RestConnector class for handling RESTful API integrations.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements a REST connector to enable seamless integration with RESTful APIs, including
 *   request handling, response parsing, and error management.
 * 
 * Human Tasks:
 * 1. Verify SSL certificate validation settings in production environment
 * 2. Configure appropriate timeout values based on target API SLAs
 * 3. Review and adjust retry policies for specific REST endpoints
 * 4. Set up monitoring alerts for REST API connection failures
 */

// Internal imports with relative paths
import { BaseConnector } from '../BaseConnector';
import { IConnector } from '../../interfaces/IConnector';
import { logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { IntegrationType } from '../../types/integration.types';

// External imports with versions
// axios v1.5.0
import axios, { AxiosRequestConfig, Method } from 'axios';

/**
 * RestConnector class for handling RESTful API integrations.
 * Extends BaseConnector to provide REST-specific functionality.
 */
export class RestConnector extends BaseConnector implements IConnector {
    /**
     * Base URL for the REST API
     */
    public readonly baseUrl: string;

    /**
     * Default headers for REST requests
     */
    public readonly headers: Record<string, string>;

    /**
     * Initializes a new instance of the RestConnector class.
     * 
     * @param id - Unique identifier for the connector instance
     * @param name - Human-readable name for the connector
     * @param protocol - The protocol used by this connector (must be REST)
     * @param baseUrl - Base URL for the REST API
     * @param headers - Default headers for REST requests
     */
    constructor(
        id: string,
        name: string,
        protocol: IntegrationType,
        baseUrl: string,
        headers: Record<string, string> = {}
    ) {
        // Call parent constructor with basic connector information
        super(id, name, protocol);

        // Validate and assign the base URL
        if (!baseUrl) {
            const error = new Error('Base URL is required for REST connector');
            logError('INVALID_CONFIG', error.message, {
                connectorId: id,
                connectorName: name,
                protocol
            });
            handleError(error, true);
        }

        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers
        };
    }

    /**
     * Configures the REST connector with the provided configuration.
     * Implements the abstract configure method from BaseConnector.
     * 
     * @param config - Configuration object containing REST-specific settings
     */
    public async configure(config: Record<string, unknown>): Promise<void> {
        try {
            // Validate configuration
            if (!config) {
                throw new Error('Configuration is required for REST connector');
            }

            // Additional configuration logic can be added here
            await this.validate();
        } catch (error) {
            logError('CONFIG_ERROR', (error as Error).message, {
                connectorId: this.id,
                connectorName: this.name,
                protocol: this.protocol
            });
            handleError(error as Error, true);
        }
    }

    /**
     * Sends an HTTP request to the specified endpoint with the given configuration.
     * 
     * @param endpoint - The API endpoint to send the request to
     * @param method - The HTTP method to use for the request
     * @param data - The data to send with the request (for POST, PUT, PATCH)
     * @param customHeaders - Additional headers to merge with default headers
     * @returns Promise resolving to the response data
     * @throws Error if the request fails
     */
    public async sendRequest<T = any>(
        endpoint: string,
        method: Method,
        data?: Record<string, unknown>,
        customHeaders?: Record<string, string>
    ): Promise<T> {
        try {
            // Construct the full URL
            const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

            // Prepare request configuration
            const config: AxiosRequestConfig = {
                method,
                url,
                headers: {
                    ...this.headers,
                    ...customHeaders
                },
                validateStatus: (status) => status >= 200 && status < 300
            };

            // Add data to request if provided
            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                config.data = data;
            }

            // Send the request
            const response = await axios.request<T>(config);

            return response.data;
        } catch (error) {
            // Log the error with context
            logError('REQUEST_ERROR', (error as Error).message, {
                connectorId: this.id,
                connectorName: this.name,
                protocol: this.protocol,
                endpoint,
                method,
                baseUrl: this.baseUrl
            });

            // Handle the error
            handleError(error as Error);

            // Re-throw the error for the caller to handle
            throw error;
        }
    }
}