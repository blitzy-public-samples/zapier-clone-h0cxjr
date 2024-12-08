/**
 * Human Tasks:
 * 1. Create and configure .env file with required security settings:
 *    - JWT_SECRET: Secret key for JWT token signing
 *    - JWT_EXPIRATION: Token expiration time in seconds (default: 3600)
 *    - SECURITY_ALGORITHM: Encryption algorithm (default: AES-256-GCM)
 *    - RBAC_ENABLED: Enable/disable RBAC (default: true)
 * 2. Ensure proper key management and rotation procedures are in place
 * 3. Verify SSL/TLS certificates are properly configured
 * 4. Review and adjust security parameters based on deployment environment
 */

import { config } from 'dotenv'; // v16.0.3
import { Role } from '../database/models/Role';
import { Permission } from '../database/models/Permission';

// Load environment variables
config();

/**
 * Security configuration interface defining the structure
 * of the security settings object
 * Technical Specification Reference: Security Features
 */
interface SecurityConfig {
  encryption: {
    algorithm: string;
    keySize: number;
    ivSize: number;
  };
  jwt: {
    expirationTime: number;
    algorithm: string;
  };
  rbac: {
    enabled: boolean;
    cacheTimeout: number;
  };
}

/**
 * RoleManager class for handling role-based access control operations
 * Technical Specification Reference: Security Features - Role-based access control
 */
class RoleManager {
  constructor() {}

  /**
   * Assigns a permission to a role
   * @param roleId - The ID of the role
   * @param permissionId - The ID of the permission to assign
   * @returns Promise<boolean> indicating success or failure
   */
  public async assignPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<boolean> {
    try {
      const role = await Role.findByPk(roleId);
      const permission = await Permission.findByPk(permissionId);

      if (!role || !permission) {
        return false;
      }

      // @ts-ignore - Sequelize typing issue with associations
      await role.addPermission(permission);
      return true;
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      return false;
    }
  }
}

/**
 * Retrieves the security configuration settings from environment variables
 * or uses default values when not specified
 * Technical Specification Reference: Security Features - End-to-end encryption
 */
export const getSecurityConfig = (): SecurityConfig => {
  const securityAlgorithm = process.env.SECURITY_ALGORITHM || 'AES-256-GCM';
  const jwtExpirationTime = parseInt(process.env.JWT_EXPIRATION || '3600', 10);
  const rbacEnabled = process.env.RBAC_ENABLED !== 'false';

  return {
    encryption: {
      algorithm: securityAlgorithm,
      keySize: 256, // AES-256 key size in bits
      ivSize: 16, // Initialization vector size in bytes
    },
    jwt: {
      expirationTime: jwtExpirationTime,
      algorithm: 'HS256', // HMAC with SHA-256
    },
    rbac: {
      enabled: rbacEnabled,
      cacheTimeout: 300, // Role cache timeout in seconds
    },
  };
};

// Export the RoleManager instance for use in other modules
export const roleManager = new RoleManager();