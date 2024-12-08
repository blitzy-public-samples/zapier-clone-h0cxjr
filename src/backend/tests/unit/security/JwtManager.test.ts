/**
 * Human Tasks:
 * 1. Ensure test environment variables are properly configured
 * 2. Verify that JWT_SECRET is set in the test environment
 * 3. Configure test-specific issuer and audience values if needed
 */

import { generateToken, validateToken, decodeToken } from '../../../src/core/security/JwtManager';
import { encryptData, decryptData } from '../../../src/utils/encryption.util';
import { getAuthConfig } from '../../../src/config/auth.config';

// jest v29.0.0
describe('JwtManager', () => {
  // Test data
  const testPayload = {
    userId: '123',
    email: 'test@example.com',
    roles: ['user'],
    sensitiveInfo: {
      accountNumber: '1234567890'
    }
  };

  const authConfig = getAuthConfig();

  /**
   * Tests the generateToken function to ensure it creates valid JWTs
   * Technical Specification Reference: Authentication Management
   * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
   */
  describe('generateToken', () => {
    it('should generate a valid JWT with the correct structure', () => {
      const token = generateToken(testPayload);
      
      // Verify token is a non-empty string
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      
      // Verify token has three parts (header.payload.signature)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should encrypt sensitive information in the payload', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);
      
      // Verify sensitive info is encrypted
      expect(decoded.sensitiveInfo).not.toEqual(testPayload.sensitiveInfo);
      expect(typeof decoded.sensitiveInfo).toBe('string');
    });

    it('should include required JWT claims', () => {
      const token = generateToken(testPayload);
      const decoded = decodeToken(token);
      
      // Verify standard JWT claims
      expect(decoded).toHaveProperty('iat');
      expect(decoded.iss).toBe(authConfig.jwt.issuer);
      expect(decoded.aud).toBe(authConfig.jwt.audience);
      expect(decoded).toHaveProperty('exp');
    });

    it('should throw error for invalid payload', () => {
      expect(() => generateToken(null as any)).toThrow();
      expect(() => generateToken(undefined as any)).toThrow();
    });
  });

  /**
   * Tests the validateToken function to ensure it correctly validates JWTs
   * Technical Specification Reference: Authentication Management
   * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
   */
  describe('validateToken', () => {
    let validToken: string;

    beforeEach(() => {
      validToken = generateToken(testPayload);
    });

    it('should successfully validate a legitimate token', () => {
      const validated = validateToken(validToken);
      
      // Verify payload contents
      expect(validated.userId).toBe(testPayload.userId);
      expect(validated.email).toBe(testPayload.email);
      expect(validated.roles).toEqual(testPayload.roles);
    });

    it('should decrypt sensitive information during validation', () => {
      const validated = validateToken(validToken);
      
      // Verify sensitive info is decrypted correctly
      expect(validated.sensitiveInfo).toEqual(testPayload.sensitiveInfo);
    });

    it('should throw error for expired tokens', () => {
      // Create token with expired timestamp
      const expiredPayload = {
        ...testPayload,
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600  // 1 hour ago
      };
      const expiredToken = generateToken(expiredPayload);
      
      expect(() => validateToken(expiredToken)).toThrow(/Token expired/);
    });

    it('should throw error for invalid token format', () => {
      expect(() => validateToken('invalid.token.format')).toThrow();
      expect(() => validateToken('')).toThrow();
      expect(() => validateToken('not.a.token')).toThrow();
    });

    it('should throw error for tampered tokens', () => {
      // Modify the token payload
      const parts = validToken.split('.');
      parts[1] = Buffer.from(JSON.stringify({ ...testPayload, userId: 'hacked' })).toString('base64');
      const tamperedToken = parts.join('.');
      
      expect(() => validateToken(tamperedToken)).toThrow();
    });
  });

  /**
   * Tests the decodeToken function to ensure it correctly decodes JWTs
   * Technical Specification Reference: Authentication Management
   * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
   */
  describe('decodeToken', () => {
    let validToken: string;

    beforeEach(() => {
      validToken = generateToken(testPayload);
    });

    it('should decode token without validation', () => {
      const decoded = decodeToken(validToken);
      
      // Verify payload contents without validation
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.roles).toEqual(testPayload.roles);
    });

    it('should decode tampered tokens without error', () => {
      // Modify the token payload
      const parts = validToken.split('.');
      parts[1] = Buffer.from(JSON.stringify({ ...testPayload, userId: 'modified' })).toString('base64');
      const tamperedToken = parts.join('.');
      
      const decoded = decodeToken(tamperedToken);
      expect(decoded.userId).toBe('modified');
    });

    it('should throw error for invalid token format', () => {
      expect(() => decodeToken('')).toThrow();
      expect(() => decodeToken('not.a.valid.token')).toThrow();
      expect(() => decodeToken('invalid')).toThrow();
    });

    it('should handle tokens with encrypted data', () => {
      const decoded = decodeToken(validToken);
      
      // Verify encrypted data is preserved in encoded form
      expect(typeof decoded.sensitiveInfo).toBe('string');
      expect(decoded.sensitiveInfo).not.toEqual(testPayload.sensitiveInfo);
    });
  });
});