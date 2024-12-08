// @ts-nocheck
import { QueryInterface, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { ERROR_CODES } from '../../../constants/error.constants';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create tables
 * 3. Configure proper database connection settings in environment variables
 * 4. Run database migrations using the migration tool (e.g., sequelize-cli)
 * 5. Verify unique constraints are properly enforced for username and email
 * 6. Set up appropriate database backup procedures before running migrations
 */

/**
 * Migration: Create Users Table
 * Technical Specification Reference: Database Design/Data Models/User Management
 * Creates the 'users' table with necessary columns and constraints for user management
 */
export const up = async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {
  try {
    await queryInterface.createTable('users', {
      // Primary key using UUID
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the user'
      },
      
      // Username field with unique constraint
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 100]
        },
        comment: 'Unique username for user identification'
      },
      
      // Email field with unique constraint
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        },
        comment: 'Unique email address for user contact and authentication'
      },
      
      // Password field for authentication
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 255]
        },
        comment: 'Encrypted password for user authentication'
      },
      
      // Timestamps for record tracking
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of user record creation'
      },
      
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp of last user record update'
      }
    }, {
      // Table configuration
      comment: 'Stores user information for authentication and role-based access control',
      indexes: [
        {
          unique: true,
          fields: ['username'],
          name: 'users_username_unique'
        },
        {
          unique: true,
          fields: ['email'],
          name: 'users_email_unique'
        }
      ]
    });

    // Add triggers for automatic updatedAt timestamp
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_users_timestamp
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE trigger_set_timestamp();
    `);

  } catch (error) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Failed to create users table - ${error.message}`
    );
  }
};

/**
 * Migration: Drop Users Table
 * Technical Specification Reference: Database Design/Data Models/User Management
 * Removes the 'users' table and associated constraints
 */
export const down = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    // Drop the trigger first
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_users_timestamp ON users;
    `);

    // Drop the table
    await queryInterface.dropTable('users');
  } catch (error) {
    throw new Error(
      `${ERROR_CODES.ValidationError}: Failed to drop users table - ${error.message}`
    );
  }
};