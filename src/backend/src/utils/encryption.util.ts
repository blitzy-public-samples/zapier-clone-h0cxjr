/**
 * Human Tasks:
 * 1. Ensure proper key management system is in place for encryption keys
 * 2. Verify that secure random number generation is available in the deployment environment
 * 3. Configure proper key rotation policies and procedures
 * 4. Review and adjust encryption parameters based on security requirements
 * 5. Ensure secure storage of encryption keys in environment variables or key management system
 */

import { SECURITY_ALGORITHM } from '../config/security.config';
import { ERROR_CODES } from '../constants/error.constants';
import crypto from 'crypto'; // Node.js built-in

/**
 * Size of the initialization vector in bytes
 * Using 16 bytes (128 bits) as per crypto standards for AES
 */
const IV_LENGTH = 16;

/**
 * Validates the input parameters for encryption/decryption operations
 * @param data - The data to validate
 * @param key - The encryption/decryption key to validate
 * @throws Error if validation fails
 */
const validateInput = (data: string, key: string): void => {
  if (!data || typeof data !== 'string') {
    throw new Error(`${ERROR_CODES.InternalServerError}: Invalid data provided for encryption/decryption`);
  }
  if (!key || typeof key !== 'string') {
    throw new Error(`${ERROR_CODES.InternalServerError}: Invalid key provided for encryption/decryption`);
  }
};

/**
 * Encrypts the provided data using the specified encryption algorithm and key
 * Technical Specification Reference: Security Features - End-to-end encryption
 * 
 * @param data - The data to encrypt
 * @param key - The encryption key
 * @returns The encrypted data in base64 format with IV prepended
 * @throws Error if encryption fails
 */
export const encryptData = (data: string, key: string): string => {
  try {
    // Validate input parameters
    validateInput(data, key);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher instance with the specified algorithm
    const cipher = crypto.createCipheriv(
      SECURITY_ALGORITHM,
      Buffer.from(key),
      iv
    );

    // Encrypt the data
    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    // Combine IV and encrypted data and convert to base64
    const combined = Buffer.concat([iv, Buffer.from(encryptedData, 'base64')]);
    return combined.toString('base64');
  } catch (error) {
    throw new Error(
      `${ERROR_CODES.InternalServerError}: Encryption failed - ${(error as Error).message}`
    );
  }
};

/**
 * Decrypts the provided encrypted data using the specified decryption key
 * Technical Specification Reference: Security Features - End-to-end encryption
 * 
 * @param encryptedData - The encrypted data in base64 format with IV prepended
 * @param key - The decryption key
 * @returns The decrypted original data
 * @throws Error if decryption fails
 */
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    // Validate input parameters
    validateInput(encryptedData, key);

    // Decode the base64 input
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    // Extract the IV and encrypted content
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const encryptedContent = encryptedBuffer.slice(IV_LENGTH);

    // Create decipher instance with the specified algorithm
    const decipher = crypto.createDecipheriv(
      SECURITY_ALGORITHM,
      Buffer.from(key),
      iv
    );

    // Decrypt the data
    let decryptedData = decipher.update(encryptedContent);
    decryptedData = Buffer.concat([decryptedData, decipher.final()]);

    return decryptedData.toString('utf8');
  } catch (error) {
    throw new Error(
      `${ERROR_CODES.InternalServerError}: Decryption failed - ${(error as Error).message}`
    );
  }
};