/**
 * @fileoverview Integration Controller Implementation
 * This file implements the IntegrationController class, which provides API endpoints
 * for managing integration connectors.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements API endpoints for managing integration connectors, enabling seamless integration
 *   with external systems.
 * 
 * Human Tasks:
 * 1. Review and adjust error handling strategies for production environment
 * 2. Configure rate limiting for integration endpoints
 * 3. Set up monitoring alerts for integration failures
 * 4. Verify security settings for integration endpoints
 */

import { IntegrationService } from '../../services/integration.service';
import { validateIntegrationConfig } from '../validators/integration.validator';
import { logError } from '../../utils/logger.util';
import { handleError } from '../../utils/error.util';
import { Request, Response } from 'express';

/**
 * Controller class for managing API endpoints related to integration connectors.
 * Provides endpoints for registering, retrieving, and executing integration connectors.
 */
export class IntegrationController {
    private readonly integrationService: IntegrationService;

    /**
     * Initializes a new instance of IntegrationController.
     * Sets up the integration service instance.
     */
    constructor() {
        this.integrationService = new IntegrationService();
    }

    /**
     * API endpoint to register a new integration connector.
     * Validates the integration configuration before registration.
     * 
     * @param req - Express request object containing integration configuration
     * @param res - Express response object
     */
    public async registerIntegration(req: Request, res: Response): Promise<void> {
        try {
            const integrationConfig = req.body;

            // Validate integration configuration
            validateIntegrationConfig(integrationConfig);

            // Register the integration
            await this.integrationService.registerIntegration(integrationConfig);

            // Send success response
            res.status(201).json({
                success: true,
                message: 'Integration registered successfully',
                data: {
                    id: integrationConfig.id,
                    name: integrationConfig.name,
                    protocol: integrationConfig.protocol
                }
            });
        } catch (error) {
            // Log and handle the error
            logError('INTEGRATION_REGISTRATION_ERROR', (error as Error).message, {
                config: req.body
            });
            handleError(error as Error);

            // Send error response
            res.status(400).json({
                success: false,
                error: (error as Error).message
            });
        }
    }

    /**
     * API endpoint to retrieve an integration connector by its protocol.
     * 
     * @param req - Express request object containing protocol parameter
     * @param res - Express response object
     */
    public async getIntegration(req: Request, res: Response): Promise<void> {
        try {
            const { protocol } = req.params;

            if (!protocol) {
                throw new Error('Protocol parameter is required');
            }

            // Retrieve the integration
            const integration = this.integrationService.getIntegration(protocol);

            // Send success response
            res.status(200).json({
                success: true,
                data: integration
            });
        } catch (error) {
            // Log and handle the error
            logError('INTEGRATION_RETRIEVAL_ERROR', (error as Error).message, {
                protocol: req.params.protocol
            });
            handleError(error as Error);

            // Send error response
            res.status(404).json({
                success: false,
                error: (error as Error).message
            });
        }
    }

    /**
     * API endpoint to execute an integration connector with a given payload.
     * 
     * @param req - Express request object containing protocol and payload
     * @param res - Express response object
     */
    public async executeIntegration(req: Request, res: Response): Promise<void> {
        try {
            const { protocol, payload } = req.body;

            if (!protocol) {
                throw new Error('Protocol is required');
            }

            if (!payload || typeof payload !== 'object') {
                throw new Error('Valid payload object is required');
            }

            // Execute the integration
            const result = await this.integrationService.executeIntegration(
                protocol,
                payload
            );

            // Send success response
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            // Log and handle the error
            logError('INTEGRATION_EXECUTION_ERROR', (error as Error).message, {
                protocol: req.body.protocol,
                payload: req.body.payload
            });
            handleError(error as Error);

            // Send error response
            res.status(500).json({
                success: false,
                error: (error as Error).message
            });
        }
    }
}