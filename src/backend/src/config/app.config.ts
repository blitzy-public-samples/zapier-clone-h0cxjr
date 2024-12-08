/**
 * @fileoverview Core application configuration settings for the backend
 * Addresses requirement: Application Configuration from Technical Specification/System Design/Deployment Architecture
 * 
 * Human Tasks:
 * 1. Configure environment-specific variables in deployment pipelines
 * 2. Set up secrets management for sensitive configuration values
 * 3. Review and adjust rate limits based on environment capacity
 * 4. Configure monitoring thresholds for configuration-related alerts
 */

// Third-party imports
import * as dotenv from 'dotenv'; // v16.3.1

// Internal imports
import { ERROR_CODES } from '../constants/error.constants';
import { SUPPORTED_PROTOCOLS } from '../constants/integration.constants';
import { 
  WORKFLOW_STATUSES, 
  DEFAULT_WORKFLOW_STATUS,
  MAX_WORKFLOW_NAME_LENGTH 
} from '../constants/workflow.constants';
import { validateWorkflowName } from '../utils/validation.util';

// Initialize environment variables
dotenv.config();

// Global constants defined in specification
const APP_NAME = 'Workflow Automation Platform';
const DEFAULT_PORT = 3000;
const ENVIRONMENT = 'development';

/**
 * Interface defining the structure of the application configuration
 */
interface AppConfig {
  app: {
    name: string;
    environment: string;
    version: string;
    port: number;
    apiPrefix: string;
    corsOrigins: string[];
    trustProxy: boolean;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
    cors: {
      credentials: boolean;
      methods: string[];
    };
  };
  workflow: {
    statuses: typeof WORKFLOW_STATUSES;
    defaultStatus: typeof DEFAULT_WORKFLOW_STATUS;
    maxNameLength: typeof MAX_WORKFLOW_NAME_LENGTH;
    validateName: typeof validateWorkflowName;
    executionTimeout: number;
    maxConcurrentExecutions: number;
  };
  integration: {
    supportedProtocols: typeof SUPPORTED_PROTOCOLS;
    defaultTimeout: number;
    maxRetries: number;
    retryDelay: number;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    pool: {
      min: number;
      max: number;
    };
    ssl: boolean;
  };
  cache: {
    host: string;
    port: number;
    password: string;
    ttl: number;
  };
  queue: {
    url: string;
    prefetch: number;
    messageTimeout: number;
  };
  logging: {
    level: string;
    format: string;
    errorCode: typeof ERROR_CODES.InternalServerError;
  };
  monitoring: {
    enabled: boolean;
    metricsPort: number;
    healthCheckInterval: number;
  };
}

/**
 * Retrieves the application configuration settings based on the current environment
 * Addresses requirement: Defines core application settings and environment variables
 * 
 * @returns {AppConfig} The complete application configuration object
 */
export const getAppConfig = (): AppConfig => {
  // Base configuration common across all environments
  const baseConfig: AppConfig = {
    app: {
      name: APP_NAME,
      environment: ENVIRONMENT,
      version: process.env.APP_VERSION || '1.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT,
      apiPrefix: '/api/v1',
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      trustProxy: process.env.TRUST_PROXY === 'true'
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'development-secret',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: 12,
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      },
      cors: {
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      }
    },
    workflow: {
      statuses: WORKFLOW_STATUSES,
      defaultStatus: DEFAULT_WORKFLOW_STATUS,
      maxNameLength: MAX_WORKFLOW_NAME_LENGTH,
      validateName: validateWorkflowName,
      executionTimeout: 30 * 60 * 1000, // 30 minutes
      maxConcurrentExecutions: 100
    },
    integration: {
      supportedProtocols: SUPPORTED_PROTOCOLS,
      defaultTimeout: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000 // 1 second
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      name: process.env.DB_NAME || 'workflow_automation',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      pool: {
        min: 2,
        max: 10
      },
      ssl: process.env.DB_SSL === 'true'
    },
    cache: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
      password: process.env.REDIS_PASSWORD || '',
      ttl: 3600 // 1 hour
    },
    queue: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
      prefetch: 10,
      messageTimeout: 5 * 60 * 1000 // 5 minutes
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      errorCode: ERROR_CODES.InternalServerError
    },
    monitoring: {
      enabled: process.env.MONITORING_ENABLED === 'true',
      metricsPort: process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT, 10) : 9090,
      healthCheckInterval: 30000 // 30 seconds
    }
  };

  // Environment-specific overrides
  switch (ENVIRONMENT) {
    case 'production':
      return {
        ...baseConfig,
        security: {
          ...baseConfig.security,
          rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 1000 // Higher limit for production
          }
        },
        database: {
          ...baseConfig.database,
          pool: {
            min: 5,
            max: 50 // Larger connection pool for production
          }
        },
        monitoring: {
          ...baseConfig.monitoring,
          enabled: true // Always enabled in production
        }
      };

    case 'staging':
      return {
        ...baseConfig,
        security: {
          ...baseConfig.security,
          rateLimiting: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 500 // Moderate limit for staging
          }
        }
      };

    case 'test':
      return {
        ...baseConfig,
        database: {
          ...baseConfig.database,
          name: `${baseConfig.database.name}_test`
        },
        security: {
          ...baseConfig.security,
          rateLimiting: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 1000 // Higher limit for testing
          }
        }
      };

    default: // development
      return baseConfig;
  }
};