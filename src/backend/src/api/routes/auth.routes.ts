/**
 * Human Tasks:
 * 1. Configure JWT secret key in environment variables
 * 2. Set up proper JWT issuer and audience values in environment configuration
 * 3. Implement token rotation and revocation strategy
 * 4. Configure token expiration times based on security requirements
 * 5. Set up monitoring for authentication failures
 */

import { Router } from 'express'; // v4.18.2
import { register, login, verify } from '../controllers/auth.controller';
import { validateAuthToken } from '../validators/auth.validator';
import authMiddleware from '../middlewares/auth.middleware';
import { getAuthConfig } from '../../config/auth.config';

/**
 * Authentication routes configuration
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 */

// Initialize Express Router instance
const authRoutes = Router();

// Get authentication configuration
const authConfig = getAuthConfig();

/**
 * POST /auth/register
 * Handles user registration
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 */
authRoutes.post('/register', register);

/**
 * POST /auth/login
 * Handles user authentication and token generation
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 */
authRoutes.post('/login', login);

/**
 * GET /auth/verify
 * Verifies JWT token and returns decoded payload
 * Protected by authentication middleware
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 */
authRoutes.get('/verify', authMiddleware, verify);

// Export the configured router
export default authRoutes;