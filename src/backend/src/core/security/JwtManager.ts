/**
 * Human Tasks:
 * 1. Configure JWT secret key in environment variables
 * 2. Set up proper JWT issuer and audience values in environment configuration
 * 3. Implement token rotation and revocation strategy
 * 4. Configure token expiration times based on security requirements
 * 5. Set up monitoring for token validation failures
 */

import { encryptData, decryptData } from '../../utils/encryption.util';
import { ERROR_CODES } from '../../constants/error.constants';
import { AuthToken } from '../../types/auth.types';
import jwt from 'jsonwebtoken'; // v9.0.0

// JWT Configuration Constants
const AUTH_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const AUTH_ISSUER = process.env.JWT_ISSUER || 'your-application';
const AUTH_AUDIENCE = process.env.JWT_AUDIENCE || 'your-api';

// JWT Options
const JWT_OPTIONS = {
  issuer: AUTH_ISSUER,
  audience: AUTH_AUDIENCE,
  expiresIn: '1h', // Token expiration time
  algorithm: 'HS256' as const
};

/**
 * Generates a JSON Web Token (JWT) for authentication purposes
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param payload - The data to be encoded in the token
 * @returns A signed JWT string
 * @throws Error if token generation fails
 */
export const generateToken = (payload: Record<string, any>): string => {
  try {
    // Encrypt sensitive data in the payload if needed
    const sensitiveData = payload.sensitiveInfo ? 
      encryptData(JSON.stringify(payload.sensitiveInfo), AUTH_SECRET) : 
      undefined;

    const tokenPayload = {
      ...payload,
      sensitiveInfo: sensitiveData,
      iat: Math.floor(Date.now() / 1000)
    };

    // Sign the token with the secret key and options
    const token = jwt.sign(
      tokenPayload,
      AUTH_SECRET,
      JWT_OPTIONS
    );

    return token;
  } catch (error) {
    throw new Error(
      `${ERROR_CODES.InternalServerError}: Failed to generate token - ${(error as Error).message}`
    );
  }
};

/**
 * Validates a JSON Web Token (JWT) to ensure its authenticity and integrity
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param token - The JWT string to validate
 * @returns The decoded payload if the token is valid
 * @throws Error if token validation fails
 */
export const validateToken = (token: string): Record<string, any> => {
  try {
    // Verify the token with the secret key and options
    const decoded = jwt.verify(token, AUTH_SECRET, {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
      algorithms: ['HS256']
    }) as Record<string, any>;

    // Decrypt sensitive data if present
    if (decoded.sensitiveInfo) {
      decoded.sensitiveInfo = JSON.parse(
        decryptData(decoded.sensitiveInfo, AUTH_SECRET)
      );
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(
        `${ERROR_CODES.AuthenticationError}: Invalid token - ${error.message}`
      );
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(
        `${ERROR_CODES.AuthenticationError}: Token expired`
      );
    }
    throw new Error(
      `${ERROR_CODES.InternalServerError}: Token validation failed - ${(error as Error).message}`
    );
  }
};

/**
 * Decodes a JSON Web Token (JWT) without verifying its signature
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param token - The JWT string to decode
 * @returns The decoded payload of the token
 * @throws Error if token decoding fails
 */
export const decodeToken = (token: string): Record<string, any> => {
  try {
    // Decode the token without verification
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      throw new Error('Invalid token format');
    }

    return decoded.payload as Record<string, any>;
  } catch (error) {
    throw new Error(
      `${ERROR_CODES.InternalServerError}: Failed to decode token - ${(error as Error).message}`
    );
  }
};