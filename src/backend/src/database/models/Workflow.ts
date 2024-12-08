// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { IWorkflow } from '../../interfaces/IWorkflow';
import { Execution } from './Execution';
import { WORKFLOW_STATUSES, DEFAULT_WORKFLOW_STATUS } from '../../constants/workflow.constants';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges for the workflows table
 * 3. Run database migrations to create the workflows table
 * 4. Configure proper database connection settings in environment variables
 * 5. Set up appropriate indexes based on query patterns
 */

/**
 * Workflow Model
 * Represents workflow definitions in the database
 * Technical Specification Reference: Database Design/Data Models/Workflow Data Structure
 */
class Workflow extends Model implements IWorkflow {
  public id!: string;
  public name!: string;
  public status!: typeof WORKFLOW_STATUSES[number];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define association properties
  public executions?: Execution[];

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   */
  public static associate(models: any): void {
    // Define one-to-many relationship with Execution model
    if (models.Execution) {
      Workflow.hasMany(models.Execution, {
        foreignKey: 'workflowId',
        as: 'executions',
        onDelete: 'CASCADE'
      });
    }
  }

  /**
   * Retrieves detailed information about a specific workflow
   * Technical Specification Reference: Database Design/Data Models/Workflow Data Structure
   * 
   * @param workflowId - The ID of the workflow to retrieve
   * @returns Detailed workflow information including executions
   */
  public static async getWorkflowDetails(workflowId: string): Promise<object | null> {
    try {
      const workflow = await Workflow.findByPk(workflowId, {
        include: [{
          model: Execution,
          as: 'executions',
          attributes: ['id', 'status', 'startedAt', 'completedAt']
        }]
      });

      if (!workflow) {
        return null;
      }

      return {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        executions: workflow.executions
      };
    } catch (error) {
      console.error('Error retrieving workflow details:', error);
      throw error;
    }
  }

  /**
   * Initialize the Workflow model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    Workflow.init(
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
          validate: {
            notEmpty: true,
            len: [1, 255] // Matches MAX_WORKFLOW_NAME_LENGTH from constants
          }
        },
        status: {
          type: DataTypes.ENUM(...WORKFLOW_STATUSES),
          allowNull: false,
          defaultValue: DEFAULT_WORKFLOW_STATUS
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
        modelName: 'Workflow',
        tableName: 'workflows',
        timestamps: true,
        indexes: [
          {
            fields: ['name']
          },
          {
            fields: ['status']
          },
          {
            fields: ['createdAt']
          }
        ],
        hooks: {
          beforeValidate: (workflow: Workflow) => {
            // Ensure name is trimmed
            if (workflow.name) {
              workflow.name = workflow.name.trim();
            }
          }
        }
      }
    );
  }
}

export default Workflow;