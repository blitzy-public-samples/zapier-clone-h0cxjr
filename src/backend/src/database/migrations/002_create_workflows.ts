// @ts-nocheck
import { QueryInterface, DataTypes, Sequelize } from 'sequelize'; // v6.32.1

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges for creating tables
 * 3. Run database migrations in the correct order (after dependencies)
 * 4. Configure proper database connection settings in environment variables
 * 5. Review and adjust any database-specific settings (e.g., character set, collation)
 */

/**
 * Migration: Create Workflows Table
 * Technical Specification Reference: Database Design/Data Models/Workflow Data Structure
 * This migration creates the 'workflows' table to store workflow definitions and metadata.
 */

export const up = async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {
  try {
    await queryInterface.createTable('workflows', {
      // Primary key using UUID
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the workflow'
      },

      // Workflow name with unique constraint
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 255] // Matches MAX_WORKFLOW_NAME_LENGTH from constants
        },
        comment: 'Human-readable name of the workflow'
      },

      // Workflow status
      status: {
        type: DataTypes.ENUM('Draft', 'Active', 'Paused', 'Completed', 'Archived'),
        allowNull: false,
        defaultValue: 'Draft',
        comment: 'Current status of the workflow'
      },

      // Workflow definition stored as JSONB for better performance and querying
      definition: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'JSON representation of the workflow definition'
      },

      // Timestamps
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp when the workflow was created'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Timestamp when the workflow was last updated'
      }
    }, {
      // Table configuration
      timestamps: true,
      comment: 'Stores workflow definitions and metadata for the Workflow Automation Platform',
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'workflows_name_unique'
        },
        {
          fields: ['status'],
          name: 'workflows_status_idx'
        },
        {
          fields: ['createdAt'],
          name: 'workflows_created_at_idx'
        },
        {
          fields: ['updatedAt'],
          name: 'workflows_updated_at_idx'
        }
      ]
    });

  } catch (error) {
    throw new Error(`Error creating workflows table: ${error.message}`);
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    await queryInterface.dropTable('workflows');
  } catch (error) {
    throw new Error(`Error dropping workflows table: ${error.message}`);
  }
};