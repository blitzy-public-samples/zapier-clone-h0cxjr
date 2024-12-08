/**
 * Unit tests for the ConnectorFactory class
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Ensures the ConnectorFactory can dynamically create connector instances for seamless integration.
 * 
 * Human Tasks:
 * 1. Review test coverage and add additional test cases as needed
 * 2. Verify that mock configurations align with production settings
 * 3. Ensure error scenarios are properly tested
 */

// jest v29.0.0
import { ConnectorFactory } from '../../../src/core/integration/ConnectorFactory';
import { HttpConnector } from '../../../src/core/integration/connectors/HttpConnector';
import { RestConnector } from '../../../src/core/integration/connectors/RestConnector';
import { SoapConnector } from '../../../src/core/integration/connectors/SoapConnector';
import { WebhookConnector } from '../../../src/core/integration/connectors/WebhookConnector';
import { IntegrationType } from '../../../src/types/integration.types';

describe('ConnectorFactory', () => {
    let connectorFactory: ConnectorFactory;

    beforeEach(() => {
        connectorFactory = new ConnectorFactory();
    });

    describe('createConnector', () => {
        it('should create an HTTP connector with valid configuration', async () => {
            // Arrange
            const config = {
                id: 'http-connector-1',
                name: 'Test HTTP Connector',
                baseUrl: 'https://api.example.com',
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            };

            // Act
            const connector = await connectorFactory.createConnector('HTTP', config);

            // Assert
            expect(connector).toBeInstanceOf(HttpConnector);
            expect(connector.id).toBe(config.id);
            expect(connector.name).toBe(config.name);
            expect((connector as HttpConnector).baseUrl).toBe(config.baseUrl);
            expect((connector as HttpConnector).headers).toEqual(expect.objectContaining(config.headers));
        });

        it('should create a REST connector with valid configuration', async () => {
            // Arrange
            const config = {
                id: 'rest-connector-1',
                name: 'Test REST Connector',
                baseUrl: 'https://api.example.com/rest',
                headers: {
                    'Api-Key': 'test-api-key'
                }
            };

            // Act
            const connector = await connectorFactory.createConnector('REST', config);

            // Assert
            expect(connector).toBeInstanceOf(RestConnector);
            expect(connector.id).toBe(config.id);
            expect(connector.name).toBe(config.name);
            expect((connector as RestConnector).baseUrl).toBe(config.baseUrl);
            expect((connector as RestConnector).headers).toEqual(expect.objectContaining(config.headers));
        });

        it('should create a SOAP connector with valid configuration', async () => {
            // Arrange
            const config = {
                id: 'soap-connector-1',
                name: 'Test SOAP Connector',
                wsdlUrl: 'https://api.example.com/soap?wsdl'
            };

            // Act
            const connector = await connectorFactory.createConnector('SOAP', config);

            // Assert
            expect(connector).toBeInstanceOf(SoapConnector);
            expect(connector.id).toBe(config.id);
            expect(connector.name).toBe(config.name);
            expect((connector as SoapConnector).wsdlUrl).toBe(config.wsdlUrl);
        });

        it('should create a WebSocket connector with valid configuration', async () => {
            // Arrange
            const config = {
                id: 'webhook-connector-1',
                name: 'Test Webhook Connector',
                webhookUrl: 'https://api.example.com/webhook',
                headers: {
                    'Webhook-Secret': 'test-secret'
                }
            };

            // Act
            const connector = await connectorFactory.createConnector('WebSocket', config);

            // Assert
            expect(connector).toBeInstanceOf(WebhookConnector);
            expect(connector.id).toBe(config.id);
            expect(connector.name).toBe(config.name);
            expect((connector as WebhookConnector).webhookUrl).toBe(config.webhookUrl);
            expect((connector as WebhookConnector).headers).toEqual(expect.objectContaining(config.headers));
        });

        it('should throw error when creating connector with missing required configuration', async () => {
            // Arrange
            const config = {
                id: 'invalid-connector',
                name: 'Invalid Connector'
                // Missing required baseUrl
            };

            // Act & Assert
            await expect(connectorFactory.createConnector('HTTP', config))
                .rejects
                .toThrow('Base URL is required for HTTP connector');
        });

        it('should throw error when creating connector with invalid protocol', async () => {
            // Arrange
            const config = {
                id: 'test-connector',
                name: 'Test Connector',
                baseUrl: 'https://api.example.com'
            };

            // Act & Assert
            await expect(connectorFactory.createConnector('INVALID' as IntegrationType, config))
                .rejects
                .toThrow('Unsupported protocol: INVALID');
        });

        it('should throw error when creating connector without ID', async () => {
            // Arrange
            const config = {
                name: 'Test Connector',
                baseUrl: 'https://api.example.com'
            };

            // Act & Assert
            await expect(connectorFactory.createConnector('HTTP', config))
                .rejects
                .toThrow('Connector ID and name are required');
        });

        it('should throw error when creating connector without name', async () => {
            // Arrange
            const config = {
                id: 'test-connector',
                baseUrl: 'https://api.example.com'
            };

            // Act & Assert
            await expect(connectorFactory.createConnector('HTTP', config))
                .rejects
                .toThrow('Connector ID and name are required');
        });

        it('should validate created connector before returning', async () => {
            // Arrange
            const config = {
                id: 'http-connector-1',
                name: 'Test HTTP Connector',
                baseUrl: 'invalid-url' // Invalid URL format
            };

            // Act & Assert
            await expect(connectorFactory.createConnector('HTTP', config))
                .rejects
                .toThrow('Connector validation failed for protocol: HTTP');
        });
    });
});