/**
 * End-to-end tests for authentication functionalities
 * Requirements addressed:
 * - Authentication Management (Technical Specification/System Design/Security Architecture)
 *   Ensures the authentication system functions correctly through comprehensive end-to-end testing.
 * 
 * Human Tasks:
 * 1. Configure test environment variables for authentication endpoints
 * 2. Set up test database with sample user data
 * 3. Review test coverage with security team
 * 4. Verify error message content with UX team
 */

// cypress v12.17.0
import { defineConfig } from 'cypress';

// Internal imports
import LoginPage from '../../src/pages/Auth/Login';
import RegisterPage from '../../src/pages/Auth/Register';
import ForgotPassword from '../../src/pages/Auth/ForgotPassword';
import PublicRoute from '../../src/routes/PublicRoute';
import { login, logout, validateToken } from '../../src/services/auth.service';
import { validateAuthData } from '../../src/utils/validation.util';

// Test data
const testUser = {
  username: 'testuser@example.com',
  password: 'Test@123!',
  invalidPassword: 'wrongpassword'
};

describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Intercept auth-related API requests
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    cy.intercept('POST', '/api/auth/register').as('registerRequest');
    cy.intercept('POST', '/api/auth/forgot-password').as('forgotPasswordRequest');
  });

  describe('Login Flow', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display login form with required fields', () => {
      cy.get('input[name="username"]').should('exist');
      cy.get('input[name="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();
      cy.get('[role="alert"]').should('be.visible');
    });

    it('should successfully log in with valid credentials', () => {
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });

      // Verify redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Verify auth token is stored
      cy.window().then((window) => {
        expect(window.localStorage.getItem('auth_token')).to.exist;
      });
    });

    it('should show error message for invalid credentials', () => {
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.invalidPassword);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response?.statusCode).to.equal(401);
      });

      cy.get('[role="alert"]').should('be.visible')
        .and('contain', 'Invalid username or password');
    });

    it('should disable form submission while loading', () => {
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();

      // Verify button is disabled during submission
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Registration Flow', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should display registration form with required fields', () => {
      cy.get('input[name="username"]').should('exist');
      cy.get('input[name="email"]').should('exist');
      cy.get('input[name="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.get('[role="alert"]').should('contain', 'Please enter a valid email address');
    });

    it('should validate password requirements', () => {
      cy.get('input[name="password"]').type('weak');
      cy.get('button[type="submit"]').click();
      cy.get('[role="alert"]').should('contain', 'Password must be at least 8 characters');
    });

    it('should successfully register with valid data', () => {
      const newUser = {
        username: `test${Date.now()}@example.com`,
        email: `test${Date.now()}@example.com`,
        password: 'Test@123!'
      };

      cy.get('input[name="username"]').type(newUser.username);
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest').then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
      });

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });

    it('should show error for existing username', () => {
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="email"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest').then((interception) => {
        expect(interception.response?.statusCode).to.equal(409);
      });

      cy.get('[role="alert"]').should('contain', 'Username already exists');
    });
  });

  describe('Forgot Password Flow', () => {
    beforeEach(() => {
      cy.visit('/forgot-password');
    });

    it('should display forgot password form', () => {
      cy.get('input[name="email"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.get('[role="alert"]').should('contain', 'Please enter a valid email address');
    });

    it('should handle successful password reset request', () => {
      cy.get('input[name="email"]').type(testUser.username);
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPasswordRequest').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });

      // Verify success message
      cy.get('.modal-content').should('contain', 'Password reset instructions have been sent');
    });

    it('should handle non-existent email', () => {
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPasswordRequest').then((interception) => {
        expect(interception.response?.statusCode).to.equal(404);
      });

      cy.get('[role="alert"]').should('contain', 'No account found with this email');
    });
  });

  describe('Authentication Token Management', () => {
    it('should handle expired tokens', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();

      // Simulate token expiration
      cy.window().then((window) => {
        const expiredToken = 'expired.token.here';
        window.localStorage.setItem('auth_token', expiredToken);
      });

      // Attempt to access protected route
      cy.visit('/dashboard');

      // Should be redirected to login
      cy.url().should('include', '/login');
    });

    it('should handle logout', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();

      // Perform logout
      cy.get('[data-testid="logout-button"]').click();

      // Verify token is removed
      cy.window().then((window) => {
        expect(window.localStorage.getItem('auth_token')).to.be.null;
      });

      // Should be redirected to login
      cy.url().should('include', '/login');
    });
  });
});