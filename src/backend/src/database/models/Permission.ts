// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create/modify tables
 * 3. Run database migrations to create the permissions table
 * 4. Configure proper database connection settings in environment variables
 */

/**
 * Permission Model
 * Implements Role-Based Access Control (RBAC) by defining permissions that can be 
 * associated with roles and users to enforce access control policies.
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
class Permission extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   */
  public static associate(models: any): void {
    // Technical Specification Reference: Security Considerations/Authorization Model
    // Define many-to-many relationships with roles and users through junction tables
    if (models.Role) {
      Permission.belongsToMany(models.Role, {
        through: 'RolePermissions',
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'roles'
      });
    }

    if (models.User) {
      Permission.belongsToMany(models.User, {
        through: 'UserPermissions',
        foreignKey: 'permissionId',
        otherKey: 'userId',
        as: 'users'
      });
    }
  }

  /**
   * Initialize the Permission model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    Permission.init(
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
        modelName: 'Permission',
        tableName: 'permissions',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['name']
          }
        ],
        hooks: {
          beforeValidate: (permission: Permission) => {
            // Ensure name is lowercase and trimmed for consistency
            if (permission.name) {
              permission.name = permission.name.toLowerCase().trim();
            }
          }
        }
      }
    );
  }
}

export default Permission;