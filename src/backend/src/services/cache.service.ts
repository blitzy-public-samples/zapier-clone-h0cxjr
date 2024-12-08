/**
 * @fileoverview Cache service implementation using Redis for optimized data storage and retrieval
 * Addresses requirement: Cache Management from Technical Specification/System Design/Data Storage Components
 * 
 * Human Tasks:
 * 1. Configure Redis cluster settings in production environment
 * 2. Set up Redis monitoring and alerting thresholds
 * 3. Review and adjust cache TTL values based on application usage patterns
 * 4. Ensure proper network security rules for Redis access
 * 5. Configure Redis persistence settings based on data durability requirements
 */

// Third-party imports
import Redis from 'ioredis'; // v5.3.2

// Internal imports
import { createCacheClient } from '../config/cache.config';
import { encryptData, decryptData } from '../utils/encryption.util';
import { logInfo, logError } from '../utils/logger.util';

/**
 * Sets a value in the cache with an optional time-to-live (TTL)
 * Addresses requirement: Cache Management - Implements secure data storage in cache
 * 
 * @param key - The key under which to store the value
 * @param value - The value to be stored
 * @param ttl - Optional time-to-live in seconds
 * @returns Promise<boolean> indicating whether the operation was successful
 */
export const setCache = async (
  key: string,
  value: string,
  ttl?: number
): Promise<boolean> => {
  try {
    // Input validation
    if (!key || !value) {
      throw new Error('Key and value are required for cache storage');
    }

    // Get Redis client instance
    const redisClient: Redis = createCacheClient();

    // Encrypt the value before storage
    const encryptedValue = encryptData(value, process.env.CACHE_ENCRYPTION_KEY || '');

    // Store the encrypted value with optional TTL
    if (ttl && ttl > 0) {
      await redisClient.setex(key, ttl, encryptedValue);
    } else {
      await redisClient.set(key, encryptedValue);
    }

    logInfo('Cache value set successfully', {
      key,
      ttl: ttl || 'indefinite',
      operation: 'setCache'
    });

    return true;
  } catch (error) {
    logError('Failed to set cache value', {
      key,
      error: (error as Error).message,
      operation: 'setCache'
    });
    return false;
  }
};

/**
 * Retrieves a value from the cache by its key
 * Addresses requirement: Cache Management - Implements secure data retrieval from cache
 * 
 * @param key - The key of the value to retrieve
 * @returns Promise<string | null> The decrypted value or null if not found
 */
export const getCache = async (key: string): Promise<string | null> => {
  try {
    // Input validation
    if (!key) {
      throw new Error('Key is required for cache retrieval');
    }

    // Get Redis client instance
    const redisClient: Redis = createCacheClient();

    // Retrieve the encrypted value
    const encryptedValue = await redisClient.get(key);

    if (!encryptedValue) {
      logInfo('Cache miss', {
        key,
        operation: 'getCache'
      });
      return null;
    }

    // Decrypt the value before returning
    const decryptedValue = decryptData(encryptedValue, process.env.CACHE_ENCRYPTION_KEY || '');

    logInfo('Cache hit', {
      key,
      operation: 'getCache'
    });

    return decryptedValue;
  } catch (error) {
    logError('Failed to retrieve cache value', {
      key,
      error: (error as Error).message,
      operation: 'getCache'
    });
    return null;
  }
};

/**
 * Deletes a value from the cache by its key
 * Addresses requirement: Cache Management - Implements cache entry removal
 * 
 * @param key - The key of the value to delete
 * @returns Promise<boolean> indicating whether the operation was successful
 */
export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    // Input validation
    if (!key) {
      throw new Error('Key is required for cache deletion');
    }

    // Get Redis client instance
    const redisClient: Redis = createCacheClient();

    // Delete the key from cache
    const result = await redisClient.del(key);

    logInfo('Cache value deleted', {
      key,
      operation: 'deleteCache',
      found: result > 0
    });

    return result > 0;
  } catch (error) {
    logError('Failed to delete cache value', {
      key,
      error: (error as Error).message,
      operation: 'deleteCache'
    });
    return false;
  }
};