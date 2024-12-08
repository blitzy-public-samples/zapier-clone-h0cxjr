/**
 * @fileoverview Integration Routes Implementation
 * Defines API routes for managing integration connectors, including registration,
 * retrieval, and execution of connectors.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements API routes for managing integration connectors, enabling seamless integration
 *   with external systems.
 * 
 * Human Tasks:
 * 1. Review and adjust rate limiting settings for integration endpoints
 * 2. Configure monitoring alerts for integration failures
 * 3. Verify security settings for integration endpoints
 * 4. Set up proper error tracking for integration route failures
 */

// express v4.18.2
import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';
import { validateIntegrationConfig } from '../validators/integration.validator';

/**
 * Defines the API routes for managing integration connectors.
 * Addresses requirement: Integration Capabilities
 * 
 * @param router - Express Router instance
 * @returns The configured router instance with integration routes
 */
const defineRoutes = (router: Router): Router => {
    // Initialize the integration controller
    const integrationController = new IntegrationController();

    // Route: Register a new integration connector
    // POST /integrations/register
    router.post(
        '/integrations/register',
        authMiddleware,
        validationMiddleware,
        integrationController.registerIntegration
    );

    // Route: Get integration connector by protocol
    // GET /integrations/:protocol
    router.get(
        '/integrations/:protocol',
        authMiddleware,
        integrationController.getIntegration
    );

    // Route: Execute an integration connector
    // POST /integrations/execute
    router.post(
        '/integrations/execute',
        authMiddleware,
        validationMiddleware,
        integrationController.executeIntegration
    );

    return router;
};

// Create and configure the router instance
const integrationRoutes = defineRoutes(Router());

// Export the configured router
export default integrationRoutes;