/**
 * Register page component implementation
 * Requirements addressed:
 * - User Registration Interface (Technical Specification/User Interface Design/Main Dashboard)
 *   Provides a user-friendly interface for users to register, ensuring secure and validated input handling.
 * 
 * Human Tasks:
 * 1. Verify password strength requirements with security team
 * 2. Configure CORS settings for registration endpoint
 * 3. Set up rate limiting for registration attempts
 * 4. Review error message content with UX team
 */

// react v18.2.0
import { useState, useEffect } from 'react';

// Internal imports
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { validateAuthData } from '../../utils/validation.util';
import { AUTH_CONFIG } from '../../config/auth.config';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

const RegisterPage: React.FC = () => {
  // Form data state
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: ''
  });

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Get register function from auth hook
  const { register } = useAuth();

  // Clear errors when input changes
  useEffect(() => {
    setErrors({});
  }, [formData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password (minimum 8 characters, at least one number and one special character)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain at least one number and one special character';
    }

    // Validate using auth data validator
    if (!validateAuthData({
      username: formData.username,
      password: formData.password,
      token: ''
    })) {
      newErrors.general = AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        username: formData.username,
        password: formData.password
      });

      if (!success) {
        setErrors({
          general: AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS
        });
      }
    } catch (error) {
      setErrors({
        general: AUTH_CONFIG.ERROR_MESSAGES.UNAUTHORIZED_ACCESS
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-form">
        <h1>Create Account</h1>
        
        {errors.general && (
          <div className="error-message" role="alert">
            {errors.general}
          </div>
        )}

        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleInputChange}
          isValid={!errors.username}
          required
        />
        {errors.username && (
          <div className="error-message" role="alert">
            {errors.username}
          </div>
        )}

        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          isValid={!errors.email}
          required
        />
        {errors.email && (
          <div className="error-message" role="alert">
            {errors.email}
          </div>
        )}

        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          isValid={!errors.password}
          required
        />
        {errors.password && (
          <div className="error-message" role="alert">
            {errors.password}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          isFullWidth
          disabled={isLoading}
        >
          Register
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;