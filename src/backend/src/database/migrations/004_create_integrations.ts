// Sequelize v6.32.1
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges for table creation
 * 3. Run database migrations in the correct order
 * 4. Verify that the SUPPORTED_PROTOCOLS constant is up to date
 */

/**
 * Migration script for creating the 'integrations' table
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 *   Implements the database schema for managing integration configurations, including fields for
 *   supported protocols, retry logic, and timeout settings.
 */
export const up = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.createTable('integrations', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 100]
      }
    },
    protocol: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['REST', 'SOAP', 'GraphQL', 'WebSocket']]
      }
    },
    retryCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 10 // Setting a reasonable maximum retry limit
      }
    },
    timeout: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1000, // Minimum timeout of 1 second
        max: 300000 // Maximum timeout of 5 minutes
      }
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });
};

/**
 * Migration script for dropping the 'integrations' table
 * Requirements Addressed:
 * - Integration Capabilities (Technical Specification/Core Features and Functionalities/Integration Capabilities)
 */
export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('integrations');
};