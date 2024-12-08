/**
 * Forgot Password page component
 * Requirements addressed:
 * - Forgot Password Functionality (Technical Specification/System Design/User Interface Design)
 *   Provides a user interface and functionality for users to reset their password by submitting their email address.
 * 
 * Human Tasks:
 * 1. Verify email service configuration for password reset emails
 * 2. Test email delivery and spam folder placement
 * 3. Review password reset email template content
 * 4. Validate rate limiting for password reset requests
 */

// react v18.2.0
import React, { useState, useEffect } from 'react';

// Internal imports
import { validateAuthData } from '../../utils/validation.util';
import { AUTH_ERROR_MESSAGES } from '../../constants/auth.constants';
import { sendPasswordResetEmail } from '../../services/auth.service';
import Input from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';

const ForgotPassword: React.FC = () => {
  // State management
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      setEmail('');
      setIsSubmitting(false);
      setShowModal(false);
      setModalMessage('');
      setIsSuccess(false);
    };
  }, []);

  // Handle email input change
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate email
    if (!validateAuthData({ username: email, password: 'dummy', token: 'dummy' })) {
      setModalMessage('Please enter a valid email address.');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send password reset email
      await sendPasswordResetEmail(email);
      
      // Show success message
      setModalMessage('Password reset instructions have been sent to your email address.');
      setIsSuccess(true);
      setEmail('');
    } catch (error) {
      // Handle errors
      setModalMessage(
        error.message === AUTH_ERROR_MESSAGES.TOKEN_EXPIRED
          ? AUTH_ERROR_MESSAGES.TOKEN_EXPIRED
          : AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
      );
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
      setShowModal(true);
    }
  };

  // Modal actions
  const modalActions = [
    {
      label: 'Close',
      onClick: () => setShowModal(false),
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="forgot-password-container">
      <h1>Forgot Password</h1>
      <p>Enter your email address to receive password reset instructions.</p>

      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting}
          required
          name="email"
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          isFullWidth
        >
          Reset Password
        </Button>
      </form>

      <Modal
        title={isSuccess ? 'Success' : 'Error'}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        footerActions={modalActions}
      >
        {modalMessage}
      </Modal>

      <style jsx>{`
        .forgot-password-container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          text-align: center;
        }

        h1 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        p {
          margin-bottom: 2rem;
          color: #6B7280;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;