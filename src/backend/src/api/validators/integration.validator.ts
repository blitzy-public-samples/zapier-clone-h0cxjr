/**
 * @fileoverview Integration Configuration Validator
 * This file provides validation logic for integration configurations, ensuring that
 * incoming requests adhere to predefined constraints and supported protocols.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements validation mechanisms to ensure integration configurations adhere to supported protocols and constraints.
 * 
 * Human Tasks:
 * 1. Review and adjust validation thresholds based on specific integration requirements
 * 2. Ensure error messages are aligned with the application's localization strategy
 * 3. Update validation rules when new protocols are added to SUPPORTED_PROTOCOLS
 */

import { IIntegration } from '../../interfaces/IIntegration';
import { SUPPORTED_PROTOCOLS } from '../../constants/integration.constants';
import { validateIntegration } from '../../utils/validation.util';

/**
 * Validates an integration configuration object to ensure it adheres to predefined constraints.
 * This function serves as a high-level validator that combines multiple validation checks
 * to ensure the integration configuration is valid and supported by the system.
 * 
 * @param integration - The integration configuration object to validate
 * @returns true if the integration configuration is valid
 * @throws Error if validation fails with a descriptive message
 */
export const validateIntegrationConfig = (integration: IIntegration): boolean => {
    try {
        // First, perform comprehensive validation using the utility function
        validateIntegration(integration);

        // Extract protocol for additional validation if needed
        const { protocol } = integration;

        // Double-check protocol support (although validateIntegration already checks this,
        // we keep this for explicit protocol-specific validation that might be added in the future)
        if (!SUPPORTED_PROTOCOLS.includes(protocol)) {
            throw new Error(
                `Unsupported integration protocol: ${protocol}. ` +
                `Supported protocols are: ${SUPPORTED_PROTOCOLS.join(', ')}`
            );
        }

        // Additional protocol-specific validation can be added here as the system evolves
        // For example, specific validation rules for REST vs GraphQL integrations

        return true;
    } catch (error) {
        // Re-throw the error to maintain the error chain
        throw error;
    }
}