/**
 * Human Tasks:
 * 1. Configure JWT secret key in environment variables
 * 2. Set up proper JWT issuer and audience values in environment configuration
 * 3. Implement token rotation and revocation strategy
 * 4. Configure token expiration times based on security requirements
 * 5. Set up monitoring for authentication failures
 */

import { Request, Response } from 'express';
import { validateAuthToken } from '../validators/auth.validator';
import { registerUser, loginUser, verifyToken } from '../../services/auth.service';
import authMiddleware from '../middlewares/auth.middleware';
import { handleError } from '../../utils/error.util';
import { logInfo } from '../../utils/logger.util';

/**
 * Handles user registration
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract user registration data from request body
        const { username, email, password, roles } = req.body;

        // Log registration attempt
        logInfo('User registration attempt', { email, username });

        // Register the user using auth service
        const user = await registerUser({
            username,
            email,
            password,
            roles
        });

        // Log successful registration
        logInfo('User registration successful', {
            userId: user.id,
            email: user.email
        });

        // Send success response
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles
            }
        });
    } catch (error) {
        // Handle and log error
        handleError(error, false);
        
        // Send appropriate error response
        res.status(400).json({
            error: {
                message: error.message,
                code: 'REGISTRATION_ERROR'
            }
        });
    }
};

/**
 * Handles user login
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract login credentials from request body
        const { email, password } = req.body;

        // Log login attempt
        logInfo('User login attempt', { email });

        // Authenticate user and generate token
        const { user, token } = await loginUser(email, password);

        // Create token object for validation
        const authToken = {
            token,
            expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours from now
        };

        // Validate generated token
        validateAuthToken(authToken);

        // Log successful login
        logInfo('User login successful', {
            userId: user.id,
            email: user.email
        });

        // Send success response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles
            }
        });
    } catch (error) {
        // Handle and log error
        handleError(error, false);
        
        // Send appropriate error response
        res.status(401).json({
            error: {
                message: error.message,
                code: 'AUTHENTICATION_ERROR'
            }
        });
    }
};

/**
 * Verifies a JWT token and returns the decoded payload
 * Technical Specification Reference: Role-Based Access Control (RBAC)
 * Location: Technical Specification/Security Considerations/Authorization Model
 * 
 * @param req - Express request object containing the token
 * @param res - Express response object
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No token provided or invalid token format');
        }

        const token = authHeader.split(' ')[1];

        // Log token verification attempt
        logInfo('Token verification attempt');

        // Verify the token
        const decodedToken = await verifyToken(token);

        // Log successful verification
        logInfo('Token verification successful', {
            userId: decodedToken.user.id
        });

        // Send success response
        res.status(200).json({
            message: 'Token is valid',
            decoded: {
                user: {
                    id: decodedToken.user.id,
                    email: decodedToken.user.email,
                    roles: decodedToken.user.roles,
                    permissions: decodedToken.user.permissions
                }
            }
        });
    } catch (error) {
        // Handle and log error
        handleError(error, false);
        
        // Send appropriate error response
        res.status(401).json({
            error: {
                message: error.message,
                code: 'TOKEN_VERIFICATION_ERROR'
            }
        });
    }
};