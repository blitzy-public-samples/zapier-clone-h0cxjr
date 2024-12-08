// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { IWorkflow } from '../../interfaces/IWorkflow';
import Workflow from './Workflow';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges for the workflow_versions table
 * 3. Run database migrations to create the workflow_versions table
 * 4. Configure proper database connection settings in environment variables
 * 5. Set up appropriate indexes based on query patterns
 */

/**
 * WorkflowVersion Model
 * Represents different versions of workflows in the database
 * Technical Specification Reference: Database Design/Data Models/Workflow Versioning
 */
class WorkflowVersion extends Model {
  public id!: string;
  public workflowId!: string;
  public version!: number;
  public definition!: Record<string, any>;
  public readonly createdAt!: Date;

  // Define association properties
  public workflow?: Workflow;

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   */
  public static associate(models: any): void {
    // Define many-to-one relationship with Workflow model
    if (models.Workflow) {
      WorkflowVersion.belongsTo(models.Workflow, {
        foreignKey: 'workflowId',
        as: 'workflow',
        onDelete: 'CASCADE'
      });
    }
  }

  /**
   * Retrieves detailed information about a specific workflow version
   * Technical Specification Reference: Database Design/Data Models/Workflow Versioning
   * 
   * @param workflowVersionId - The ID of the workflow version to retrieve
   * @returns Detailed workflow version information including associated workflow
   */
  public static async getVersionDetails(workflowVersionId: string): Promise<object | null> {
    try {
      const workflowVersion = await WorkflowVersion.findByPk(workflowVersionId, {
        include: [{
          model: Workflow,
          as: 'workflow',
          attributes: ['id', 'name', 'status']
        }]
      });

      if (!workflowVersion) {
        return null;
      }

      return {
        id: workflowVersion.id,
        workflowId: workflowVersion.workflowId,
        version: workflowVersion.version,
        definition: workflowVersion.definition,
        createdAt: workflowVersion.createdAt,
        workflow: workflowVersion.workflow
      };
    } catch (error) {
      console.error('Error retrieving workflow version details:', error);
      throw error;
    }
  }

  /**
   * Initialize the WorkflowVersion model with its attributes and options
   */
  public static initialize(sequelize: Sequelize): void {
    WorkflowVersion.init(
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
        version: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            min: 1
          }
        },
        definition: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
          validate: {
            notEmpty: true
          }
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'WorkflowVersion',
        tableName: 'workflow_versions',
        timestamps: true,
        updatedAt: false,
        indexes: [
          {
            fields: ['workflowId']
          },
          {
            fields: ['version']
          },
          {
            unique: true,
            fields: ['workflowId', 'version']
          }
        ],
        hooks: {
          beforeValidate: async (workflowVersion: WorkflowVersion) => {
            // Ensure definition is a valid JSON object
            if (typeof workflowVersion.definition === 'string') {
              try {
                workflowVersion.definition = JSON.parse(workflowVersion.definition);
              } catch (error) {
                throw new Error('Invalid workflow definition JSON');
              }
            }
          }
        }
      }
    );
  }
}

export default WorkflowVersion;