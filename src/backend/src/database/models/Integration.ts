// @ts-nocheck
import { Model, DataTypes, Sequelize } from 'sequelize'; // v6.32.1
import { IIntegration } from '../../interfaces/IIntegration';
import { IntegrationConfig, IntegrationType } from '../../types/integration.types';

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL database is properly configured and accessible
 * 2. Verify database user has sufficient privileges to create/modify tables
 * 3. Run database migrations to create the integrations table
 * 4. Configure proper database connection settings in environment variables
 * 5. Verify that the SUPPORTED_PROTOCOLS constant is up to date with all required protocols
 */

/**
 * Integration Model
 * Implements the database model for managing integration configurations.
 * Technical Specification Reference: Core Features and Functionalities/Integration Capabilities
 */
class Integration extends Model implements IIntegration {
  public id!: string;
  public name!: string;
  public protocol!: IntegrationType;
  public retryCount!: number;
  public timeout!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Helper method to define model associations
   * This will be called after all models are initialized
   */
  public static associate(models: any): void {
    // Define any relationships with other models here if needed
    // Currently, the Integration model doesn't have any direct associations
  }

  /**
   * Initialize the Integration model with its attributes and options
   * Technical Specification Reference: Core Features and Functionalities/Integration Capabilities
   */
  public static initialize(sequelize: Sequelize): void {
    Integration.init(
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
            len: [3, 100]
          }
        },
        protocol: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
            isIn: [['REST', 'SOAP', 'GraphQL', 'WebSocket']]
          }
        },
        retryCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
            max: 10 // Setting a reasonable maximum retry limit
          }
        },
        timeout: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1000, // Minimum timeout of 1 second
            max: 300000 // Maximum timeout of 5 minutes
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
        modelName: 'Integration',
        tableName: 'integrations',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['name']
          }
        ],
        hooks: {
          beforeValidate: (integration: Integration) => {
            // Ensure name is trimmed for consistency
            if (integration.name) {
              integration.name = integration.name.trim();
            }
          }
        }
      }
    );
  }

  /**
   * Convert the model instance to a lightweight IntegrationConfig type
   * Useful for API responses where full integration details aren't needed
   */
  public toConfig(): IntegrationConfig {
    return {
      id: this.id,
      name: this.name,
      protocol: this.protocol
    };
  }
}

export default Integration;