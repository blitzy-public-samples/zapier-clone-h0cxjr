/**
 * Profile page component for managing user profile information
 * Requirements addressed:
 * - User Profile Management (Technical Specification/User Interface Design/Critical User Flows)
 *   Provides a user interface for managing profile information, including updating username,
 *   email, and password.
 * 
 * Human Tasks:
 * 1. Verify form validation rules with security team
 * 2. Test form accessibility with screen readers
 * 3. Review error message content with UX team
 * 4. Validate password complexity requirements
 */

// react v18.2.0
import React, { useState, useEffect } from 'react';

// Internal imports
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { validateAuthData } from '../../utils/validation.util';

interface ProfileFormData {
  username: string;
  email: string;
  password: string;
  newPassword: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  newPassword?: string;
}

const ProfilePage: React.FC = () => {
  // Get authentication context
  const { user, loading, error: authError } = useAuth();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    email: '',
    password: '',
    newPassword: ''
  });

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        username: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateAuthData({ 
      username: formData.username,
      password: 'temp',
      token: 'temp'
    })) {
      newErrors.username = 'Invalid username format';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate current password if new password is provided
    if (formData.newPassword && !formData.password) {
      newErrors.password = 'Current password is required to set new password';
    }

    // Validate new password if provided
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
        newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccess(false);

    try {
      if (!validateForm()) {
        return;
      }

      // TODO: Implement profile update API call here
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUpdateSuccess(true);
      if (formData.newPassword) {
        setFormData(prevData => ({
          ...prevData,
          password: '',
          newPassword: ''
        }));
      }
    } catch (error) {
      setErrors(prevErrors => ({
        ...prevErrors,
        submit: 'Failed to update profile. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (authError) {
    return <div>Error loading profile: {authError}</div>;
  }

  return (
    <div className="profile-page">
      <h1>Profile Settings</h1>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
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
            <span className="error-message">{errors.username}</span>
          )}
        </div>

        <div className="form-group">
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
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <Input
            type="password"
            name="password"
            placeholder="Current Password"
            value={formData.password}
            onChange={handleInputChange}
            isValid={!errors.password}
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        <div className="form-group">
          <Input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleInputChange}
            isValid={!errors.newPassword}
          />
          {errors.newPassword && (
            <span className="error-message">{errors.newPassword}</span>
          )}
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        {updateSuccess && (
          <div className="success-message">Profile updated successfully!</div>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Update Profile
        </Button>
      </form>

      <style jsx>{`
        .profile-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          margin-bottom: 2rem;
          color: ${theme.colors.textPrimary};
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .error-message {
          color: ${theme.colors.error};
          font-size: ${theme.fonts.sizes.sm};
        }

        .success-message {
          color: ${theme.colors.success};
          padding: 1rem;
          background-color: ${theme.colors.surface};
          border-radius: ${theme.borderRadius.base};
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;