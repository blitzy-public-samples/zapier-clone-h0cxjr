// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { initializeDatabase } from '../../config/database.config';
import { logError } from '../../utils/logger.util';
import { IExecution } from '../../interfaces/IExecution';
import { IWorkflow } from '../../interfaces/IWorkflow';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create/modify audit log table
 * 3. Run database migrations to create the audit_logs table
 * 4. Configure proper database connection settings in environment variables
 * 5. Set up appropriate data retention policies for audit logs
 * 6. Configure audit log backup procedures
 */

/**
 * AuditLog Model
 * Implements audit logging functionality to track operations within the system
 * Technical Specification Reference: Security Features/Audit Logging
 */
class AuditLog extends Model {
  public id!: string;
  public action!: string;
  public entityId!: string;
  public entityType!: string;
  public performedBy!: string;
  public performedAt!: Date;
  public metadata!: object;

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   */
  public static associate(models: any): void {
    // Define associations with Execution and Workflow models if they exist
    if (models.Execution) {
      AuditLog.belongsTo(models.Execution, {
        foreignKey: 'entityId',
        constraints: false,
        scope: {
          entityType: 'execution'
        }
      });
    }

    if (models.Workflow) {
      AuditLog.belongsTo(models.Workflow, {
        foreignKey: 'entityId',
        constraints: false,
        scope: {
          entityType: 'workflow'
        }
      });
    }
  }

  /**
   * Initialize the AuditLog model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    AuditLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [3, 100]
          }
        },
        entityId: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        entityType: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: true,
            isIn: [['workflow', 'execution', 'user', 'role', 'permission']]
          }
        },
        performedBy: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        performedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        metadata: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {}
        }
      },
      {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: true,
        indexes: [
          {
            fields: ['entityId', 'entityType']
          },
          {
            fields: ['performedBy']
          },
          {
            fields: ['performedAt']
          }
        ]
      }
    );
  }

  /**
   * Creates a new audit log entry
   * Technical Specification Reference: Security Features/Audit Logging
   * 
   * @param action - The action being audited
   * @param entityId - ID of the entity being audited
   * @param entityType - Type of entity being audited
   * @param performedBy - ID of the user who performed the action
   * @param metadata - Additional contextual information
   * @returns Promise<AuditLog> The created audit log entry
   */
  public static async logAction(
    action: string,
    entityId: string,
    entityType: string,
    performedBy: string,
    metadata: object = {}
  ): Promise<AuditLog> {
    try {
      const auditLog = await AuditLog.create({
        action,
        entityId,
        entityType,
        performedBy,
        performedAt: new Date(),
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          requestId: global.requestContext?.requestId
        }
      });

      return auditLog;
    } catch (error) {
      logError(
        'Failed to create audit log entry',
        {
          action,
          entityId,
          entityType,
          performedBy,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      throw error;
    }
  }
}

// Initialize the model with Sequelize instance
const initializeModel = async (): Promise<void> => {
  try {
    const sequelize = await initializeDatabase();
    AuditLog.initialize(sequelize);
  } catch (error) {
    logError(
      'Failed to initialize AuditLog model',
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    throw error;
  }
};

// Initialize the model
initializeModel();

export default AuditLog;