// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import Permission from './Permission';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create/modify tables
 * 3. Run database migrations to create the roles table and junction tables
 * 4. Configure proper database connection settings in environment variables
 * 5. Verify proper setup of role-permission and role-user relationships
 */

/**
 * Role Model
 * Implements Role-Based Access Control (RBAC) by defining roles that can be
 * associated with users and permissions to enforce access control policies.
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
class Role extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define association properties
  public permissions?: Permission[];
  public users?: any[]; // Type will be User[] once User model is imported

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   * Technical Specification Reference: Security Considerations/Authorization Model
   */
  public static associate(models: any): void {
    // Define many-to-many relationship with Permission model
    if (models.Permission) {
      Role.belongsToMany(models.Permission, {
        through: 'RolePermissions',
        foreignKey: 'roleId',
        otherKey: 'permissionId',
        as: 'permissions'
      });
    }

    // Define many-to-many relationship with User model
    if (models.User) {
      Role.belongsToMany(models.User, {
        through: 'UserRoles',
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users'
      });
    }
  }

  /**
   * Initialize the Role model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    Role.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            len: [3, 100]
          }
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [3, 500]
          }
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['name']
          }
        ],
        hooks: {
          beforeValidate: (role: Role) => {
            // Ensure name is lowercase and trimmed for consistency
            if (role.name) {
              role.name = role.name.toLowerCase().trim();
            }
          }
        }
      }
    );
  }
}

export default Role;