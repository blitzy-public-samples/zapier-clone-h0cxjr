// sequelize v6.32.1
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create/modify audit logs table
 * 3. Configure appropriate database backup procedures for audit logs
 * 4. Set up data retention policies for audit logs based on compliance requirements
 * 5. Verify proper indexing strategy based on query patterns
 */

/**
 * Migration script to create the audit_logs table
 * Technical Specification Reference: Security Features/Audit Logging
 * Implements audit logging to ensure traceability and accountability for operations
 */
export const up = async (queryInterface: QueryInterface, Sequelize: Sequelize): Promise<void> => {
  await queryInterface.createTable('audit_logs', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Unique identifier for the audit log entry'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100]
      },
      comment: 'Type of action performed (e.g., create, update, delete)'
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Identifier of the entity being audited'
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['workflow', 'execution', 'user', 'role', 'permission']]
      },
      comment: 'Type of entity being audited'
    },
    performedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Identifier of the user who performed the action'
    },
    performedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the action was performed'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Additional contextual information about the action'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the audit log entry was created'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the audit log entry was last updated'
    }
  }, {
    comment: 'Stores audit trail information for tracking system operations',
    indexes: [
      {
        fields: ['entityId', 'entityType'],
        name: 'idx_audit_logs_entity'
      },
      {
        fields: ['performedBy'],
        name: 'idx_audit_logs_performer'
      },
      {
        fields: ['performedAt'],
        name: 'idx_audit_logs_timestamp'
      },
      {
        fields: ['action'],
        name: 'idx_audit_logs_action'
      }
    ]
  });
};

/**
 * Rollback migration by dropping the audit_logs table
 * Technical Specification Reference: Security Features/Audit Logging
 */
export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('audit_logs');
};