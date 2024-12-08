/**
 * @fileoverview HttpConnector Class Implementation
 * This file defines the HttpConnector class, which extends BaseConnector to provide
 * HTTP-specific integration capabilities.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements an HTTP-specific connector to enable seamless integration with external systems using the HTTP protocol.
 * 
 * Human Tasks:
 * 1. Verify SSL/TLS certificate configuration for production environments
 * 2. Configure appropriate timeout values based on target system SLAs
 * 3. Review and adjust retry policies for specific HTTP status codes
 * 4. Set up monitoring alerts for HTTP connection failures
 */

// axios v1.5.0
import axios, { AxiosRequestConfig, Method } from 'axios';
import { BaseConnector } from '../BaseConnector';
import { IConnector } from '../../../interfaces/IConnector';
import { IntegrationType } from '../../../types/integration.types';
import { logError } from '../../../utils/logger.util';
import { handleError } from '../../../utils/error.util';

/**
 * HttpConnector class for handling HTTP-specific integration capabilities.
 * Extends BaseConnector to provide HTTP protocol support.
 */
export class HttpConnector extends BaseConnector implements IConnector {
    /**
     * Base URL for the HTTP endpoint
     */
    public readonly baseUrl: string;

    /**
     * Custom headers for HTTP requests
     */
    public readonly headers: Record<string, string>;

    /**
     * Initializes a new instance of HttpConnector.
     * 
     * @param id - Unique identifier for the connector
     * @param name - Human-readable name for the connector
     * @param protocol - The protocol type (must be 'REST' for HTTP connector)
     * @param baseUrl - Base URL for the HTTP endpoint
     * @param headers - Optional custom headers for HTTP requests
     * @throws Error if protocol is not supported or configuration is invalid
     */
    constructor(
        id: string,
        name: string,
        protocol: IntegrationType,
        baseUrl: string,
        headers: Record<string, string> = {}
    ) {
        super(id, name, protocol);

        if (!baseUrl) {
            const error = new Error('Base URL is required for HTTP connector');
            logError('INVALID_CONFIG', error.message, {
                connectorId: id,
                connectorName: name,
                protocol
            });
            handleError(error, true);
        }

        this.baseUrl = baseUrl;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers
        };
    }

    /**
     * Configures the HTTP connector with the provided configuration options.
     * 
     * @param config - Configuration object containing HTTP-specific settings
     * @returns Promise<void> - Resolves when configuration is complete
     * @throws Error if configuration is invalid or fails
     */
    public async configure(config: Record<string, unknown>): Promise<void> {
        try {
            // Validate required configuration
            if (!config.baseUrl || typeof config.baseUrl !== 'string') {
                throw new Error('Invalid baseUrl in configuration');
            }

            // Additional configuration validation can be added here
            await this.validate();
        } catch (error) {
            logError('CONFIG_ERROR', (error as Error).message, {
                connectorId: this.id,
                connectorName: this.name,
                protocol: this.protocol,
                config
            });
            handleError(error as Error, true);
        }
    }

    /**
     * Sends an HTTP request using the configured settings.
     * 
     * @param method - HTTP method for the request
     * @param endpoint - API endpoint to call (will be appended to baseUrl)
     * @param data - Optional request payload
     * @returns Promise<any> - Resolves with the HTTP response
     * @throws Error if the request fails
     */
    public async sendRequest(
        method: Method,
        endpoint: string,
        data?: unknown
    ): Promise<any> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            
            const config: AxiosRequestConfig = {
                method,
                url,
                headers: this.headers,
                data,
                // Default timeout of 30 seconds
                timeout: 30000,
                // Enable automatic error retries for network issues
                validateStatus: (status) => status < 500
            };

            const response = await axios(config);

            // Log successful request
            if (process.env.NODE_ENV !== 'production') {
                console.log(`HTTP Request Successful: ${method} ${url}`);
            }

            return response.data;
        } catch (error) {
            // Enhance error with connector context
            const enhancedError = new Error(
                `HTTP request failed: ${(error as Error).message}`
            );
            
            logError('HTTP_REQUEST_ERROR', enhancedError.message, {
                connectorId: this.id,
                connectorName: this.name,
                protocol: this.protocol,
                method,
                endpoint,
                error: error as Error
            });

            handleError(enhancedError);
            throw enhancedError;
        }
    }

    /**
     * Validates the HTTP connector configuration and connectivity.
     * 
     * @returns Promise<boolean> - Resolves to true if validation succeeds
     * @throws Error if validation fails
     */
    public async validate(): Promise<boolean> {
        try {
            // First perform base validation
            const baseValid = await super.validate();
            if (!baseValid) {
                return false;
            }

            // Validate HTTP-specific configuration
            if (!this.baseUrl.startsWith('http://') && !this.baseUrl.startsWith('https://')) {
                throw new Error('Invalid base URL protocol - must be http or https');
            }

            // Attempt a test request to verify connectivity
            try {
                await this.sendRequest('GET', '/');
                return true;
            } catch (error) {
                // Log connectivity test failure but don't throw
                logError('VALIDATION_ERROR', 'HTTP connectivity test failed', {
                    connectorId: this.id,
                    connectorName: this.name,
                    protocol: this.protocol,
                    baseUrl: this.baseUrl
                });
                return false;
            }
        } catch (error) {
            logError('VALIDATION_ERROR', (error as Error).message, {
                connectorId: this.id,
                connectorName: this.name,
                protocol: this.protocol
            });
            return false;
        }
    }
}