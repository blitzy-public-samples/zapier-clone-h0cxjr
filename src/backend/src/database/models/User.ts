// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { Role } from './Role';
import { Permission } from './Permission';
import { AuditLog } from './AuditLog';
import { initializeDatabase } from '../../config/database.config';
import { encryptData, decryptData } from '../../utils/encryption.util';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create/modify tables
 * 3. Run database migrations to create the users table and junction tables
 * 4. Configure proper database connection settings in environment variables
 * 5. Set up appropriate password hashing and encryption mechanisms
 * 6. Configure user session management and token expiration policies
 */

/**
 * User Model
 * Implements user management and role-based access control (RBAC)
 * Technical Specification Reference: Security Considerations/Authorization Model
 */
class User extends Model {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define association properties
  public roles?: Role[];
  public permissions?: Permission[];

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   * Technical Specification Reference: Security Considerations/Authorization Model
   */
  public static associate(models: any): void {
    // Define many-to-many relationship with Role model
    if (models.Role) {
      User.belongsToMany(models.Role, {
        through: 'UserRoles',
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles'
      });
    }

    // Define many-to-many relationship with Permission model
    if (models.Permission) {
      User.belongsToMany(models.Permission, {
        through: 'UserPermissions',
        foreignKey: 'userId',
        otherKey: 'permissionId',
        as: 'permissions'
      });
    }
  }

  /**
   * Validates the provided password against the stored encrypted password
   * Technical Specification Reference: Security Features/Authentication
   * 
   * @param password - The password to validate
   * @returns boolean indicating if the password matches
   */
  public async validatePassword(password: string): Promise<boolean> {
    try {
      const decryptedStoredPassword = decryptData(this.password);
      return password === decryptedStoredPassword;
    } catch (error) {
      await AuditLog.logAction(
        'password_validation_failed',
        this.id,
        'user',
        this.id,
        {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      return false;
    }
  }

  /**
   * Initialize the User model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            len: [3, 100]
          }
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
            notEmpty: true
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [8, 255]
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
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['username']
          },
          {
            unique: true,
            fields: ['email']
          }
        ],
        hooks: {
          beforeValidate: (user: User) => {
            // Ensure username and email are lowercase and trimmed
            if (user.username) {
              user.username = user.username.toLowerCase().trim();
            }
            if (user.email) {
              user.email = user.email.toLowerCase().trim();
            }
          },
          beforeCreate: async (user: User) => {
            // Encrypt password before saving
            if (user.password) {
              user.password = encryptData(user.password);
            }
          },
          beforeUpdate: async (user: User) => {
            // Encrypt password if it has been changed
            if (user.changed('password')) {
              user.password = encryptData(user.password);
            }
          },
          afterCreate: async (user: User) => {
            // Log user creation in audit log
            await AuditLog.logAction(
              'user_created',
              user.id,
              'user',
              user.id,
              {
                username: user.username,
                email: user.email
              }
            );
          },
          afterUpdate: async (user: User) => {
            // Log user update in audit log
            if (user.changed()) {
              await AuditLog.logAction(
                'user_updated',
                user.id,
                'user',
                user.id,
                {
                  changedFields: user.changed()
                }
              );
            }
          }
        }
      }
    );
  }
}

// Initialize the model with Sequelize instance
const initializeModel = async (): Promise<void> => {
  try {
    const sequelize = await initializeDatabase();
    User.initialize(sequelize);
  } catch (error) {
    console.error('Failed to initialize User model:', error);
    throw error;
  }
};

// Initialize the model
initializeModel();

export default User;