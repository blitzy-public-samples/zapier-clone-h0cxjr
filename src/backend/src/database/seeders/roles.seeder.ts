// @ts-nocheck
import { Role } from '../../database/models/Role';
import { Permission } from '../../database/models/Permission';
import { seedPermissions } from './permissions.seeder';
import { AuditLog } from '../../database/models/AuditLog';
import { Sequelize } from 'sequelize'; // v6.32.1

/**
 * Human Tasks:
 * 1. Review and verify the predefined roles align with system requirements
 * 2. Ensure database connection is properly configured
 * 3. Verify database user has sufficient privileges for seeding operations
 * 4. Run database migrations before executing seeders
 */

/**
 * Predefined roles for the RBAC system
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
const predefinedRoles = [
  {
    name: 'admin',
    description: 'System administrator with full access to all features'
  },
  {
    name: 'workflow_manager',
    description: 'Can create, modify, and manage workflows and their executions'
  },
  {
    name: 'workflow_executor',
    description: 'Can execute and monitor workflows'
  },
  {
    name: 'user_manager',
    description: 'Can manage user accounts and their roles'
  },
  {
    name: 'auditor',
    description: 'Read-only access to audit logs and system monitoring'
  },
  {
    name: 'basic_user',
    description: 'Basic user with limited workflow execution privileges'
  }
];

/**
 * Role-Permission mappings defining which permissions are assigned to each role
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
const rolePermissionMappings = {
  admin: [
    'workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete', 'workflow:execute',
    'execution:read', 'execution:cancel', 'execution:retry',
    'user:create', 'user:read', 'user:update', 'user:delete',
    'role:create', 'role:read', 'role:update', 'role:delete',
    'audit:read', 'audit:export',
    'config:read', 'config:update'
  ],
  workflow_manager: [
    'workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete', 'workflow:execute',
    'execution:read', 'execution:cancel', 'execution:retry'
  ],
  workflow_executor: [
    'workflow:read', 'workflow:execute',
    'execution:read', 'execution:cancel', 'execution:retry'
  ],
  user_manager: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'role:read'
  ],
  auditor: [
    'workflow:read',
    'execution:read',
    'user:read',
    'role:read',
    'audit:read', 'audit:export'
  ],
  basic_user: [
    'workflow:read', 'workflow:execute',
    'execution:read'
  ]
};

/**
 * Seeds the database with predefined roles and their associated permissions
 * Technical Specification Reference: Security Considerations/Authorization Model
 * 
 * @param roles - Array of role objects to be seeded (optional)
 * @returns Promise<void>
 */
export const seedRoles = async (roles = predefinedRoles): Promise<void> => {
  try {
    // Ensure permissions are seeded first
    await seedPermissions();

    // Create roles in bulk
    const createdRoles = await Role.bulkCreate(
      roles.map(role => ({
        ...role,
        name: role.name.toLowerCase().trim() // Ensure consistent naming
      })),
      {
        ignoreDuplicates: true, // Skip if role already exists
        validate: true // Ensure data validation
      }
    );

    // Associate permissions with roles
    for (const role of createdRoles) {
      const permissionNames = rolePermissionMappings[role.name];
      if (permissionNames) {
        const permissions = await Permission.findAll({
          where: {
            name: permissionNames
          }
        });

        // @ts-ignore - Sequelize typing issue with associations
        await role.setPermissions(permissions);
      }
    }

    // Log the seeding action for audit trail
    if (createdRoles.length > 0) {
      await AuditLog.logAction(
        'roles:seed',
        'system',
        'role',
        'system',
        {
          count: createdRoles.length,
          roles: createdRoles.map(r => r.name)
        }
      );

      console.log(`Successfully seeded ${createdRoles.length} roles`);
    } else {
      console.log('No new roles were seeded (all roles already exist)');
    }
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw new Error(`Failed to seed roles: ${error.message}`);
  }
};