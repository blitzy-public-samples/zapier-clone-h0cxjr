/**
 * Human Tasks:
 * 1. Configure JWT secret key in environment variables
 * 2. Set up proper JWT issuer and audience values in environment configuration
 * 3. Implement token rotation and revocation strategy
 * 4. Configure token expiration times based on security requirements
 * 5. Set up monitoring for authentication failures
 */

import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../../core/security/JwtManager';
import { PermissionManager } from '../../core/security/PermissionManager';
import { handleError } from '../../utils/error.util';
import { validateAuthToken } from '../../api/validators/auth.validator';
import jwt from 'jsonwebtoken'; // v9.0.0

// Initialize PermissionManager instance
const permissionManager = new PermissionManager();

/**
 * Express middleware for handling authentication and authorization
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No token provided or invalid token format');
        }

        const token = authHeader.split(' ')[1];

        // Validate token format and expiration
        validateAuthToken({
            token,
            expiresAt: new Date(jwt.decode(token)?.exp! * 1000)
        });

        // Validate token authenticity and decode payload
        const decodedToken = validateToken(token);

        // Validate user permissions if endpoint requires specific permissions
        if (req.baseUrl && req.method) {
            const requiredPermission = `${req.baseUrl.replace(/^\//, '')}:${req.method.toLowerCase()}`;
            const hasPermission = await permissionManager.validateUserPermission(
                decodedToken.userId,
                requiredPermission
            );

            if (!hasPermission) {
                throw new Error('Insufficient permissions to access this resource');
            }
        }

        // Attach user information to request object for downstream use
        req.user = {
            id: decodedToken.userId,
            roles: decodedToken.roles,
            permissions: decodedToken.permissions
        };

        next();
    } catch (error) {
        handleError(error, false);
        
        // Send appropriate error response
        const statusCode = error.message.includes('expired') ? 401 :
                         error.message.includes('permissions') ? 403 : 
                         400;
        
        res.status(statusCode).json({
            error: {
                message: error.message,
                code: statusCode === 401 ? 'TOKEN_EXPIRED' :
                      statusCode === 403 ? 'INSUFFICIENT_PERMISSIONS' :
                      'INVALID_TOKEN'
            }
        });
    }
};

export default authMiddleware;