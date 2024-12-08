/**
 * @fileoverview Cache configuration for the backend application
 * Addresses requirement: Cache Configuration from Technical Specification/System Design/Data Storage Components
 * 
 * Human Tasks:
 * 1. Configure Redis cluster settings in production environment
 * 2. Set up Redis sentinel for high availability if required
 * 3. Configure Redis persistence settings based on data durability requirements
 * 4. Review and adjust cache TTL values based on application usage patterns
 * 5. Set up Redis monitoring and alerting thresholds
 */

// Third-party imports
import Redis from 'ioredis'; // v5.3.2

// Internal imports
import { APP_CONFIG } from './app.config';
import { DEFAULT_LOG_LEVEL } from './logger.config';
import { encryptData } from '../utils/encryption.util';
import { logInfo } from '../utils/logger.util';
import { ERROR_CODES } from '../constants/error.constants';

// Cache configuration constants
const CACHE_TTL = 3600; // Default TTL in seconds
const REDIS_HOST = 'localhost';
const REDIS_PORT = 6379;

/**
 * Creates and configures a Redis client instance for caching operations
 * Addresses requirement: Defines centralized caching configuration
 * 
 * @returns {Redis} Configured Redis client instance
 */
export const createCacheClient = (): Redis => {
  try {
    // Configure Redis client options based on environment
    const redisOptions: Redis.RedisOptions = {
      host: process.env.REDIS_HOST || REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => {
        // Exponential backoff with max delay of 30 seconds
        const delay = Math.min(times * 1000, 30000);
        return delay;
      },
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      // Enable TLS in production environment
      tls: APP_CONFIG.ENVIRONMENT === 'production' ? {
        rejectUnauthorized: true
      } : undefined,
      // Configure connection events logging
      lazyConnect: true
    };

    // Create Redis client instance
    const redisClient = new Redis(redisOptions);

    // Set up event handlers
    redisClient.on('connect', () => {
      logInfo('Redis client connected successfully', {
        host: redisOptions.host,
        port: redisOptions.port,
        environment: APP_CONFIG.ENVIRONMENT
      });
    });

    redisClient.on('error', (error: Error) => {
      logInfo('Redis client error occurred', {
        error: error.message,
        errorCode: ERROR_CODES.InternalServerError,
        environment: APP_CONFIG.ENVIRONMENT
      });
    });

    redisClient.on('ready', () => {
      logInfo('Redis client ready for operations', {
        environment: APP_CONFIG.ENVIRONMENT
      });
    });

    // Configure client commands for sensitive data
    const originalSet = redisClient.set.bind(redisClient);
    redisClient.set = async function(key: string, value: string, ...args: any[]): Promise<any> {
      // Encrypt sensitive data in production
      if (APP_CONFIG.ENVIRONMENT === 'production' && typeof value === 'string') {
        const encryptionKey = process.env.CACHE_ENCRYPTION_KEY;
        if (encryptionKey) {
          value = encryptData(value, encryptionKey);
        }
      }
      return originalSet(key, value, ...args);
    };

    return redisClient;
  } catch (error) {
    logInfo('Failed to create Redis client', {
      error: (error as Error).message,
      errorCode: ERROR_CODES.InternalServerError,
      environment: APP_CONFIG.ENVIRONMENT
    });
    throw error;
  }
};