/**
 * Human Tasks:
 * 1. Ensure the token expiration time aligns with your security requirements
 * 2. Review the token structure to ensure it meets your authentication provider's requirements
 */

/**
 * @fileoverview Authentication type definitions for the application
 * Requirement Addressed: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * Description: Defines the data structures required for managing authentication tokens, 
 * user credentials, and responses.
 */

/**
 * Represents an authentication token with its expiration date
 * @property token - The authentication token string
 * @property expiresAt - The expiration date and time of the token
 */
export type AuthToken = {
    /** The authentication token string */
    token: string;
    
    /** The expiration date and time of the token */
    expiresAt: Date;
};

/**
 * Type guard to check if an object is an AuthToken
 * @param obj - The object to check
 * @returns True if the object is an AuthToken
 */
export function isAuthToken(obj: any): obj is AuthToken {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.token === 'string' &&
        obj.expiresAt instanceof Date
    );
}