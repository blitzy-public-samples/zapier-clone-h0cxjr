import { Role } from '../../database/models/Role';
import { Permission } from '../../database/models/Permission';
import { handleError } from '../../utils/error.util';
import { logInfo } from '../../utils/logger.util';
import { Sequelize } from 'sequelize'; // v6.32.1

/**
 * Human Tasks:
 * 1. Ensure database migrations for roles and permissions tables are executed
 * 2. Verify proper database connection configuration in environment variables
 * 3. Set up proper role-permission relationships in the database schema
 * 4. Configure logging settings for security audit trail
 * 5. Review and adjust error handling policies for security operations
 */

/**
 * RoleManager class provides methods for managing roles and permissions in the system.
 * Implements Role-Based Access Control (RBAC) by managing roles and their associated permissions.
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
export class RoleManager {
  /**
   * Creates a new role with the specified name and permissions.
   * Technical Specification Reference: Security Considerations/Authorization Model
   * 
   * @param roleName - The name of the role to create
   * @param permissionIds - Array of permission IDs to associate with the role
   * @returns The created Role object
   * @throws Error if role creation fails
   */
  public async createRole(roleName: string, permissionIds: string[]): Promise<Role> {
    try {
      // Validate input parameters
      if (!roleName || !roleName.trim()) {
        throw new Error('Role name is required');
      }
      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        throw new Error('At least one permission is required');
      }

      // Retrieve permissions to verify they exist
      const permissions = await Permission.findAll({
        where: {
          id: permissionIds
        }
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error('One or more permission IDs are invalid');
      }

      // Create the role
      const role = await Role.create({
        name: roleName.toLowerCase().trim(),
        description: `Role for ${roleName}`,
      });

      // Associate permissions with the role
      await role.setPermissions(permissions);

      // Log the role creation
      logInfo('Role created successfully', {
        roleId: role.id,
        roleName: role.name,
        permissionCount: permissions.length
      });

      // Fetch the role with its permissions
      const roleWithPermissions = await Role.findByPk(role.id, {
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      });

      return roleWithPermissions!;
    } catch (error) {
      handleError(error, true);
      throw error; // Re-throw to be handled by the caller
    }
  }

  /**
   * Assigns a set of permissions to an existing role.
   * Technical Specification Reference: Security Considerations/Authorization Model
   * 
   * @param roleId - The ID of the role to update
   * @param permissionIds - Array of permission IDs to assign to the role
   * @throws Error if permission assignment fails
   */
  public async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      // Validate input parameters
      if (!roleId) {
        throw new Error('Role ID is required');
      }
      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        throw new Error('At least one permission is required');
      }

      // Retrieve the role
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Retrieve permissions to verify they exist
      const permissions = await Permission.findAll({
        where: {
          id: permissionIds
        }
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error('One or more permission IDs are invalid');
      }

      // Update role permissions
      await role.setPermissions(permissions);

      // Log the permission assignment
      logInfo('Permissions assigned to role successfully', {
        roleId: role.id,
        roleName: role.name,
        permissionCount: permissions.length,
        permissionIds
      });
    } catch (error) {
      handleError(error, true);
      throw error; // Re-throw to be handled by the caller
    }
  }

  /**
   * Retrieves a role along with its associated permissions.
   * Technical Specification Reference: Security Considerations/Authorization Model
   * 
   * @param roleId - The ID of the role to retrieve
   * @returns The Role object with its associated permissions
   * @throws Error if role retrieval fails
   */
  public async getRoleWithPermissions(roleId: string): Promise<Role> {
    try {
      // Validate input parameter
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      // Retrieve the role with its permissions
      const role = await Role.findByPk(roleId, {
        include: [{
          model: Permission,
          as: 'permissions'
        }]
      });

      if (!role) {
        throw new Error('Role not found');
      }

      // Log the role retrieval
      logInfo('Role retrieved successfully', {
        roleId: role.id,
        roleName: role.name,
        permissionCount: role.permissions?.length || 0
      });

      return role;
    } catch (error) {
      handleError(error, true);
      throw error; // Re-throw to be handled by the caller
    }
  }
}