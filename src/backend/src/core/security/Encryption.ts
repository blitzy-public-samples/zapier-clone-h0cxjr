/**
 * Human Tasks:
 * 1. Ensure proper key management system is in place for encryption keys
 * 2. Verify secure random number generation is available in deployment environment
 * 3. Configure key rotation policies and procedures
 * 4. Review and adjust encryption parameters based on security requirements
 * 5. Ensure secure storage of encryption keys in environment variables or key management system
 */

import { SECURITY_ALGORITHM } from '../../config/security.config';
import { encryptData, decryptData } from '../../utils/encryption.util';
import { ERROR_CODES } from '../../constants/error.constants';
import crypto from 'crypto'; // Node.js built-in

/**
 * A class that encapsulates encryption and decryption functionalities for secure data handling.
 * Technical Specification Reference: Security Features - End-to-end encryption
 */
export class Encryption {
  private algorithm: string;

  /**
   * Initializes the Encryption class with the specified encryption algorithm.
   */
  constructor() {
    this.algorithm = SECURITY_ALGORITHM;
  }

  /**
   * Encrypts the provided data using the specified key.
   * Technical Specification Reference: Security Features - End-to-end encryption
   * 
   * @param data - The data to be encrypted
   * @param key - The encryption key
   * @returns The encrypted data in base64 format
   * @throws Error if encryption fails or input validation fails
   */
  public encrypt(data: string, key: string): string {
    try {
      // Input validation
      if (!data || typeof data !== 'string') {
        throw new Error(`${ERROR_CODES.InternalServerError}: Invalid data provided for encryption`);
      }
      if (!key || typeof key !== 'string') {
        throw new Error(`${ERROR_CODES.InternalServerError}: Invalid key provided for encryption`);
      }

      // Perform encryption using the utility function
      return encryptData(data, key);
    } catch (error) {
      // Rethrow the error with appropriate error code
      throw new Error(
        `${ERROR_CODES.InternalServerError}: Encryption failed - ${(error as Error).message}`
      );
    }
  }

  /**
   * Decrypts the provided encrypted data using the specified key.
   * Technical Specification Reference: Security Features - End-to-end encryption
   * 
   * @param encryptedData - The encrypted data in base64 format
   * @param key - The decryption key
   * @returns The decrypted original data
   * @throws Error if decryption fails or input validation fails
   */
  public decrypt(encryptedData: string, key: string): string {
    try {
      // Input validation
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error(`${ERROR_CODES.InternalServerError}: Invalid encrypted data provided for decryption`);
      }
      if (!key || typeof key !== 'string') {
        throw new Error(`${ERROR_CODES.InternalServerError}: Invalid key provided for decryption`);
      }

      // Perform decryption using the utility function
      return decryptData(encryptedData, key);
    } catch (error) {
      // Rethrow the error with appropriate error code
      throw new Error(
        `${ERROR_CODES.InternalServerError}: Decryption failed - ${(error as Error).message}`
      );
    }
  }
}