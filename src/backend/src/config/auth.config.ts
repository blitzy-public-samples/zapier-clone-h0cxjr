/**
 * Human Tasks:
 * 1. Create and configure .env file with required authentication settings:
 *    - AUTH_SECRET: Secret key for JWT signing
 *    - AUTH_ISSUER: Token issuer identifier
 *    - AUTH_AUDIENCE: Token audience identifier
 * 2. Ensure proper key management and rotation procedures are in place
 * 3. Review and adjust authentication parameters based on deployment environment
 */

import { config } from 'dotenv'; // v16.0.3
import { SECURITY_ALGORITHM, JWT_EXPIRATION_TIME } from './security.config';
import { generateToken, validateToken } from '../core/security/JwtManager';

// Load environment variables
config();

/**
 * Authentication configuration interface defining the structure
 * of the authentication settings object
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 */
interface AuthConfig {
  jwt: {
    secret: string;
    issuer: string;
    audience: string;
    algorithm: string;
    expirationTime: number;
  };
}

/**
 * Retrieves the authentication configuration settings
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * Description: Defines configuration settings for secure authentication mechanisms, including JWT and OAuth.
 * 
 * @returns An object containing authentication configuration settings
 */
export const getAuthConfig = (): AuthConfig => {
  // Get environment variables or use default values
  const AUTH_SECRET = process.env.AUTH_SECRET || 'default-secret';
  const AUTH_ISSUER = process.env.AUTH_ISSUER || 'workflow-platform';
  const AUTH_AUDIENCE = process.env.AUTH_AUDIENCE || 'workflow-users';

  return {
    jwt: {
      secret: AUTH_SECRET,
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
      algorithm: SECURITY_ALGORITHM,
      expirationTime: JWT_EXPIRATION_TIME
    }
  };
};