/**
 * Tooltip component for displaying contextual information on hover/focus
 * Requirements addressed:
 * - Design System Specifications (Technical Specification/User Interface Design/Design System Specifications)
 *   Implements a reusable tooltip component that adheres to the design system guidelines
 * 
 * Human Tasks:
 * 1. Verify tooltip positioning behavior across different viewport sizes
 * 2. Test keyboard accessibility with screen readers
 * 3. Validate tooltip content rendering with different text lengths
 */

// react v18.2.0
import React, { useState, useRef, useEffect } from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

// Internal imports
import { tooltipContainer, tooltipArrow } from './Tooltip.styles';
import { validateAuthData } from '../../utils/validation.util';
import { themeConstants } from '../../constants/theme.constants';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /**
   * Content to be displayed in the tooltip
   */
  content: string | React.ReactNode;
  
  /**
   * Position of the tooltip relative to the trigger element
   */
  position?: TooltipPosition;
  
  /**
   * Element that triggers the tooltip
   */
  children: React.ReactElement;
  
  /**
   * Optional className for additional styling
   */
  className?: string;
  
  /**
   * Optional delay before showing tooltip (in ms)
   */
  showDelay?: number;
  
  /**
   * Optional delay before hiding tooltip (in ms)
   */
  hideDelay?: number;
  
  /**
   * Whether the tooltip is disabled
   */
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className = '',
  showDelay = 200,
  hideDelay = 150,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Validate content if it's a string
  useEffect(() => {
    if (typeof content === 'string') {
      const isValid = validateAuthData({ username: content, password: '', token: '' });
      if (!isValid) {
        console.warn('Invalid tooltip content format');
      }
    }
  }, [content]);

  const handleShow = () => {
    if (disabled) return;
    
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  };

  const handleHide = () => {
    if (disabled) return;
    
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Position tooltip relative to trigger element
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipElement = tooltipRef.current;
      const triggerElement = triggerRef.current;
      const triggerRect = triggerElement.getBoundingClientRect();
      
      const positions = {
        top: {
          top: triggerRect.top - tooltipElement.offsetHeight - 8,
          left: triggerRect.left + (triggerRect.width - tooltipElement.offsetWidth) / 2
        },
        bottom: {
          top: triggerRect.bottom + 8,
          left: triggerRect.left + (triggerRect.width - tooltipElement.offsetWidth) / 2
        },
        left: {
          top: triggerRect.top + (triggerRect.height - tooltipElement.offsetHeight) / 2,
          left: triggerRect.left - tooltipElement.offsetWidth - 8
        },
        right: {
          top: triggerRect.top + (triggerRect.height - tooltipElement.offsetHeight) / 2,
          left: triggerRect.right + 8
        }
      };

      Object.assign(tooltipElement.style, {
        top: `${positions[position].top}px`,
        left: `${positions[position].left}px`
      });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <div
        ref={tooltipRef}
        css={[
          tooltipContainer,
          {
            backgroundColor: themeConstants.primaryColor,
            color: '#FFFFFF'
          }
        ]}
        className={`${className} ${position} ${isVisible ? 'visible' : ''}`}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {content}
        <div
          css={[
            tooltipArrow,
            {
              backgroundColor: themeConstants.primaryColor
            }
          ]}
          className={position}
        />
      </div>
    </>
  );
};

Tooltip.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
  showDelay: PropTypes.number,
  hideDelay: PropTypes.number,
  disabled: PropTypes.bool
};

export default Tooltip;