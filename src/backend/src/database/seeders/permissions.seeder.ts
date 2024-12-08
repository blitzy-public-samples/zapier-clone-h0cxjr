// @ts-nocheck
import { Permission } from '../../database/models/Permission';
import { Role } from '../../database/models/Role';
import { AuditLog } from '../../database/models/AuditLog';

/**
 * Human Tasks:
 * 1. Review and verify the predefined permissions align with system requirements
 * 2. Ensure database connection is properly configured
 * 3. Verify database user has sufficient privileges for seeding operations
 * 4. Run database migrations before executing seeders
 */

/**
 * Predefined permissions for the RBAC system
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
const predefinedPermissions = [
  // Workflow Management Permissions
  {
    name: 'workflow:create',
    description: 'Permission to create new workflows'
  },
  {
    name: 'workflow:read',
    description: 'Permission to view workflows'
  },
  {
    name: 'workflow:update',
    description: 'Permission to modify existing workflows'
  },
  {
    name: 'workflow:delete',
    description: 'Permission to delete workflows'
  },
  {
    name: 'workflow:execute',
    description: 'Permission to execute workflows'
  },
  
  // Execution Management Permissions
  {
    name: 'execution:read',
    description: 'Permission to view workflow executions'
  },
  {
    name: 'execution:cancel',
    description: 'Permission to cancel running executions'
  },
  {
    name: 'execution:retry',
    description: 'Permission to retry failed executions'
  },
  
  // User Management Permissions
  {
    name: 'user:create',
    description: 'Permission to create new users'
  },
  {
    name: 'user:read',
    description: 'Permission to view user information'
  },
  {
    name: 'user:update',
    description: 'Permission to modify user information'
  },
  {
    name: 'user:delete',
    description: 'Permission to delete users'
  },
  
  // Role Management Permissions
  {
    name: 'role:create',
    description: 'Permission to create new roles'
  },
  {
    name: 'role:read',
    description: 'Permission to view roles'
  },
  {
    name: 'role:update',
    description: 'Permission to modify roles'
  },
  {
    name: 'role:delete',
    description: 'Permission to delete roles'
  },
  
  // Audit Log Permissions
  {
    name: 'audit:read',
    description: 'Permission to view audit logs'
  },
  {
    name: 'audit:export',
    description: 'Permission to export audit logs'
  },
  
  // System Configuration Permissions
  {
    name: 'config:read',
    description: 'Permission to view system configuration'
  },
  {
    name: 'config:update',
    description: 'Permission to modify system configuration'
  }
];

/**
 * Seeds the database with predefined permissions for RBAC
 * Technical Specification Reference: Security Considerations/Authorization Model
 * 
 * @param permissions - Array of permission objects to be seeded
 * @returns Promise<void>
 */
export const seedPermissions = async (permissions = predefinedPermissions): Promise<void> => {
  try {
    // Create permissions in bulk
    const createdPermissions = await Permission.bulkCreate(
      permissions.map(permission => ({
        ...permission,
        name: permission.name.toLowerCase().trim() // Ensure consistent naming
      })),
      {
        ignoreDuplicates: true, // Skip if permission already exists
        validate: true // Ensure data validation
      }
    );

    // Log the seeding action for audit trail
    if (createdPermissions.length > 0) {
      await AuditLog.logAction(
        'permissions:seed',
        'system',
        'permission',
        'system',
        {
          count: createdPermissions.length,
          permissions: createdPermissions.map(p => p.name)
        }
      );

      console.log(`Successfully seeded ${createdPermissions.length} permissions`);
    } else {
      console.log('No new permissions were seeded (all permissions already exist)');
    }
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw new Error(`Failed to seed permissions: ${error.message}`);
  }
};