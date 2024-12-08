// @jest version 29.0.0

import { Encryption } from '../../../src/core/security/Encryption';
import { encryptData, decryptData } from '../../../src/utils/encryption.util';
import { SECURITY_ALGORITHM } from '../../../src/config/security.config';
import { ERROR_CODES } from '../../../src/constants/error.constants';

/**
 * Unit tests for the Encryption class
 * Technical Specification Reference: Security Features - End-to-end encryption
 */
describe('Encryption Class Unit Tests', () => {
  let encryption: Encryption;
  const testData = 'sensitive test data';
  const validKey = 'valid-encryption-key-123';
  const invalidKey = 'invalid-key';

  beforeEach(() => {
    encryption = new Encryption();
  });

  describe('encrypt Method', () => {
    it('should successfully encrypt data with a valid key', () => {
      // Test encryption functionality
      const encryptedData = encryption.encrypt(testData, validKey);

      // Verify encrypted data is not null and is a string
      expect(encryptedData).toBeDefined();
      expect(typeof encryptedData).toBe('string');
      expect(encryptedData.length).toBeGreaterThan(0);

      // Verify the encrypted data is in base64 format
      expect(() => Buffer.from(encryptedData, 'base64')).not.toThrow();
    });

    it('should throw error when data is null or undefined', () => {
      expect(() => encryption.encrypt(null as any, validKey)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid data provided for encryption`
      );
      expect(() => encryption.encrypt(undefined as any, validKey)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid data provided for encryption`
      );
    });

    it('should throw error when key is null or undefined', () => {
      expect(() => encryption.encrypt(testData, null as any)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid key provided for encryption`
      );
      expect(() => encryption.encrypt(testData, undefined as any)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid key provided for encryption`
      );
    });

    it('should produce different encrypted outputs for same input', () => {
      const firstEncryption = encryption.encrypt(testData, validKey);
      const secondEncryption = encryption.encrypt(testData, validKey);
      expect(firstEncryption).not.toBe(secondEncryption);
    });
  });

  describe('decrypt Method', () => {
    it('should successfully decrypt encrypted data with the correct key', () => {
      // First encrypt the data
      const encryptedData = encryption.encrypt(testData, validKey);

      // Then decrypt it
      const decryptedData = encryption.decrypt(encryptedData, validKey);

      // Verify the decrypted data matches the original
      expect(decryptedData).toBe(testData);
    });

    it('should throw error when encrypted data is null or undefined', () => {
      expect(() => encryption.decrypt(null as any, validKey)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid encrypted data provided for decryption`
      );
      expect(() => encryption.decrypt(undefined as any, validKey)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid encrypted data provided for decryption`
      );
    });

    it('should throw error when key is null or undefined', () => {
      const encryptedData = encryption.encrypt(testData, validKey);
      expect(() => encryption.decrypt(encryptedData, null as any)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid key provided for decryption`
      );
      expect(() => encryption.decrypt(encryptedData, undefined as any)).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid key provided for decryption`
      );
    });
  });

  describe('Invalid Key Handling', () => {
    it('should throw error when decrypting with incorrect key', () => {
      // First encrypt the data with valid key
      const encryptedData = encryption.encrypt(testData, validKey);

      // Attempt to decrypt with invalid key
      expect(() => encryption.decrypt(encryptedData, invalidKey)).toThrow(
        `${ERROR_CODES.InternalServerError}: Decryption failed`
      );
    });

    it('should throw error when decrypting with empty key', () => {
      const encryptedData = encryption.encrypt(testData, validKey);
      expect(() => encryption.decrypt(encryptedData, '')).toThrow(
        `${ERROR_CODES.InternalServerError}: Invalid key provided for decryption`
      );
    });

    it('should throw error when decrypting malformed encrypted data', () => {
      expect(() => encryption.decrypt('invalid-base64-data', validKey)).toThrow(
        `${ERROR_CODES.InternalServerError}: Decryption failed`
      );
    });
  });

  describe('End-to-End Encryption Flow', () => {
    it('should maintain data integrity through encryption and decryption cycle', () => {
      const testCases = [
        'Simple text',
        'Special chars: !@#$%^&*()',
        'Unicode: 你好世界',
        JSON.stringify({ key: 'value', nested: { data: true } }),
        'A'.repeat(1000) // Large string
      ];

      testCases.forEach(testCase => {
        const encryptedData = encryption.encrypt(testCase, validKey);
        const decryptedData = encryption.decrypt(encryptedData, validKey);
        expect(decryptedData).toBe(testCase);
      });
    });
  });
});