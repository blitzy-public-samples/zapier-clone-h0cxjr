/**
 * @fileoverview Integration Constants
 * This file defines constants related to integration configurations, including
 * supported protocols and default settings.
 * 
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Provides constants for managing integration configurations, including supported protocols and default settings.
 */

/**
 * List of supported integration protocols.
 * These protocols are validated during integration configuration setup.
 */
export const SUPPORTED_PROTOCOLS = ['REST', 'SOAP', 'GraphQL', 'WebSocket'] as const;