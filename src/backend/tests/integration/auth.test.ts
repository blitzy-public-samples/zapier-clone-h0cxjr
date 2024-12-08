/**
 * Human Tasks:
 * 1. Ensure test database is properly configured and accessible
 * 2. Configure test environment variables for authentication settings
 * 3. Set up test data cleanup procedures
 * 4. Verify test coverage requirements are met
 */

import request from 'supertest'; // v6.3.3
import { register, login, verify } from '../../src/api/controllers/auth.controller';
import authRoutes from '../../src/api/routes/auth.routes';
import { validateAuthToken } from '../../src/api/validators/auth.validator';
import { getAuthConfig } from '../../src/config/auth.config';
import express from 'express'; // v4.18.2

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

/**
 * Authentication Integration Tests
 * Technical Specification Reference: Authentication Management
 * Location: Technical Specification/Core Features and Functionalities/Integration Capabilities
 */
describe('Authentication Integration Tests', () => {
  // Test user data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test@123456',
    roles: ['user']
  };

  let authToken: string;

  /**
   * User Registration Tests
   * Tests the user registration endpoint functionality
   */
  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', testUser.username);
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('roles');
      expect(response.body.user.roles).toContain('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail to register user with existing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('email already exists');
    });

    it('should fail to register user with invalid data', async () => {
      const invalidUser = {
        username: 'te',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'REGISTRATION_ERROR');
    });
  });

  /**
   * User Login Tests
   * Tests the user login endpoint functionality
   */
  describe('POST /auth/login', () => {
    it('should successfully login user and return JWT token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('roles');
      expect(response.body.user).not.toHaveProperty('password');

      // Store token for subsequent tests
      authToken = response.body.token;

      // Validate token format and expiration
      const authConfig = getAuthConfig();
      expect(() => validateAuthToken({
        token: authToken,
        expiresAt: new Date(Date.now() + authConfig.jwt.expirationTime)
      })).not.toThrow();
    });

    it('should fail to login with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Invalid email or password');
    });
  });

  /**
   * Token Verification Tests
   * Tests the token verification endpoint functionality
   */
  describe('GET /auth/verify', () => {
    it('should successfully verify valid JWT token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Token is valid');
      expect(response.body).toHaveProperty('decoded');
      expect(response.body.decoded).toHaveProperty('user');
      expect(response.body.decoded.user).toHaveProperty('email', testUser.email);
      expect(response.body.decoded.user).toHaveProperty('roles');
      expect(response.body.decoded.user).toHaveProperty('permissions');
    });

    it('should fail to verify with invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_VERIFICATION_ERROR');
    });

    it('should fail to verify without token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_VERIFICATION_ERROR');
      expect(response.body.error.message).toContain('No token provided');
    });

    it('should fail to verify expired token', async () => {
      // Create an expired token
      const expiredToken = 'expired.token.here';

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_VERIFICATION_ERROR');
      expect(response.body.error.message).toContain('Token has expired');
    });
  });
});