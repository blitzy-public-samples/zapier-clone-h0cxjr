/**
 * Human Tasks:
 * 1. Review token validation rules to ensure they align with your security requirements
 * 2. Configure appropriate token expiration thresholds based on your security policies
 * 3. Ensure error messages are properly localized according to your application's standards
 */

/**
 * @fileoverview Authentication validator implementation
 * Requirement Addressed: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * Description: Implements validation mechanisms to ensure the integrity and correctness of 
 * authentication-related data, such as user credentials and tokens.
 */

import { AuthToken } from '../../types/auth.types';
import { validateWorkflow } from '../../utils/validation.util';
import { ERROR_CODES } from '../../constants/error.constants';

/**
 * Validates an authentication token to ensure it adheres to predefined constraints
 * Requirement Addressed: Authentication Management - Token Validation
 * 
 * @param authToken - The authentication token object to validate
 * @returns true if the token is valid
 * @throws Error with ValidationError code if validation fails
 */
export const validateAuthToken = (authToken: AuthToken): boolean => {
    // Validate token object existence
    if (!authToken) {
        throw new Error(`${ERROR_CODES.ValidationError}: Authentication token is required`);
    }

    // Validate token string
    if (!authToken.token || typeof authToken.token !== 'string') {
        throw new Error(`${ERROR_CODES.ValidationError}: Token must be a non-empty string`);
    }

    if (authToken.token.trim().length === 0) {
        throw new Error(`${ERROR_CODES.ValidationError}: Token cannot be empty or contain only whitespace`);
    }

    // Validate minimum token length for security (assuming JWT format)
    // JWT tokens are typically at least 100 characters long
    if (authToken.token.length < 100) {
        throw new Error(`${ERROR_CODES.ValidationError}: Token length is insufficient`);
    }

    // Validate token expiration
    if (!(authToken.expiresAt instanceof Date)) {
        throw new Error(`${ERROR_CODES.ValidationError}: Token expiration must be a valid Date object`);
    }

    if (isNaN(authToken.expiresAt.getTime())) {
        throw new Error(`${ERROR_CODES.ValidationError}: Token expiration date is invalid`);
    }

    // Check if token is expired
    const currentTime = new Date();
    if (authToken.expiresAt <= currentTime) {
        throw new Error(`${ERROR_CODES.ValidationError}: Token has expired`);
    }

    // Check if expiration is too far in the future (max 24 hours from current time)
    const maxExpirationTime = new Date(currentTime.getTime() + (24 * 60 * 60 * 1000));
    if (authToken.expiresAt > maxExpirationTime) {
        throw new Error(`${ERROR_CODES.ValidationError}: Token expiration cannot exceed 24 hours`);
    }

    // Validate token format (assuming JWT format)
    const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;
    if (!jwtRegex.test(authToken.token)) {
        throw new Error(`${ERROR_CODES.ValidationError}: Invalid token format`);
    }

    return true;
};