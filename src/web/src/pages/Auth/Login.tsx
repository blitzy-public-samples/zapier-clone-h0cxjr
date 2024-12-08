/**
 * Login page component implementation
 * Requirements addressed:
 * - Authentication Management (Technical Specification/System Design/Security Architecture)
 *   Provides a user interface for users to log in, including input validation and 
 *   integration with the authentication system.
 * 
 * Human Tasks:
 * 1. Verify form submission handling with backend API endpoints
 * 2. Test error message display and validation feedback
 * 3. Review accessibility of form elements with screen readers
 * 4. Validate password field security requirements
 */

// react v18.2.0
import React, { useState, useEffect } from 'react';

// Internal imports
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { validateAuthData } from '../../utils/validation.util';
import { AUTH_CONFIG } from '../../config/auth.config';

const LoginPage: React.FC = () => {
  // State management for form fields and validation
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get authentication functions from useAuth hook
  const { login, error: authError } = useAuth();

  // Clear error message when inputs change
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage('');
      setIsValid(true);
    }
  }, [username, password]);

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    const isValidData = validateAuthData({
      username,
      password,
      token: 'dummy-token' // Token is required by validation but not needed for login
    });

    if (!isValidData) {
      setIsValid(false);
      setErrorMessage(AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS);
      return;
    }

    try {
      setIsLoading(true);
      const success = await login({ username, password });
      
      if (!success) {
        setIsValid(false);
        setErrorMessage(AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage(AUTH_CONFIG.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Login</h1>
        
        {/* Username input field */}
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          isValid={isValid}
          required
        />

        {/* Password input field */}
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          isValid={isValid}
          required
        />

        {/* Error message display */}
        {(errorMessage || authError) && (
          <div className="error-message" role="alert">
            {errorMessage || authError}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          isFullWidth
          disabled={!username || !password || isLoading}
        >
          Log In
        </Button>
      </form>

      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 1rem;
          background-color: #f9fafb;
        }

        .login-form {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        h1 {
          margin-bottom: 2rem;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .error-message {
          margin: 1rem 0;
          padding: 0.75rem;
          border-radius: 0.375rem;
          background-color: #fee2e2;
          color: #dc2626;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;