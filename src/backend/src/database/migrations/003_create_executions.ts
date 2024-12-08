// @ts-nocheck
import { QueryInterface, DataTypes, Sequelize } from 'sequelize'; // v6.32.1

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges for creating tables and foreign keys
 * 3. Run database migrations in the correct order (after workflows table migration)
 * 4. Configure proper database connection settings in environment variables
 * 5. Set up appropriate indexes based on query patterns
 */

/**
 * Migration: Create Executions Table
 * Technical Specification Reference: Core Features and Functionalities/Execution Features
 * 
 * This migration creates the 'executions' table to store workflow execution data,
 * including execution status, context, and timing information.
 */
export const up = async (queryInterface: QueryInterface, Sequelize: Sequelize): Promise<void> => {
  await queryInterface.createTable('executions', {
    // Primary key using UUID
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    // Reference to the parent workflow
    workflowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workflows',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },

    // Execution status tracking
    status: {
      type: DataTypes.ENUM(
        'Pending',
        'Running',
        'Completed',
        'Failed'
      ),
      allowNull: false,
      defaultValue: 'Pending'
    },

    // Execution context data
    context: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Encrypted execution context data including variables and state'
    },

    // Execution timing information
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    },

    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Standard timestamps
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    }
  }, {
    // Table configuration
    timestamps: true,
    indexes: [
      {
        fields: ['workflowId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['startedAt']
      },
      {
        fields: ['completedAt']
      }
    ]
  });
};

/**
 * Revert the migration by dropping the 'executions' table
 */
export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('executions');
};