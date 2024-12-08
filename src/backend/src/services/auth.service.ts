/**
 * Human Tasks:
 * 1. Configure JWT secret key in environment variables
 * 2. Set up proper JWT issuer and audience values in environment configuration
 * 3. Implement token rotation and revocation strategy
 * 4. Configure token expiration times based on security requirements
 * 5. Set up monitoring for authentication failures
 */

// bcrypt v5.1.0
import bcrypt from 'bcrypt';
import { getAuthConfig } from '../config/auth.config';
import { encryptData, decryptData } from '../utils/encryption.util';
import { generateToken, validateToken } from '../core/security/JwtManager';
import { User } from '../database/models/User';
import { handleError } from '../utils/error.util';

/**
 * Registers a new user in the system
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param userData - Object containing user registration data
 * @returns The newly created user object
 * @throws Error if registration fails
 */
export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}): Promise<User> => {
  try {
    // Validate user data
    if (!userData.email || !userData.password || !userData.username) {
      throw new Error('Missing required user registration fields');
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Encrypt sensitive data
    const encryptedPassword = encryptData(hashedPassword);

    // Create new user record
    const user = await User.create({
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: encryptedPassword,
      roles: userData.roles || ['user'] // Default role
    });

    // Remove sensitive data before returning
    const userResponse = user.toJSON();
    delete userResponse.password;

    return userResponse;
  } catch (error) {
    handleError(error, true);
    throw error;
  }
};

/**
 * Authenticates a user and generates a JWT token
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Object containing user details and JWT token
 * @throws Error if authentication fails
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Partial<User>; token: string }> => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: ['roles', 'permissions'] // Include role and permission associations
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const authConfig = getAuthConfig();
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
      permissions: user.permissions?.map(permission => permission.name) || []
    };

    const token = generateToken(tokenPayload);

    // Prepare user response without sensitive data
    const userResponse = user.toJSON();
    delete userResponse.password;

    return {
      user: userResponse,
      token
    };
  } catch (error) {
    handleError(error, true);
    throw error;
  }
};

/**
 * Verifies a JWT token's authenticity and validity
 * Technical Specification Reference: Role-Based Access Control (RBAC)
 * Location: Technical Specification/Security Considerations/Authorization Model
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyToken = async (token: string): Promise<Record<string, any>> => {
  try {
    // Validate token using JwtManager
    const decodedToken = validateToken(token);

    // Verify user still exists and has required permissions
    const user = await User.findByPk(decodedToken.userId, {
      include: ['roles', 'permissions']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return decoded token with user context
    return {
      ...decodedToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles?.map(role => role.name) || [],
        permissions: user.permissions?.map(permission => permission.name) || []
      }
    };
  } catch (error) {
    handleError(error, true);
    throw error;
  }
};