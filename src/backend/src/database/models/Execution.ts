// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { IExecution } from '../../interfaces/IExecution';
import { ExecutionStatus } from '../../types/execution.types';
import { encryptData, decryptData } from '../../utils/encryption.util';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges for the executions table
 * 3. Run database migrations to create the executions table
 * 4. Configure proper database connection settings in environment variables
 * 5. Set up appropriate indexes based on query patterns
 */

/**
 * Execution Model
 * Represents workflow execution instances in the database
 * Technical Specification Reference: Core Features and Functionalities/Execution Features
 */
class Execution extends Model implements IExecution {
  public id!: string;
  public workflowId!: string;
  public status!: ExecutionStatus;
  public context!: Record<string, any>;
  public startedAt!: Date;
  public completedAt!: Date | null;

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   */
  public static associate(models: any): void {
    // Define relationship with Workflow model
    if (models.Workflow) {
      Execution.belongsTo(models.Workflow, {
        foreignKey: 'workflowId',
        as: 'workflow',
        onDelete: 'CASCADE'
      });
    }
  }

  /**
   * Encrypts the execution context before saving to database
   * Technical Specification Reference: Security Features - Data Encryption
   */
  public async encryptContext(): Promise<void> {
    if (this.context) {
      const encryptedContext = encryptData(JSON.stringify(this.context));
      this.context = encryptedContext;
    }
  }

  /**
   * Decrypts the execution context after retrieving from database
   * Technical Specification Reference: Security Features - Data Encryption
   */
  public async decryptContext(): Promise<void> {
    if (this.context) {
      const decryptedContext = decryptData(this.context);
      this.context = JSON.parse(decryptedContext);
    }
  }

  /**
   * Initialize the Execution model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    Execution.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        workflowId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'workflows',
            key: 'id'
          }
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ExecutionStatus)),
          allowNull: false,
          defaultValue: ExecutionStatus.PENDING
        },
        context: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: '{}',
          get() {
            const rawValue = this.getDataValue('context');
            try {
              return JSON.parse(rawValue);
            } catch {
              return {};
            }
          },
          set(value: any) {
            this.setDataValue('context', JSON.stringify(value));
          }
        },
        startedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: 'Execution',
        tableName: 'executions',
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
        ],
        hooks: {
          beforeSave: async (execution: Execution) => {
            await execution.encryptContext();
          },
          afterFind: async (executions: Execution | Execution[]) => {
            if (Array.isArray(executions)) {
              await Promise.all(executions.map(execution => execution.decryptContext()));
            } else if (executions) {
              await executions.decryptContext();
            }
          }
        }
      }
    );
  }
}

export default Execution;