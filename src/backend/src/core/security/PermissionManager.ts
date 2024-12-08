/**
 * Human Tasks:
 * 1. Ensure database migrations are properly executed for permission-related tables
 * 2. Verify proper configuration of audit logging system
 * 3. Review and adjust permission caching strategy based on system load
 * 4. Configure appropriate monitoring for permission-related operations
 */

import { Permission } from '../../database/models/Permission';
import { Role } from '../../database/models/Role';
import { User } from '../../database/models/User';
import { encryptData, decryptData } from '../../utils/encryption.util';
import { Sequelize } from 'sequelize'; // v6.32.1
import { logError } from '../../utils/logger.util';

/**
 * PermissionManager class
 * Implements Role-Based Access Control (RBAC) by managing permissions and their associations
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
export class PermissionManager {
  private permissionCache: Map<string, Permission>;
  private roleCache: Map<string, Role>;
  private cacheDuration: number = 300000; // 5 minutes in milliseconds

  constructor() {
    this.permissionCache = new Map();
    this.roleCache = new Map();
  }

  /**
   * Assigns a permission to a role
   * Technical Specification Reference: Security Considerations/Authorization Model
   * 
   * @param roleId - The ID of the role to assign the permission to
   * @param permissionId - The ID of the permission to assign
   * @returns Promise<boolean> indicating success or failure
   */
  public async assignPermissionToRole(roleId: string, permissionId: string): Promise<boolean> {
    try {
      // Fetch role and permission from database
      const role = await Role.findByPk(roleId);
      const permission = await Permission.findByPk(permissionId);

      if (!role || !permission) {
        logError(
          'RBAC_ERROR',
          'Failed to assign permission: Role or Permission not found',
          { roleId, permissionId }
        );
        return false;
      }

      // Add permission to role
      // @ts-ignore - Sequelize typing issue with associations
      await role.addPermission(permission);

      // Invalidate role cache
      this.roleCache.delete(roleId);

      // Log the action for audit purposes
      // Technical Specification Reference: Core Features and Functionalities/Security Features
      await this.logPermissionAction(
        'assign_permission',
        roleId,
        permissionId,
        true
      );

      return true;
    } catch (error) {
      logError(
        'RBAC_ERROR',
        'Failed to assign permission to role',
        {
          roleId,
          permissionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      return false;
    }
  }

  /**
   * Revokes a permission from a role
   * Technical Specification Reference: Security Considerations/Authorization Model
   * 
   * @param roleId - The ID of the role to revoke the permission from
   * @param permissionId - The ID of the permission to revoke
   * @returns Promise<boolean> indicating success or failure
   */
  public async revokePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    try {
      // Fetch role and permission from database
      const role = await Role.findByPk(roleId);
      const permission = await Permission.findByPk(permissionId);

      if (!role || !permission) {
        logError(
          'RBAC_ERROR',
          'Failed to revoke permission: Role or Permission not found',
          { roleId, permissionId }
        );
        return false;
      }

      // Remove permission from role
      // @ts-ignore - Sequelize typing issue with associations
      await role.removePermission(permission);

      // Invalidate role cache
      this.roleCache.delete(roleId);

      // Log the action for audit purposes
      await this.logPermissionAction(
        'revoke_permission',
        roleId,
        permissionId,
        true
      );

      return true;
    } catch (error) {
      logError(
        'RBAC_ERROR',
        'Failed to revoke permission from role',
        {
          roleId,
          permissionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      return false;
    }
  }

  /**
   * Validates if a user has a specific permission
   * Technical Specification Reference: Security Considerations/Authorization Model
   * 
   * @param userId - The ID of the user to check
   * @param permissionName - The name of the permission to validate
   * @returns Promise<boolean> indicating if the user has the permission
   */
  public async validateUserPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      // Fetch user with roles
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          as: 'roles',
          include: [{
            model: Permission,
            as: 'permissions'
          }]
        }]
      });

      if (!user) {
        logError(
          'RBAC_ERROR',
          'Failed to validate permission: User not found',
          { userId, permissionName }
        );
        return false;
      }

      // Check if any of the user's roles have the required permission
      const hasPermission = user.roles?.some(role => 
        role.permissions?.some(permission => 
          permission.name.toLowerCase() === permissionName.toLowerCase()
        )
      ) || false;

      // Log the validation attempt for audit purposes
      await this.logPermissionAction(
        'validate_permission',
        userId,
        permissionName,
        hasPermission
      );

      return hasPermission;
    } catch (error) {
      logError(
        'RBAC_ERROR',
        'Failed to validate user permission',
        {
          userId,
          permissionName,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      return false;
    }
  }

  /**
   * Logs permission-related actions for audit purposes
   * Technical Specification Reference: Core Features and Functionalities/Security Features
   * 
   * @param action - The type of action performed
   * @param entityId - The ID of the entity (role or user)
   * @param permissionIdentifier - The permission ID or name
   * @param success - Whether the action was successful
   */
  private async logPermissionAction(
    action: string,
    entityId: string,
    permissionIdentifier: string,
    success: boolean
  ): Promise<void> {
    try {
      const metadata = {
        action,
        entityId,
        permissionIdentifier,
        success,
        timestamp: new Date().toISOString(),
        requestId: global.requestContext?.requestId
      };

      // Encrypt sensitive data before logging
      const encryptedMetadata = encryptData(JSON.stringify(metadata));

      // Log to audit system
      logError(
        'PERMISSION_AUDIT',
        `Permission action: ${action}`,
        { metadata: encryptedMetadata }
      );
    } catch (error) {
      logError(
        'AUDIT_ERROR',
        'Failed to log permission action',
        {
          action,
          entityId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  }
}