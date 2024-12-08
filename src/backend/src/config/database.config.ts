/**
 * Human Tasks:
 * 1. Create and configure .env file with required database settings:
 *    - DB_HOST: Database host (default: localhost)
 *    - DB_PORT: Database port (default: 5432)
 *    - DB_USER: Database user (default: admin)
 *    - DB_PASSWORD: Database password (encrypted)
 *    - DB_NAME: Database name (default: workflow_db)
 * 2. Ensure PostgreSQL is installed and running
 * 3. Verify database user has appropriate permissions
 * 4. Configure proper connection pooling settings based on load requirements
 * 5. Set up database backup and recovery procedures
 */

import { Sequelize, Options } from 'sequelize'; // v6.32.1
import { encryptData, decryptData } from '../utils/encryption.util';
import { ERROR_CODES } from '../constants/error.constants';

/**
 * Database configuration interface defining the structure
 * of the database settings object
 * Technical Specification Reference: System Design/Database Design
 */
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: 'postgres';
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  ssl: boolean;
  dialectOptions: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
}

/**
 * Retrieves and validates database configuration from environment variables
 * Technical Specification Reference: System Design/Database Design
 * 
 * @returns DatabaseConfig object with validated settings
 * @throws Error if required environment variables are missing or invalid
 */
const getDatabaseConfig = (): DatabaseConfig => {
  // Get environment variables with fallbacks
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 5432;
  const username = process.env.DB_USER || 'admin';
  const encryptedPassword = process.env.DB_PASSWORD || 'password';
  const database = process.env.DB_NAME || 'workflow_db';

  // Decrypt the database password
  const password = decryptData(encryptedPassword);

  // Determine environment-specific settings
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    host,
    port,
    username,
    password,
    database,
    dialect: 'postgres',
    logging: isProduction ? false : console.log,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
    },
    ssl: isProduction,
    dialectOptions: {
      ssl: isProduction ? {
        require: true,
        rejectUnauthorized: false
      } : undefined
    }
  };
};

/**
 * Initializes the database connection using Sequelize and environment variables
 * Technical Specification Reference: System Design/Database Design
 * 
 * @returns Sequelize instance configured with database connection settings
 * @throws Error if database connection fails
 */
export const initializeDatabase = async (): Promise<Sequelize> => {
  try {
    const config = getDatabaseConfig();
    
    // Initialize Sequelize with the configuration
    const sequelize = new Sequelize({
      ...config,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    });

    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Set up global error handlers for database connection issues
    sequelize.connectionManager.on('disconnect', () => {
      console.error('Database connection lost. Attempting to reconnect...');
    });

    sequelize.connectionManager.on('reconnect', () => {
      console.log('Database connection reestablished.');
    });

    return sequelize;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `${ERROR_CODES.InternalServerError}: Failed to initialize database - ${errorMessage}`
    );
  }
};