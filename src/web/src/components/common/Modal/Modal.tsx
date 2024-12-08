/**
 * Modal Component
 * Implements requirements from Technical Specification/User Interface Design/Design System Specifications
 * 
 * Human Tasks:
 * 1. Verify modal accessibility with screen readers
 * 2. Test modal focus trap implementation
 * 3. Validate modal animations with UX team
 * 4. Review modal responsive behavior across breakpoints
 */

// react v18.2.0
import React, { useCallback, useEffect, useRef } from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

import { ModalContainer, ModalHeader, ModalBody, ModalFooter } from './Modal.styles';
import { Button } from '../Button/Button';
import { validateWorkflowData } from '../../utils/validation.util';
import { useTheme } from '../../hooks/useTheme';

interface ModalProps {
  /**
   * Title displayed in the modal header
   */
  title: string;
  
  /**
   * Content to be rendered inside the modal body
   */
  children: React.ReactNode;
  
  /**
   * Array of action buttons to be displayed in the footer
   */
  footerActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
    disabled?: boolean;
  }>;
  
  /**
   * Controls modal visibility
   */
  isOpen: boolean;
  
  /**
   * Callback function when modal is closed
   */
  onClose: () => void;
  
  /**
   * Optional workflow data for validation
   */
  workflowData?: any;
  
  /**
   * Optional CSS class name for additional styling
   */
  className?: string;
  
  /**
   * Optional flag to disable close on overlay click
   */
  disableOverlayClick?: boolean;
  
  /**
   * Optional flag to disable close on escape key
   */
  disableEscapeKey?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  footerActions = [],
  isOpen,
  onClose,
  workflowData,
  className = '',
  disableOverlayClick = false,
  disableEscapeKey = false
}) => {
  // Get theme configuration
  const theme = useTheme();
  
  // Reference to modal content for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (!disableEscapeKey && event.key === 'Escape') {
      onClose();
    }
  }, [disableEscapeKey, onClose]);
  
  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  // Validate workflow data if provided
  useEffect(() => {
    if (workflowData && !validateWorkflowData(workflowData)) {
      console.error('Invalid workflow data provided to modal');
    }
  }, [workflowData]);
  
  // Add event listeners for keyboard interaction
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey]);
  
  // Focus trap implementation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <ModalContainer
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={className}
      onClick={handleOverlayClick}
      style={{ zIndex: theme.zIndex?.modal || 1040 }}
    >
      <div ref={modalRef} className="modal-content">
        <ModalHeader>
          <h2 id="modal-title">{title}</h2>
          <Button
            variant="secondary"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </Button>
        </ModalHeader>
        
        <ModalBody>
          {children}
        </ModalBody>
        
        {footerActions.length > 0 && (
          <ModalFooter>
            {footerActions.map((action, index) => (
              <Button
                key={`modal-action-${index}`}
                variant={action.variant || 'secondary'}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </ModalFooter>
        )}
      </div>
    </ModalContainer>
  );
};

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footerActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary', 'accent']),
      disabled: PropTypes.bool
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  workflowData: PropTypes.any,
  className: PropTypes.string,
  disableOverlayClick: PropTypes.bool,
  disableEscapeKey: PropTypes.bool
};